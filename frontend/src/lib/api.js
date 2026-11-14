const BASE = '/api'

async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  if (!response.ok) {
    let detail = `Request failed (${response.status})`
    try {
      const body = await response.json()
      if (body?.detail) detail = typeof body.detail === 'string' ? body.detail : detail
    } catch {
      // keep the status text
    }
    const error = new Error(detail)
    error.status = response.status
    throw error
  }
  if (response.status === 204) return null
  return response.json()
}

export const api = {
  me: () => request('/auth/me'),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  bootstrap: () => request('/bootstrap'),
  createSubmission: (payload) =>
    request('/submissions', { method: 'POST', body: JSON.stringify(payload) }),
  reviewSubmission: (id, payload) =>
    request(`/submissions/${id}/action`, { method: 'POST', body: JSON.stringify(payload) }),
  createGuideline: (payload) =>
    request('/guidelines', { method: 'POST', body: JSON.stringify(payload) }),
  updateGuideline: (id, payload) =>
    request(`/guidelines/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteGuideline: (id) => request(`/guidelines/${id}`, { method: 'DELETE' }),
  health: () => request('/health'),
}
