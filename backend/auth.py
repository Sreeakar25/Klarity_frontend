"""Local accounts and revocable, server-side cookie sessions."""

import hashlib
import hmac
import os
import re
import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from config import CORS_ORIGINS
from database import Base, SessionLocal, get_db


class Account(Base):
    __tablename__ = "accounts"
    id = Column(Integer, primary_key=True)
    username = Column(String(80), unique=True, nullable=False)
    email = Column(String(254), unique=True, nullable=False)
    password_hash = Column(String(256), nullable=False)


class LoginSession(Base):
    __tablename__ = "login_sessions"
    token_hash = Column(String(64), primary_key=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    expires_at = Column(DateTime, nullable=False)


def hash_password(password, salt=None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 600_000).hex()
    return f"{salt}${digest}"


def seed_test_account():
    if os.getenv("ENABLE_TEST_ACCOUNT", "false").lower() != "true":
        return
    with SessionLocal() as db:
        if not db.query(Account).filter_by(email="ashwik@topper").first():
            db.add(Account(username="ashwik", email="ashwik@topper", password_hash=hash_password("klarity")))
            db.commit()


def check_origin(request: Request):
    origin = request.headers.get("origin")
    if origin and origin not in CORS_ORIGINS and origin != str(request.base_url).rstrip("/"):
        raise HTTPException(403, "Origin not allowed")


def current_account(request: Request, db: Session = Depends(get_db)):
    if request.method not in ("GET", "HEAD", "OPTIONS"):
        check_origin(request)
    token = request.cookies.get("klarity_session", "")
    session = db.get(LoginSession, hashlib.sha256(token.encode()).hexdigest()) if token else None
    account = db.get(Account, session.account_id) if session and session.expires_at > datetime.utcnow() else None
    if not account:
        raise HTTPException(401, "Sign in to continue")
    return account


def public_account(account):
    return {"id": account.id, "username": account.username, "email": account.email}


def start_session(account, request, response, db):
    old_token = request.cookies.get("klarity_session")
    if old_token:
        db.query(LoginSession).filter_by(token_hash=hashlib.sha256(old_token.encode()).hexdigest()).delete()
    db.query(LoginSession).filter(LoginSession.expires_at <= datetime.utcnow()).delete()
    token = secrets.token_urlsafe(32)
    db.add(LoginSession(token_hash=hashlib.sha256(token.encode()).hexdigest(), account_id=account.id,
                        expires_at=datetime.utcnow() + timedelta(days=1)))
    db.commit()
    response.set_cookie("klarity_session", token, httponly=True, samesite="lax",
                        secure=os.getenv("COOKIE_SECURE", "false").lower() == "true", max_age=86400, path="/")
    return public_account(account)


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=80)
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    identifier: str = Field(min_length=1, max_length=254)
    password: str = Field(min_length=1, max_length=128)


router = APIRouter(prefix="/api/auth", tags=["accounts"], dependencies=[Depends(check_origin)])


@router.post("/register", status_code=201)
def register(payload: RegisterRequest, request: Request, response: Response, db: Session = Depends(get_db)):
    username, email = payload.username.strip().lower(), payload.email.strip().lower()
    if not re.fullmatch(r"[a-z0-9_.-]{3,80}", username):
        raise HTTPException(422, "Username must contain 3–80 letters, numbers, dots, dashes, or underscores")
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
        raise HTTPException(422, "Enter a valid email address")
    account = Account(username=username, email=email, password_hash=hash_password(payload.password))
    db.add(account)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Username or email is already registered") from None
    return start_session(account, request, response, db)


@router.post("/login")
def login(payload: LoginRequest, request: Request, response: Response, db: Session = Depends(get_db)):
    identifier = payload.identifier.strip().lower()
    account = db.query(Account).filter(or_(Account.username == identifier, Account.email == identifier)).first()
    salt = account.password_hash.split("$")[0] if account else "invalid-account"
    candidate = hash_password(payload.password, salt)
    if not account or not hmac.compare_digest(account.password_hash, candidate):
        raise HTTPException(401, "Incorrect username, email, or password")
    return start_session(account, request, response, db)


@router.get("/me")
def me(account: Account = Depends(current_account)):
    return public_account(account)


@router.post("/logout", status_code=204)
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    token = request.cookies.get("klarity_session", "")
    db.query(LoginSession).filter_by(token_hash=hashlib.sha256(token.encode()).hexdigest()).delete()
    db.commit()
    response.delete_cookie("klarity_session", path="/")
