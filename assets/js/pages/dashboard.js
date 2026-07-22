/**
 * Dashboard shell. Guards on a mock session (core/auth.js), then renders
 * seven hash-routed sections — Profile, Courses, Certificates, Events,
 * Saved items, Notifications, Settings — from the same JSON data + local
 * store that the public site's bookmark/enroll/register/apply actions write
 * to, so anything a member does anywhere on the site shows up here live.
 */
(function () {
  const SECTION_TITLES = {
    profile: 'Profile', courses: 'My Courses', certificates: 'My Certificates', events: 'My Events',
    saved: 'Saved Items', notifications: 'Notifications', settings: 'Settings',
  };

  // Demo data: the seed "demo@meridian.org" account already holds one earned credential.
  const EARNED_CERTS = { 'mem-001': ['cert-01'] };

  const SAVED_TYPE_MAP = {
    publication: { key: 'publications', render: (i) => window.Meridian.cards.publicationCard(i) },
    conference: { key: 'conferences', render: (i) => window.Meridian.cards.conferenceCard(i) },
    event: { key: 'events', render: (i) => window.Meridian.cards.eventCard(i) },
    course: { key: 'courses', render: (i) => window.Meridian.cards.courseCard(i) },
    resource: { key: 'resources', render: (i) => window.Meridian.cards.resourceCard(i) },
    blog: { key: 'blog', render: (i) => window.Meridian.cards.blogCard(i) },
  };

  function pseudoProgress(id) {
    const sum = String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return 20 + (sum % 76);
  }

  function emptyState(message, ctaHref, ctaLabel) {
    return `<div class="empty-state">
      <i class="fa-solid fa-inbox fa-2xl" aria-hidden="true"></i>
      <p>${message}</p>
      ${ctaHref ? `<a href="${ctaHref}" class="btn-m btn-m-primary">${ctaLabel}</a>` : ''}
    </div>`;
  }

  function renderSidebarProfile(session) {
    document.getElementById('sidebar-avatar').textContent = session.initials;
    document.getElementById('sidebar-name').textContent = session.name;
    document.getElementById('sidebar-tier').textContent = `${session.membershipTier} member`;
  }

  function renderProfileSection(session, data) {
    const bookmarks = window.Meridian.store.read('bookmarks', []);
    const enrolled = window.Meridian.store.read('enrolled-courses', []);
    const joined = window.Meridian.store.read('joined-communities', []);
    const registered = window.Meridian.store.read('registered-events', []);

    document.getElementById('profile-section').innerHTML = `
      <div class="mini-stat-row">
        <div class="mini-stat"><div class="num">${enrolled.length}</div><div class="label">Courses enrolled</div></div>
        <div class="mini-stat"><div class="num">${registered.length}</div><div class="label">Events registered</div></div>
        <div class="mini-stat"><div class="num">${joined.length}</div><div class="label">Communities joined</div></div>
        <div class="mini-stat"><div class="num">${bookmarks.length}</div><div class="label">Saved items</div></div>
      </div>
      <div class="profile-header-card card-m">
        <span class="m-avatar">${session.initials}</span>
        <div>
          <h2>${session.name}</h2>
          <p class="meta">${session.title || 'Member'}${session.org ? ` at ${session.org}` : ''}</p>
          <p class="meta">${session.membershipTier} member${session.joinDate ? ` since ${window.Meridian.cards.formatDate(session.joinDate)}` : ''}</p>
        </div>
      </div>
      <div class="card-m">
        <h3 class="card-m-title">About</h3>
        <p class="card-m-desc">${session.location || 'Location not set.'} &middot; ${session.email}</p>
        <button type="button" class="btn-m btn-m-secondary" style="align-self:flex-start;" data-goto-section="settings">Edit profile</button>
      </div>
    `;
  }

  function renderCoursesSection(data) {
    const enrolledIds = window.Meridian.store.read('enrolled-courses', []);
    const courses = data.courses.filter((c) => enrolledIds.includes(c.id));
    const container = document.getElementById('courses-section');
    if (!courses.length) {
      container.innerHTML = emptyState('You haven\'t enrolled in any courses yet.', '/pages/learning.html', 'Browse Learning Hub');
      return;
    }
    container.innerHTML = `<div class="grid-3">${courses.map((c) => {
      const pct = pseudoProgress(c.id);
      return `<article class="card-m" data-tilt>
        <div class="card-m-meta"><span class="badge-m">${c.level}</span><span class="badge-m badge-m-teal">${c.category}</span></div>
        <h3 class="card-m-title">${c.title}</h3>
        <div class="progress-bar-m"><span style="width:${pct}%;"></span></div>
        <p class="card-m-desc" style="font-size:var(--m-fs-xs);">${pct}% complete</p>
        <div class="card-m-footer">
          <button type="button" class="btn-m btn-m-sm btn-m-primary" data-open-detail="course" data-id="${c.id}">Continue</button>
        </div>
      </article>`;
    }).join('')}</div>`;
    window.Meridian.tilt.init(container);
  }

  function renderCertificatesSection(session, data) {
    const earned = new Set(EARNED_CERTS[session.id] || []);
    const applied = window.Meridian.store.read('cert-applications', []);
    const container = document.getElementById('certificates-section');
    const rows = [
      ...[...earned].map((id) => ({ id, status: 'earned' })),
      ...applied.filter((id) => !earned.has(id)).map((id) => ({ id, status: 'progress' })),
    ];
    if (!rows.length) {
      container.innerHTML = emptyState('No certifications in progress yet.', '/pages/certifications.html', 'Browse Certifications');
      return;
    }
    container.innerHTML = `<div class="grid-3">${rows.map(({ id, status }) => {
      const cert = data.certifications.find((c) => c.id === id);
      if (!cert) return '';
      return `<article class="card-m" data-tilt>
        <div class="card-m-meta">
          <span class="badge-m">${cert.code}</span>
          <span class="badge-m ${status === 'earned' ? 'badge-m-teal' : 'badge-m-amber'}">${status === 'earned' ? 'Earned' : 'In Progress'}</span>
        </div>
        <h3 class="card-m-title">${cert.title}</h3>
        <p class="card-m-desc">${status === 'earned' ? `Valid ${cert.validity} from issue date.` : 'Complete your exam to earn this credential.'}</p>
        <div class="card-m-footer">
          <button type="button" class="btn-m btn-m-sm btn-m-secondary" data-open-detail="certification" data-id="${cert.id}">${status === 'earned' ? 'View details' : 'Continue application'}</button>
        </div>
      </article>`;
    }).join('')}</div>`;
    window.Meridian.tilt.init(container);
  }

  function renderEventsSection(data) {
    const registeredIds = window.Meridian.store.read('registered-events', []);
    const events = data.events.filter((e) => registeredIds.includes(e.id));
    const container = document.getElementById('events-section');
    if (!events.length) {
      container.innerHTML = emptyState('You\'re not registered for any upcoming events.', '/pages/events.html', 'Browse Events');
      return;
    }
    container.innerHTML = `<div class="grid-3">${events.map(window.Meridian.cards.eventCard).join('')}</div>`;
    window.Meridian.tilt.init(container);
    window.Meridian.bookmark.init(container);
  }

  function renderSavedSection(data) {
    const bookmarks = window.Meridian.store.read('bookmarks', []).map((k) => {
      const [type, ...rest] = k.split(':');
      return { type, id: rest.join(':') };
    });
    const container = document.getElementById('saved-section');
    if (!bookmarks.length) {
      container.innerHTML = emptyState('Nothing saved yet — look for the heart icon on any card across the site.', '/pages/publications.html', 'Browse Publications');
      return;
    }
    const cardsHTML = bookmarks.map(({ type, id }) => {
      const map = SAVED_TYPE_MAP[type];
      if (!map) return '';
      const item = data[map.key]?.find((i) => i.id === id);
      return item ? map.render(item) : '';
    }).filter(Boolean).join('');
    container.innerHTML = `<div class="grid-3">${cardsHTML}</div>`;
    window.Meridian.tilt.init(container);
    window.Meridian.bookmark.init(container);
  }

  const NOTIF_ICON = {
    certification: 'fa-certificate', community: 'fa-comments', conference: 'fa-calendar-days',
    learning: 'fa-graduation-cap', membership: 'fa-id-card',
  };

  async function renderNotificationsSection() {
    const items = await window.Meridian.notifications.getMerged();
    const container = document.getElementById('notifications-section');
    container.innerHTML = `
      <div style="display:flex;justify-content:flex-end;margin-bottom:0.6rem;">
        <button type="button" class="btn-m btn-m-sm btn-m-secondary" id="dash-mark-all-read">Mark all as read</button>
      </div>
      <div class="card-m">
        ${items.map((n) => `
          <div class="dash-notif-item ${n.read ? '' : 'is-unread'}" data-notif-id="${n.id}">
            <span class="icon"><i class="fa-solid ${NOTIF_ICON[n.type] || 'fa-bell'}" aria-hidden="true"></i></span>
            <div>
              <strong>${n.title}</strong>
              <p class="card-m-desc" style="margin:0.2rem 0 0;">${n.message}</p>
              <span class="text-muted-m" style="font-size:var(--m-fs-xs);">${window.Meridian.cards.formatDate(n.date)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    container.querySelectorAll('[data-notif-id]').forEach((el) => {
      el.addEventListener('click', () => { window.Meridian.notifications.markRead(el.dataset.notifId); renderNotificationsSection(); });
    });
    document.getElementById('dash-mark-all-read').addEventListener('click', () => window.Meridian.notifications.markAllRead().then(renderNotificationsSection));
  }

  function renderSettingsSection(session) {
    const container = document.getElementById('settings-section');
    const currentTheme = document.documentElement.getAttribute('data-bs-theme') || 'light';
    container.innerHTML = `
      <div class="settings-section-block">
        <h3>Profile details</h3>
        <form id="settings-profile-form">
          <div class="form-m-row">
            <div class="form-m-group"><label for="settings-name">Full name</label><input type="text" id="settings-name" value="${session.name}"></div>
            <div class="form-m-group"><label for="settings-title">Title</label><input type="text" id="settings-title" value="${session.title || ''}"></div>
          </div>
          <div class="form-m-row">
            <div class="form-m-group"><label for="settings-org">Organization</label><input type="text" id="settings-org" value="${session.org || ''}"></div>
            <div class="form-m-group"><label for="settings-location">Location</label><input type="text" id="settings-location" value="${session.location || ''}"></div>
          </div>
          <button type="submit" class="btn-m btn-m-primary">Save changes</button>
        </form>
      </div>
      <div class="settings-section-block">
        <h3>Appearance</h3>
        <div class="theme-radio-row">
          <label><input type="radio" name="settings-theme" value="light" ${currentTheme === 'light' ? 'checked' : ''}> Light</label>
          <label><input type="radio" name="settings-theme" value="dark" ${currentTheme === 'dark' ? 'checked' : ''}> Dark</label>
        </div>
      </div>
      <div class="settings-section-block" style="border-bottom:none;">
        <h3>Notification preferences</h3>
        <label class="form-m-check"><input type="checkbox" checked> Event reminders</label>
        <label class="form-m-check"><input type="checkbox" checked> Certification updates</label>
        <label class="form-m-check"><input type="checkbox"> Weekly digest emails</label>
      </div>
    `;

    container.querySelectorAll('[name="settings-theme"]').forEach((radio) => {
      radio.addEventListener('change', () => window.Meridian.theme.applyTheme(radio.value));
    });

    document.getElementById('settings-profile-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const updated = {
        ...session,
        name: document.getElementById('settings-name').value.trim() || session.name,
        title: document.getElementById('settings-title').value.trim(),
        org: document.getElementById('settings-org').value.trim(),
        location: document.getElementById('settings-location').value.trim(),
      };
      localStorage.setItem('meridian:session', JSON.stringify(updated));
      renderSidebarProfile(updated);
      window.Meridian.toast.show({ type: 'success', title: 'Profile updated' });
    });
  }

  async function init() {
    const session = window.Meridian.auth.requireAuth();
    if (!session) return;

    renderSidebarProfile(session);

    const data = await window.Meridian.data.getAllData([
      'courses', 'certifications', 'events', 'publications', 'conferences', 'resources', 'blog',
    ]);
    window.Meridian.detail.registerItems('course', data.courses);
    window.Meridian.detail.registerItems('event', data.events);
    window.Meridian.detail.registerItems('publication', data.publications);
    window.Meridian.detail.registerItems('conference', data.conferences);
    window.Meridian.detail.registerItems('resource', data.resources);
    window.Meridian.detail.registerItems('certification', data.certifications);

    renderProfileSection(session, data);
    renderCoursesSection(data);
    renderCertificatesSection(session, data);
    renderEventsSection(data);
    renderSavedSection(data);
    renderNotificationsSection();
    renderSettingsSection(session);

    window.Meridian.router.mountSectionRouter({
      sections: Object.keys(SECTION_TITLES),
      defaultSection: 'profile',
      onChange: (name) => {
        document.getElementById('dashboard-section-title').textContent = SECTION_TITLES[name];
        window.Meridian.tilt.init(document);
      },
    });

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-goto-section]');
      if (btn) location.hash = btn.dataset.gotoSection;
    });

    document.addEventListener('meridian:store-changed', (e) => {
      const ns = e.detail.namespace;
      if (ns === 'bookmarks') renderSavedSection(data);
      if (ns === 'enrolled-courses') renderCoursesSection(data);
      if (ns === 'cert-applications') renderCertificatesSection(session, data);
      if (ns === 'registered-events') renderEventsSection(data);
      if (['bookmarks', 'enrolled-courses', 'registered-events', 'joined-communities'].includes(ns)) renderProfileSection(session, data);
    });
  }

  init();
})();
