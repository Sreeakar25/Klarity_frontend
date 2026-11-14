"""Run with python -m unittest discover -s backend. Uses an isolated database."""

import os
import tempfile
import unittest
from unittest.mock import patch

import httpx
from sqlalchemy.exc import OperationalError

temporary_database = tempfile.TemporaryDirectory()
os.environ["DATABASE_URL"] = "sqlite:///" + temporary_database.name.replace("\\", "/") + "/test.db"
os.environ["SEED_DEMO_DATA"] = "false"
os.environ["ENABLE_TEST_ACCOUNT"] = "true"

from database import engine
from main import app


class ApiTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.lifespan = app.router.lifespan_context(app)
        await self.lifespan.__aenter__()
        self.client = httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test")

    async def asyncTearDown(self):
        await self.client.aclose()
        await self.lifespan.__aexit__(None, None, None)

    async def test_database_failure_returns_redacted_503(self):
        with patch("sqlalchemy.orm.Session.execute", side_effect=OperationalError("secret", {}, Exception("password"))):
            response = await self.client.get("/api/health")
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json(), {"detail": "Database unavailable"})

    async def test_guideline_submission_review_and_bootstrap(self):
        await self.client.post("/api/auth/login", json={"identifier": "ashwik@topper", "password": "klarity"})
        health = await self.client.get("/api/health")
        self.assertEqual(health.status_code, 200)
        self.assertFalse(health.json()["demo_data"])
        response = await self.client.post("/api/guidelines", json={
            "title": "Voice", "category": "tone", "content": "Use clear language", "priority": 2,
        })
        self.assertEqual(response.status_code, 201, response.text)
        guideline_id = response.json()["id"]
        response = await self.client.patch(f"/api/guidelines/{guideline_id}", json={"priority": 3})
        self.assertEqual(response.json()["priority"], 3)
        response = await self.client.post("/api/submissions", json={
            "title": "Launch", "content_type": "text", "content_text": "Welcome to Klarity.", "submitted_by": "Tester",
        })
        self.assertEqual(response.status_code, 201, response.text)
        submission_id = response.json()["id"]
        self.assertEqual(len(response.json()["reports"]), 1)
        response = await self.client.post(f"/api/submissions/{submission_id}/action", json={
            "action": "approved", "performed_by": "Reviewer", "comment": "Ready",
        })
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(response.json()["status"], "approved")
        response = await self.client.get("/api/bootstrap")
        self.assertEqual(response.status_code, 200, response.text)
        self.assertFalse(response.json()["demo_data"])
        self.assertEqual(response.json()["submissions"][0]["status"], "approved")
        response = await self.client.delete(f"/api/guidelines/{guideline_id}")
        self.assertEqual(response.status_code, 204, response.text)

    async def test_authentication_and_logout(self):
        response = await self.client.get("/api/bootstrap")
        self.assertEqual(response.status_code, 401)
        response = await self.client.post("/api/auth/login", json={"identifier": "ashwik@topper", "password": "wrong"})
        self.assertEqual(response.status_code, 401)
        response = await self.client.post("/api/auth/login", json={"identifier": "ashwik@topper", "password": "klarity"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["username"], "ashwik")
        self.assertNotIn("password_hash", response.json())
        self.assertIn("HttpOnly", response.headers["set-cookie"])
        token = self.client.cookies.get("klarity_session")
        self.assertEqual((await self.client.get("/api/auth/me")).status_code, 200)
        self.assertEqual((await self.client.post("/api/auth/logout")).status_code, 204)
        self.assertEqual((await self.client.get("/api/bootstrap")).status_code, 401)
        self.client.cookies.set("klarity_session", token)
        self.assertEqual((await self.client.get("/api/auth/me")).status_code, 401)

    async def test_registration_and_username_login(self):
        payload = {"username": "newuser", "email": "newuser@gmail.com", "password": "new-password"}
        response = await self.client.post("/api/auth/register", json=payload)
        self.assertEqual(response.status_code, 201, response.text)
        self.assertEqual((await self.client.get("/api/bootstrap")).status_code, 200)
        response = await self.client.post("/api/auth/register", json=payload)
        self.assertEqual(response.status_code, 409)
        await self.client.post("/api/auth/logout")
        response = await self.client.post("/api/auth/login", json={"identifier": "NEWUSER", "password": payload["password"]})
        self.assertEqual(response.status_code, 200)
        response = await self.client.post("/api/auth/logout", headers={"Origin": "https://evil.example"})
        self.assertEqual(response.status_code, 403)
        self.assertEqual((await self.client.get("/api/auth/me")).status_code, 200)


def tearDownModule():
    engine.dispose()
    temporary_database.cleanup()
