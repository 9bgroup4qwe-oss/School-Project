import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://zuxrndrpeopqdoxixkea.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eHJuZHJwZW9wcWRveGl4a2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwOTQ3NDcsImV4cCI6MjEwMzY3MDc0N30.pPg16NWYTGC82HIYXhff8ZRyepWZlg3XgVIUyCfn2BI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const DEMO_USER_KEY = 'growmyiq_user_session';

async function fetchWithAuth(endpoint, options = {}) {
  let token = null;
  let email = null;
  const stored = localStorage.getItem(DEMO_USER_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      token = parsed.access_token;
      email = parsed.user?.email;
    } catch (_) {}
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (email) {
    headers['x-user-email'] = email;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error?.message || errJson.detail || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const authService = {
  signUp: async (email, password) => {
    const normEmail = email.toLowerCase().trim();
    try {
      const resp = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normEmail, password })
      });
      if (resp.ok) {
        const data = await resp.json();
        const session = {
          access_token: data.access_token,
          user: data.user
        };
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(session));
        return session;
      }
    } catch (_) {}

    const deterministicId = 'usr_' + btoa(normEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
    const fallbackSession = {
      access_token: `demo_token_email_${normEmail}`,
      user: { id: deterministicId, email: normEmail }
    };
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(fallbackSession));
    return fallbackSession;
  },

  signIn: async (email, password) => {
    const normEmail = email.toLowerCase().trim();
    try {
      const resp = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normEmail, password })
      });
      if (resp.ok) {
        const data = await resp.json();
        const session = {
          access_token: data.access_token,
          user: data.user
        };
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(session));
        return session;
      }
    } catch (_) {}

    const deterministicId = 'usr_' + btoa(normEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
    const fallbackSession = {
      access_token: `demo_token_email_${normEmail}`,
      user: { id: deterministicId, email: normEmail }
    };
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(fallbackSession));
    return fallbackSession;
  },

  getSession: async () => {
    const stored = localStorage.getItem(DEMO_USER_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (_) {}
    }
    return null;
  },

  signOut: async () => {
    localStorage.removeItem(DEMO_USER_KEY);
  }
};

export const api = {
  getDashboardSummary: () => fetchWithAuth('/dashboard/summary'),

  generateQuiz: (payload) => fetchWithAuth('/quiz/generate', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  submitQuiz: (sessionId, payload) => fetchWithAuth(`/quiz/${sessionId}/submit`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  getQuizHistory: () => fetchWithAuth('/quiz/history'),
  getQuizStats: () => fetchWithAuth('/quiz/stats'),

  listTimetables: () => fetchWithAuth('/timetable'),

  generateTimetable: (payload) => fetchWithAuth('/timetable/generate', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  chatTimetable: (payload) => fetchWithAuth('/timetable/chat', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  extractSyllabus: async (file) => {
    const session = await authService.getSession();
    const token = session?.access_token;

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/timetable/extract-syllabus`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.error?.message || 'Failed to parse syllabus');
    }
    return res.json();
  },

  toggleTopicCompletion: (timetableId, slotId, completed) => fetchWithAuth(`/timetable/${timetableId}/toggle-topic`, {
    method: 'POST',
    body: JSON.stringify({ slot_id: slotId, completed })
  }),

  reallocateTimetable: (timetableId) => fetchWithAuth(`/timetable/${timetableId}/reallocate`, {
    method: 'POST'
  }),

  extractPdf: async (file) => {
    return api.extractSyllabus(file);
  }
};
