/**
 * Admin CMS shell. Guards on a mock admin session, then renders ten
 * hash-routed sections. Publications/Events/Blogs/Communities use one
 * generic CRUD table+form engine (`createResourceManager`) backed by the
 * same localStorage overlay that `core/data.js`'s `getMerged` reads — so
 * edits made here actually show up on the public listing pages and Home,
 * not just inside Admin. Analytics/Users/CMS/Media/SEO/Roles are simpler,
 * mostly read-oriented or single-purpose mock tools (there's no backend to
 * wire up here — see the plan's "explicitly out of scope" note).
 */
(function () {
  const SECTION_TITLES = {
    analytics: 'Analytics', users: 'Users', cms: 'CMS', events: 'Events', publications: 'Publications',
    blogs: 'Blogs', communities: 'Communities', media: 'Media Library', seo: 'SEO', roles: 'Roles & Permissions',
  };

  function emptyOverlay() { return { edits: {}, deletes: [], adds: [] }; }
  function getOverlay(key) { return window.Meridian.store.read(`admin-overlay-${key}`, emptyOverlay()); }
  function saveOverlay(key, overlay) { window.Meridian.store.write(`admin-overlay-${key}`, overlay); }

  /* ---------------------------------------------------------------------
   * Generic CRUD table + modal form, reused by Events/Publications/Blogs/
   * Communities admin sections.
   * ------------------------------------------------------------------- */
  function createResourceManager({ containerId, dataKey, columns, formFields, singular }) {
    async function render() {
      const items = await window.Meridian.data.getMerged(dataKey);
      const container = document.getElementById(containerId);
      container.innerHTML = `
        <div class="app-topbar">
          <p class="text-muted-m">${items.length} ${dataKey}</p>
          <button type="button" class="btn-m btn-m-primary" data-admin-add><i class="fa-solid fa-plus" aria-hidden="true"></i> Add ${singular}</button>
        </div>
        <div class="table-m-wrap">
          <table class="table-m">
            <thead><tr>${columns.map((c) => `<th>${c.label}</th>`).join('')}<th>Actions</th></tr></thead>
            <tbody>${items.map((item) => `
              <tr>
                ${columns.map((c) => `<td>${c.render ? c.render(item) : (item[c.key] ?? '')}</td>`).join('')}
                <td class="row-actions">
                  <button type="button" data-edit="${item.id}" aria-label="Edit"><i class="fa-solid fa-pen" aria-hidden="true"></i></button>
                  <button type="button" data-delete="${item.id}" aria-label="Delete"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>
                </td>
              </tr>
            `).join('')}</tbody>
          </table>
        </div>
      `;

      container.querySelector('[data-admin-add]').addEventListener('click', () => openForm(null));
      container.querySelectorAll('[data-edit]').forEach((btn) => btn.addEventListener('click', async () => {
        const current = await window.Meridian.data.getMerged(dataKey);
        openForm(current.find((i) => String(i.id) === btn.dataset.edit));
      }));
      container.querySelectorAll('[data-delete]').forEach((btn) => btn.addEventListener('click', () => {
        const overlay = getOverlay(dataKey);
        const id = btn.dataset.delete;
        overlay.adds = overlay.adds.filter((a) => String(a.id) !== id);
        if (!overlay.deletes.includes(id)) overlay.deletes.push(id);
        delete overlay.edits[id];
        saveOverlay(dataKey, overlay);
        window.Meridian.toast.show({ type: 'success', title: `${singular} deleted` });
        render();
      }));
    }

    function openForm(item) {
      const isNew = !item;
      const bodyHTML = `<form id="admin-resource-form">${formFields.map((f) => `
        <div class="form-m-group">
          <label for="af-${f.key}">${f.label}</label>
          <input type="${f.type || 'text'}" id="af-${f.key}" value="${item ? (item[f.key] ?? '') : (f.default ?? '')}">
        </div>
      `).join('')}</form>`;
      window.Meridian.modal.open({
        title: isNew ? `Add ${singular}` : `Edit ${singular}`,
        bodyHTML,
        footHTML: `<button type="submit" form="admin-resource-form" class="btn-m btn-m-primary">Save</button>`,
      });
      document.getElementById('admin-resource-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const values = {};
        formFields.forEach((f) => {
          const raw = document.getElementById(`af-${f.key}`).value;
          if (f.parse) values[f.key] = f.parse(raw);
          else if (f.type === 'number') values[f.key] = Number(raw) || 0;
          else values[f.key] = raw;
        });
        const overlay = getOverlay(dataKey);
        if (isNew) {
          values.id = `${dataKey}-${Date.now()}`;
          overlay.adds.push(values);
        } else {
          overlay.edits[item.id] = { ...overlay.edits[item.id], ...values };
        }
        saveOverlay(dataKey, overlay);
        window.Meridian.modal.close();
        window.Meridian.toast.show({ type: 'success', title: `${singular} saved`, message: 'Changes are live on the public site immediately.' });
        render();
      });
    }

    return { render };
  }

  const eventsManager = createResourceManager({
    containerId: 'events-section', dataKey: 'events', singular: 'Event',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'type', label: 'Type' },
      { key: 'date', label: 'Date' },
      { key: 'mode', label: 'Mode' },
    ],
    formFields: [
      { key: 'title', label: 'Title' }, { key: 'type', label: 'Type', default: 'Webinar' },
      { key: 'date', label: 'Date', type: 'date' }, { key: 'time', label: 'Time', default: '17:00' },
      { key: 'timezone', label: 'Timezone', default: 'UTC' }, { key: 'mode', label: 'Mode', default: 'Virtual' },
      { key: 'location', label: 'Location', default: 'Online' }, { key: 'description', label: 'Description' },
      { key: 'capacity', label: 'Capacity', type: 'number', default: 100 }, { key: 'registered', label: 'Registered', type: 'number', default: 0 },
    ],
  });

  const publicationsManager = createResourceManager({
    containerId: 'publications-section', dataKey: 'publications', singular: 'Publication',
    columns: [
      { key: 'title', label: 'Title' }, { key: 'type', label: 'Type' }, { key: 'topic', label: 'Topic' }, { key: 'year', label: 'Year' },
    ],
    formFields: [
      { key: 'title', label: 'Title' }, { key: 'type', label: 'Type', default: 'Journal' }, { key: 'topic', label: 'Topic', default: 'Artificial Intelligence' },
      { key: 'year', label: 'Year', type: 'number', default: 2026 },
      { key: 'authors', label: 'Authors (comma-separated)', parse: (v) => v.split(',').map((s) => s.trim()).filter(Boolean) },
      { key: 'abstract', label: 'Abstract' }, { key: 'doi', label: 'DOI' }, { key: 'pages', label: 'Pages' },
    ],
  });

  const blogsManager = createResourceManager({
    containerId: 'blogs-section', dataKey: 'blog', singular: 'Post',
    columns: [
      { key: 'title', label: 'Title' }, { key: 'author', label: 'Author' }, { key: 'category', label: 'Category' }, { key: 'date', label: 'Date' },
    ],
    formFields: [
      { key: 'title', label: 'Title' }, { key: 'slug', label: 'Slug' }, { key: 'author', label: 'Author' },
      { key: 'authorRole', label: 'Author role' }, { key: 'category', label: 'Category', default: 'Engineering' },
      { key: 'date', label: 'Date', type: 'date' }, { key: 'readTime', label: 'Read time (min)', type: 'number', default: 5 },
      { key: 'excerpt', label: 'Excerpt' },
    ],
  });

  const communitiesManager = createResourceManager({
    containerId: 'communities-section', dataKey: 'communities', singular: 'Community',
    columns: [
      { key: 'name', label: 'Name' }, { key: 'memberCount', label: 'Members' },
    ],
    formFields: [
      { key: 'name', label: 'Name' }, { key: 'icon', label: 'Font Awesome icon class', default: 'fa-diagram-project' },
      { key: 'memberCount', label: 'Member count', type: 'number', default: 1000 }, { key: 'description', label: 'Description' },
    ],
  });

  /* ---------------------------------------------------------------------
   * Analytics
   * ------------------------------------------------------------------- */
  function drawLineChart(canvas, values, color) {
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    const max = Math.max(...values) * 1.15;
    const step = w / (values.length - 1);
    ctx.beginPath();
    values.forEach((v, i) => {
      const x = i * step, y = h - (v / max) * (h - 20) - 10;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.stroke();
    values.forEach((v, i) => {
      const x = i * step, y = h - (v / max) * (h - 20) - 10;
      ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
    });
  }

  function drawBarChart(canvas, labels, values, color) {
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    const max = Math.max(...values) * 1.2;
    const barW = (w / values.length) * 0.55;
    const gap = (w / values.length) * 0.45;
    values.forEach((v, i) => {
      const barH = (v / max) * (h - 28);
      const x = i * (barW + gap) + gap / 2;
      const y = h - barH - 18;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 5);
      ctx.fill();
      ctx.fillStyle = getComputedStyle(document.body).color;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], x + barW / 2, h - 4);
    });
  }

  async function renderAnalytics() {
    const [pubs, events, jobs, stats] = await Promise.all([
      window.Meridian.data.getMerged('publications'),
      window.Meridian.data.getMerged('events'),
      window.Meridian.data.getData('jobs'),
      window.Meridian.data.getData('stats'),
    ]);
    const container = document.getElementById('analytics-section');
    container.innerHTML = `
      <div class="admin-stat-row">
        <div class="admin-stat-card"><span class="icon"><i class="fa-solid fa-users" aria-hidden="true"></i></span><div class="num" data-counter="483000" data-counter-suffix="+">0</div><div class="label">Total members</div></div>
        <div class="admin-stat-card"><span class="icon"><i class="fa-solid fa-book" aria-hidden="true"></i></span><div class="num">${pubs.length}</div><div class="label">Publications live</div></div>
        <div class="admin-stat-card"><span class="icon"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i></span><div class="num">${events.length}</div><div class="label">Events scheduled</div></div>
        <div class="admin-stat-card"><span class="icon"><i class="fa-solid fa-briefcase" aria-hidden="true"></i></span><div class="num">${jobs.length}</div><div class="label">Open job postings</div></div>
      </div>
      <div class="admin-chart-grid">
        <div class="admin-chart-card">
          <h3 class="card-m-title">New members, last 6 months</h3>
          <canvas id="analytics-line-chart" height="220"></canvas>
        </div>
        <div class="admin-chart-card">
          <h3 class="card-m-title">Content by type</h3>
          <canvas id="analytics-bar-chart" height="220"></canvas>
        </div>
      </div>
    `;
    window.Meridian.counter.init(container);
    drawLineChart(document.getElementById('analytics-line-chart'), [8200, 9100, 8700, 10400, 11200, 12600], '#1E3A8A');
    drawBarChart(
      document.getElementById('analytics-bar-chart'),
      ['Pubs', 'Events', 'Courses', 'Certs', 'Posts'],
      [pubs.length, events.length, 6, 5, 4],
      '#FBBF24',
    );
  }

  /* ---------------------------------------------------------------------
   * Users
   * ------------------------------------------------------------------- */
  async function renderUsers() {
    const seed = await window.Meridian.data.getData('members');
    let registered = [];
    try { registered = JSON.parse(localStorage.getItem('meridian:registeredMembers')) || []; } catch { /* ignore malformed data */ }
    const users = [...seed, ...registered];
    const container = document.getElementById('users-section');
    container.innerHTML = `
      <div class="app-topbar"><p class="text-muted-m">${users.length} accounts (seed + demo sign-ups on this device)</p></div>
      <div class="table-m-wrap">
        <table class="table-m">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Tier</th><th>Joined</th></tr></thead>
          <tbody>${users.map((u) => `
            <tr>
              <td>${u.name}</td>
              <td>${u.email}</td>
              <td><span class="badge-m ${u.role === 'admin' ? 'badge-m-amber' : ''}">${u.role}</span></td>
              <td>${u.membershipTier}</td>
              <td>${u.joinDate}</td>
            </tr>
          `).join('')}</tbody>
        </table>
      </div>
      <p class="text-muted-m" style="margin-top:1rem;font-size:var(--m-fs-xs);">This demo build only lists members created via Register on this device, plus the two seed accounts — there's no shared user database.</p>
    `;
  }

  /* ---------------------------------------------------------------------
   * CMS — homepage hero editor (genuinely wired into index.html via
   * store namespace "cms-home", read by assets/js/pages/home.js)
   * ------------------------------------------------------------------- */
  function renderCMS() {
    const current = window.Meridian.store.read('cms-home', {});
    document.getElementById('cms-section').innerHTML = `
      <div class="form-m-card" style="max-width:640px;">
        <h3>Homepage hero content</h3>
        <p class="text-muted-m">These fields overwrite the live Home page hero heading and subheading immediately — open Home in another tab to see it update.</p>
        <form id="cms-home-form">
          <div class="form-m-group">
            <label for="cms-heading">Hero heading</label>
            <input type="text" id="cms-heading" value="${current.heading || ''}" placeholder="Where the world's technologists build what's next.">
          </div>
          <div class="form-m-group">
            <label for="cms-subheading">Hero subheading</label>
            <textarea id="cms-subheading" rows="3" placeholder="Meridian is the independent home for research, standards, and lifelong learning in technology...">${current.subheading || ''}</textarea>
          </div>
          <button type="submit" class="btn-m btn-m-primary">Publish to Home</button>
          <button type="button" class="btn-m btn-m-secondary" id="cms-reset-btn">Reset to default</button>
        </form>
      </div>
    `;
    document.getElementById('cms-home-form').addEventListener('submit', (e) => {
      e.preventDefault();
      window.Meridian.store.write('cms-home', {
        heading: document.getElementById('cms-heading').value.trim(),
        subheading: document.getElementById('cms-subheading').value.trim(),
      });
      window.Meridian.toast.show({ type: 'success', title: 'Homepage updated', message: 'Live on Home immediately.' });
    });
    document.getElementById('cms-reset-btn').addEventListener('click', () => {
      window.Meridian.store.write('cms-home', {});
      renderCMS();
      window.Meridian.toast.show({ type: 'success', title: 'Reset to default hero copy' });
    });
  }

  /* ---------------------------------------------------------------------
   * Media (mock — no real backend to store uploads against)
   * ------------------------------------------------------------------- */
  function renderMedia() {
    const items = [
      { icon: 'fa-file-pdf', label: 'AI-Safety-Whitepaper.pdf' },
      { icon: 'fa-file-pdf', label: 'PQC-Migration-Checklist.pdf' },
      { icon: 'fa-image', label: 'msec-2026-banner.svg' },
      { icon: 'fa-image', label: 'chapter-photo-tokyo.jpg' },
      { icon: 'fa-file-code', label: 'design-tokens.json' },
      { icon: 'fa-image', label: 'greencompute-2027.svg' },
    ];
    document.getElementById('media-section').innerHTML = `
      <div class="app-topbar"><p class="text-muted-m">${items.length} assets</p><button type="button" class="btn-m btn-m-primary" id="media-upload-btn"><i class="fa-solid fa-upload" aria-hidden="true"></i> Upload</button></div>
      <div class="media-grid">${items.map((m) => `<div class="media-tile"><i class="fa-solid ${m.icon}" aria-hidden="true"></i><span>${m.label}</span></div>`).join('')}</div>
    `;
    document.getElementById('media-upload-btn').addEventListener('click', () => {
      window.Meridian.toast.show({ type: 'info', title: 'Demo build', message: 'File uploads aren’t wired up to real storage in this preview.' });
    });
  }

  /* ---------------------------------------------------------------------
   * SEO
   * ------------------------------------------------------------------- */
  const SEO_PAGES = [
    { id: 'home', label: 'Home', url: 'meridian-society.example/', title: 'Meridian Technology Society — Global Home for Technology Professionals', desc: "Meridian Technology Society connects 483,000+ technology professionals across 148 countries." },
    { id: 'publications', label: 'Publications', url: 'meridian-society.example/pages/publications.html', title: 'Publications Library | Meridian Technology Society', desc: 'Search 214,000+ peer-reviewed papers across journals, magazines, transactions, and proceedings.' },
    { id: 'membership', label: 'Membership', url: 'meridian-society.example/pages/membership.html', title: 'Membership Tiers & Pricing | Meridian Technology Society', desc: "Compare Meridian membership tiers and see what's included with each." },
  ];

  function renderSEO() {
    const overrides = window.Meridian.store.read('admin-seo-overrides', {});
    let activeId = SEO_PAGES[0].id;

    function currentPage() {
      const base = SEO_PAGES.find((p) => p.id === activeId);
      return { ...base, ...(overrides[activeId] || {}) };
    }

    function paint() {
      const page = currentPage();
      document.getElementById('seo-form-mount').innerHTML = `
        <div class="form-m-group"><label for="seo-title">Meta title</label><input type="text" id="seo-title" value="${page.title}" maxlength="70"></div>
        <div class="form-m-group"><label for="seo-desc">Meta description</label><textarea id="seo-desc" rows="3" maxlength="160">${page.desc}</textarea></div>
        <button type="button" class="btn-m btn-m-primary" id="seo-save-btn">Save meta tags</button>
        <div class="serp-preview" style="margin-top:1rem;">
          <div class="serp-url">${page.url}</div>
          <div class="serp-title">${page.title}</div>
          <div class="serp-desc">${page.desc}</div>
        </div>
      `;
      document.querySelectorAll('#seo-page-list button').forEach((b) => b.classList.toggle('is-active', b.dataset.pageId === activeId));

      const titleInput = document.getElementById('seo-title');
      const descInput = document.getElementById('seo-desc');
      const previewTitle = document.querySelector('.serp-title');
      const previewDesc = document.querySelector('.serp-desc');
      titleInput.addEventListener('input', () => { previewTitle.textContent = titleInput.value; });
      descInput.addEventListener('input', () => { previewDesc.textContent = descInput.value; });
      document.getElementById('seo-save-btn').addEventListener('click', () => {
        overrides[activeId] = { title: titleInput.value, desc: descInput.value };
        window.Meridian.store.write('admin-seo-overrides', overrides);
        window.Meridian.toast.show({ type: 'success', title: 'Meta tags saved for this page (demo preview only)' });
      });
    }

    document.getElementById('seo-section').innerHTML = `
      <div class="grid-2">
        <div>
          <h3>Pages</h3>
          <div class="seo-page-list" id="seo-page-list">
            ${SEO_PAGES.map((p) => `<button type="button" data-page-id="${p.id}">${p.label}</button>`).join('')}
          </div>
        </div>
        <div>
          <h3>Edit meta tags</h3>
          <div id="seo-form-mount"></div>
        </div>
      </div>
    `;
    document.getElementById('seo-page-list').addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      activeId = btn.dataset.pageId;
      paint();
    });
    paint();
  }

  /* ---------------------------------------------------------------------
   * Roles & Permissions
   * ------------------------------------------------------------------- */
  function renderRoles() {
    const perms = ['View content', 'Bookmark & enroll', 'Publish publications/events/posts', 'Manage users', 'Manage roles & billing'];
    const defaults = { member: [true, true, false, false, false], admin: [true, true, true, true, true] };
    document.getElementById('roles-section').innerHTML = `
      <p class="text-muted-m">This demo build only implements two real roles (Member, Admin) — the matrix below illustrates how a larger permission model would be exposed.</p>
      <div class="table-m-wrap">
        <table class="table-m roles-matrix">
          <thead><tr><th>Permission</th><th>Member</th><th>Editor</th><th>Admin</th></tr></thead>
          <tbody>
            ${perms.map((p, i) => `
              <tr>
                <td>${p}</td>
                <td><label class="switch-m"><input type="checkbox" ${defaults.member[i] ? 'checked' : ''} disabled><span class="slider"></span></label></td>
                <td><label class="switch-m"><input type="checkbox" ${i < 3 ? 'checked' : ''} disabled><span class="slider"></span></label></td>
                <td><label class="switch-m"><input type="checkbox" ${defaults.admin[i] ? 'checked' : ''} disabled><span class="slider"></span></label></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ---------------------------------------------------------------------
   * Boot
   * ------------------------------------------------------------------- */
  function init() {
    const session = window.Meridian.auth.requireAuth({ role: 'admin' });
    if (!session) return;

    document.getElementById('sidebar-avatar').textContent = session.initials;
    document.getElementById('sidebar-name').textContent = session.name;
    document.getElementById('sidebar-tier').textContent = 'Administrator';

    window.Meridian.router.mountSectionRouter({
      sections: Object.keys(SECTION_TITLES),
      defaultSection: 'analytics',
      onChange: (name, alreadyShown) => {
        document.getElementById('admin-section-title').textContent = SECTION_TITLES[name];
        if (name === 'analytics') renderAnalytics();
        if (name === 'users') renderUsers();
        if (name === 'cms') renderCMS();
        if (name === 'events') eventsManager.render();
        if (name === 'publications') publicationsManager.render();
        if (name === 'blogs') blogsManager.render();
        if (name === 'communities') communitiesManager.render();
        if (name === 'media') renderMedia();
        if (name === 'seo') renderSEO();
        if (name === 'roles') renderRoles();
        window.Meridian.tilt.init(document);
      },
    });
  }

  init();
})();
