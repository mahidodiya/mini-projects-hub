/* ==========================================================================
   Talking to the Express API
   ========================================================================== */

const Session = {
  KEY: 'clubhub.session',

  get() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || null;
    } catch {
      return null;
    }
  },

  set(session) {
    localStorage.setItem(this.KEY, JSON.stringify(session));
    window.dispatchEvent(new Event('session-changed'));
  },

  clear() {
    localStorage.removeItem(this.KEY);
    window.dispatchEvent(new Event('session-changed'));
  },

  get user() { return this.get()?.user || null; },
  get token() { return this.get()?.token || null; },
  get isSignedIn() { return Boolean(this.token); },
};

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (auth && Session.token) headers.Authorization = `Bearer ${Session.token}`;

  const res = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // An empty body is fine for some responses.
  }

  if (res.status === 401 && Session.isSignedIn) Session.clear();
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

/** Build a query string, skipping anything empty. */
const qs = (params) => {
  const usable = Object.entries(params || {}).filter(
    ([, v]) => v !== undefined && v !== null && v !== '' && v !== 'all'
  );
  return usable.length ? '?' + new URLSearchParams(usable) : '';
};

const API = {
  stats:         () => request('/api/stats'),
  categories:    () => request('/api/categories'),
  announcements: () => request('/api/announcements'),
  gallery:       () => request('/api/gallery'),

  clubs:      (params) => request('/api/clubs' + qs(params)),
  club:       (slug) => request(`/api/clubs/${slug}`),
  joinClub:   (slug, message) => request(`/api/clubs/${slug}/join`, { method: 'POST', body: { message } }),
  leaveClub:  (slug) => request(`/api/clubs/${slug}/join`, { method: 'DELETE' }),

  events:     (params) => request('/api/events' + qs(params)),
  event:      (id) => request(`/api/events/${id}`),
  rsvp:       (id, status = 'going') => request(`/api/events/${id}/rsvp`, { method: 'POST', body: { status } }),
  cancelRsvp: (id) => request(`/api/events/${id}/rsvp`, { method: 'DELETE' }),

  myClubs:    () => request('/api/me/clubs'),
  myEvents:   () => request('/api/me/events'),
  myRequests: () => request('/api/me/requests'),

  login:    (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload, auth: false }),
};
