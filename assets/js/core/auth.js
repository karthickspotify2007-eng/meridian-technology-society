/**
 * Mock authentication. There is no backend in this build (the specified
 * stack is entirely client-side libraries) so "sessions" are a signed-looking
 * localStorage record checked against /data/members.json plus any accounts
 * created through the Register page (kept in a separate localStorage list).
 * This is a front-end simulation only — never treat it as real auth.
 */
(function () {
  const SESSION_KEY = 'meridian:session';
  const REGISTERED_KEY = 'meridian:registeredMembers';

  function getRegistered() {
    try {
      return JSON.parse(localStorage.getItem(REGISTERED_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveRegistered(list) {
    localStorage.setItem(REGISTERED_KEY, JSON.stringify(list));
  }

  async function findMemberByEmail(email) {
    const seed = await window.Meridian.data.getData('members');
    const registered = getRegistered();
    const all = [...seed, ...registered];
    return all.find((m) => m.email.toLowerCase() === email.toLowerCase());
  }

  async function login(email, password) {
    const member = await findMemberByEmail(email);
    if (!member || member.password !== password) {
      return { ok: false, error: 'Incorrect email or password.' };
    }
    const session = {
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      initials: member.initials,
      membershipTier: member.membershipTier,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true, member: session };
  }

  async function register({ name, email, password }) {
    const existing = await findMemberByEmail(email);
    if (existing) {
      return { ok: false, error: 'An account with this email already exists.' };
    }
    const initials = name.trim().split(/\s+/).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || 'M';
    const member = {
      id: `mem-${Date.now()}`,
      name,
      email,
      password,
      role: 'member',
      initials,
      title: 'Member',
      org: '',
      membershipTier: 'Associate',
      joinDate: new Date().toISOString().slice(0, 10),
      location: '',
      communities: [],
    };
    const registered = getRegistered();
    registered.push(member);
    saveRegistered(registered);
    const session = {
      id: member.id, name: member.name, email: member.email, role: member.role,
      initials: member.initials, membershipTier: member.membershipTier,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true, member: session };
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch {
      return null;
    }
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  function isAuthenticated() {
    return !!getSession();
  }

  /** Redirects away if the guard fails. Call at the very top of a protected page. */
  function requireAuth({ role } = {}) {
    const session = getSession();
    if (!session) {
      const redirect = encodeURIComponent(location.pathname + location.hash);
      location.replace(`/auth/login.html?redirect=${redirect}`);
      return null;
    }
    if (role && session.role !== role) {
      location.replace('/dashboard.html');
      return null;
    }
    return session;
  }

  /** Toggles [data-guest-only] / [data-member-only] zones and fills avatar info in the header. */
  function renderAuthUI() {
    const session = getSession();
    document.querySelectorAll('[data-guest-only]').forEach((el) => { el.hidden = !!session; });
    document.querySelectorAll('[data-member-only]').forEach((el) => { el.hidden = !session; });
    if (session) {
      const initialsEl = document.getElementById('avatar-initials');
      const nameEl = document.getElementById('avatar-name');
      const emailEl = document.getElementById('avatar-email');
      const adminLink = document.getElementById('admin-menu-link');
      if (initialsEl) initialsEl.textContent = session.initials;
      if (nameEl) nameEl.textContent = session.name;
      if (emailEl) emailEl.textContent = session.email;
      if (adminLink) adminLink.hidden = session.role !== 'admin';
    }
  }

  function wireLogout() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('#logout-btn, #mobile-logout-btn')) {
        logout();
        location.href = '/index.html';
      }
    });
  }

  window.Meridian = window.Meridian || {};
  window.Meridian.onPartialsReady(renderAuthUI);
  wireLogout();

  window.Meridian.auth = { login, register, logout, getSession, isAuthenticated, requireAuth, renderAuthUI };
})();
