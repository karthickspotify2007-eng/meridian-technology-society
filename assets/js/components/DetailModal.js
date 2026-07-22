/**
 * Shared detail-modal system for publications/conferences/events/courses/
 * certifications/resources/news/jobs. Any page that renders a list of one
 * of these types calls `Meridian.detail.registerItems(type, items)` once
 * after fetching its data; clicking any `[data-open-detail]` button
 * (emitted by Card.js) anywhere on that page then looks the item up by id
 * and renders the right template into the shared Modal.js dialog. This is
 * what lets a single publication/conference/etc. be "deep-linked" via
 * `?id=` without a dedicated static file per item.
 */
(function () {
  const registry = {};

  function registerItems(type, items) {
    registry[type] = new Map(items.map((i) => [String(i.id), i]));
  }

  function getItem(type, id) {
    return registry[type]?.get(String(id));
  }

  function bindNewInteractiveContent(scope) {
    window.Meridian.bookmark.init(scope);
    window.Meridian.share.init(scope);
  }

  const renderers = {
    publication(p) {
      window.Meridian.modal.open({
        title: p.title,
        bodyHTML: `
          <div class="tag-row" style="margin-bottom:0.8rem;">
            <span class="badge-m">${p.type}</span><span class="badge-m badge-m-teal">${p.topic}</span><span class="badge-m badge-m-amber">${p.year}</span>
          </div>
          <p><strong>Authors:</strong> ${p.authors.join(', ')}</p>
          <p>${p.abstract}</p>
          <p class="text-muted-m" style="font-size:var(--m-fs-sm);">${p.volume} &middot; pp. ${p.pages} &middot; DOI: ${p.doi} &middot; ${p.citations} citations</p>
        `,
        footHTML: `
          <button type="button" class="btn-m btn-m-primary" id="modal-download-btn"><i class="fa-solid fa-download" aria-hidden="true"></i> Download PDF</button>
          ${bookmarkHTML('publication', p.id, p.title)}
          ${shareHTML(p.title)}
        `,
      });
      wireDemoDownload();
      bindNewInteractiveContent(document.querySelector('.m-modal'));
    },
    conference(c) {
      window.Meridian.modal.open({
        title: c.title,
        bodyHTML: `
          <div class="tag-row" style="margin-bottom:0.8rem;">
            <span class="badge-m">${c.code}</span><span class="badge-m badge-m-teal">${c.mode}</span>
          </div>
          <p>${c.description}</p>
          <p class="text-muted-m" style="font-size:var(--m-fs-sm);">
            <i class="fa-solid fa-calendar-days" aria-hidden="true"></i> ${window.Meridian.cards.formatDate(c.startDate)} &ndash; ${window.Meridian.cards.formatDate(c.endDate)}<br>
            <i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${c.city}, ${c.country}
          </p>
        `,
        footHTML: `
          <button type="button" class="btn-m btn-m-primary" id="modal-interest-btn">${c.status === 'past' ? 'View proceedings' : 'Register interest'}</button>
          ${bookmarkHTML('conference', c.id, c.title)}
          ${shareHTML(c.title)}
        `,
      });
      document.getElementById('modal-interest-btn')?.addEventListener('click', () => {
        window.Meridian.toast.show({ type: 'success', title: c.status === 'past' ? 'Proceedings linked in Publications' : 'Interest registered', message: c.status === 'past' ? '' : 'We’ll email you when registration opens.' });
        window.Meridian.modal.close();
      });
      bindNewInteractiveContent(document.querySelector('.m-modal'));
    },
    event(e) {
      const pct = Math.min(100, Math.round((e.registered / e.capacity) * 100));
      window.Meridian.modal.open({
        title: e.title,
        bodyHTML: `
          <div class="tag-row" style="margin-bottom:0.8rem;"><span class="badge-m">${e.type}</span><span class="badge-m badge-m-teal">${e.mode}</span></div>
          <p>${e.description}</p>
          <p class="text-muted-m" style="font-size:var(--m-fs-sm);">
            <i class="fa-solid fa-clock" aria-hidden="true"></i> ${window.Meridian.cards.formatDate(e.date)} &middot; ${e.time} ${e.timezone}<br>
            <i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${e.location}
          </p>
          <div style="background:var(--m-bg-alt);border-radius:var(--m-radius-pill);height:8px;overflow:hidden;margin-bottom:0.4rem;">
            <div style="width:${pct}%;height:100%;background:var(--m-gradient-primary);"></div>
          </div>
          <p class="text-muted-m" style="font-size:var(--m-fs-xs);">${e.registered} of ${e.capacity} spots filled</p>
          <form id="event-register-form" novalidate>
            <div class="form-m-row">
              <div class="form-m-group"><label for="ereg-name">Full name</label><input type="text" id="ereg-name" required></div>
              <div class="form-m-group"><label for="ereg-email">Email</label><input type="email" id="ereg-email" required></div>
            </div>
          </form>
        `,
        footHTML: `
          <button type="submit" form="event-register-form" class="btn-m btn-m-primary">Confirm registration</button>
          ${bookmarkHTML('event', e.id, e.title)}
          ${shareHTML(e.title)}
        `,
      });
      document.getElementById('event-register-form')?.addEventListener('submit', (ev) => {
        ev.preventDefault();
        addToSet('registered-events', e.id);
        window.Meridian.toast.show({ type: 'success', title: 'You’re registered!', message: `Find "${e.title}" anytime in Dashboard → Events.` });
        window.Meridian.modal.close();
      });
      bindNewInteractiveContent(document.querySelector('.m-modal'));
    },
    course(c) {
      window.Meridian.modal.open({
        title: c.title,
        bodyHTML: `
          <div class="tag-row" style="margin-bottom:0.8rem;"><span class="badge-m">${c.level}</span><span class="badge-m badge-m-teal">${c.category}</span></div>
          <p>${c.description}</p>
          <p class="text-muted-m" style="font-size:var(--m-fs-sm);">
            <i class="fa-solid fa-chalkboard-user" aria-hidden="true"></i> ${c.instructor} &middot;
            <i class="fa-solid fa-clock" aria-hidden="true"></i> ${c.duration} &middot; ${c.format}<br>
            <i class="fa-solid fa-star" style="color:var(--m-amber-500);" aria-hidden="true"></i> ${c.rating} (${c.students.toLocaleString()} enrolled) &middot; ${c.price}
          </p>
        `,
        footHTML: `
          <button type="button" class="btn-m btn-m-primary" id="modal-enroll-btn">Enroll now</button>
          ${bookmarkHTML('course', c.id, c.title)}
          ${shareHTML(c.title)}
        `,
      });
      document.getElementById('modal-enroll-btn')?.addEventListener('click', () => {
        if (!window.Meridian.auth.isAuthenticated()) {
          window.Meridian.toast.show({ type: 'info', title: 'Log in to enroll', message: 'Create a free Meridian account to enroll in courses.' });
          return;
        }
        addToSet('enrolled-courses', c.id);
        window.Meridian.toast.show({ type: 'success', title: 'Enrolled!', message: 'Find this course anytime in Dashboard → Courses.' });
        window.Meridian.modal.close();
      });
      bindNewInteractiveContent(document.querySelector('.m-modal'));
    },
    certification(c) {
      window.Meridian.modal.open({
        title: c.title,
        bodyHTML: `
          <div class="tag-row" style="margin-bottom:0.8rem;"><span class="badge-m">${c.code}</span><span class="badge-m badge-m-teal">${c.level}</span></div>
          <p>${c.description}</p>
          <p class="text-muted-m" style="font-size:var(--m-fs-sm);">
            <i class="fa-solid fa-clock" aria-hidden="true"></i> ${c.examDuration} exam &middot; valid ${c.validity}<br>
            <i class="fa-solid fa-clipboard-check" aria-hidden="true"></i> Prerequisites: ${c.prerequisites}
          </p>
        `,
        footHTML: `<button type="button" class="btn-m btn-m-primary" id="modal-cert-apply">Start application</button>${shareHTML(c.title)}`,
      });
      document.getElementById('modal-cert-apply')?.addEventListener('click', () => {
        if (!window.Meridian.auth.isAuthenticated()) {
          window.Meridian.toast.show({ type: 'info', title: 'Log in to apply', message: 'Certification applications require a member account.' });
          return;
        }
        addToSet('cert-applications', c.id);
        window.Meridian.toast.show({ type: 'success', title: 'Application started', message: 'Continue anytime from Dashboard → Certificates.' });
        window.Meridian.modal.close();
      });
      bindNewInteractiveContent(document.querySelector('.m-modal'));
    },
    resource(r) {
      window.Meridian.modal.open({
        title: r.title,
        bodyHTML: `
          <div class="tag-row" style="margin-bottom:0.8rem;"><span class="badge-m">${r.type}</span><span class="badge-m badge-m-teal">${r.topic}</span></div>
          <p>${r.description}</p>
          <p class="text-muted-m" style="font-size:var(--m-fs-sm);">${r.format}${r.pages ? ` &middot; ${r.pages} pages` : ''}</p>
        `,
        footHTML: `<button type="button" class="btn-m btn-m-primary" id="modal-download-btn"><i class="fa-solid fa-download" aria-hidden="true"></i> Download</button>${bookmarkHTML('resource', r.id, r.title)}${shareHTML(r.title)}`,
      });
      wireDemoDownload();
      bindNewInteractiveContent(document.querySelector('.m-modal'));
    },
    news(n) {
      window.Meridian.modal.open({
        title: n.title,
        bodyHTML: `<div class="tag-row" style="margin-bottom:0.8rem;"><span class="badge-m">${n.category}</span></div><p>${n.summary}</p><p class="text-muted-m" style="font-size:var(--m-fs-sm);">${window.Meridian.cards.formatDate(n.date)}</p>`,
        footHTML: shareHTML(n.title),
      });
      bindNewInteractiveContent(document.querySelector('.m-modal'));
    },
    job(j) {
      window.Meridian.modal.open({
        title: j.title,
        bodyHTML: `
          <div class="tag-row" style="margin-bottom:0.8rem;"><span class="badge-m">${j.type}</span><span class="badge-m badge-m-teal">${j.department}</span></div>
          <p>${j.description}</p>
          <p><strong>What we're looking for:</strong></p>
          <ul>${j.requirements.map((r) => `<li>${r}</li>`).join('')}</ul>
          <p class="text-muted-m" style="font-size:var(--m-fs-sm);"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${j.location}</p>
          <form id="job-apply-form" novalidate>
            <div class="form-m-group"><label for="japp-name">Full name</label><input type="text" id="japp-name" required></div>
            <div class="form-m-group"><label for="japp-email">Email</label><input type="email" id="japp-email" required></div>
          </form>
        `,
        footHTML: `<button type="submit" form="job-apply-form" class="btn-m btn-m-primary">Submit application</button>${shareHTML(j.title)}`,
      });
      document.getElementById('job-apply-form')?.addEventListener('submit', (ev) => {
        ev.preventDefault();
        window.Meridian.toast.show({ type: 'success', title: 'Application submitted', message: `Thanks for applying to ${j.title}.` });
        window.Meridian.modal.close();
      });
      bindNewInteractiveContent(document.querySelector('.m-modal'));
    },
  };

  function addToSet(namespace, id) {
    const list = window.Meridian.store.read(namespace, []);
    if (!list.includes(id)) window.Meridian.store.write(namespace, [...list, id]);
  }

  function bookmarkHTML(type, id, title) {
    return `<button type="button" class="btn-m btn-m-secondary" data-bookmark-btn data-bookmark-type="${type}" data-bookmark-id="${id}" data-bookmark-title="${title.replace(/"/g, '&quot;')}" aria-pressed="false"><i class="fa-regular fa-heart" aria-hidden="true"></i> Save</button>`;
  }
  function shareHTML(title) {
    return `<button type="button" class="btn-m btn-m-ghost" data-share-btn data-share-title="${title.replace(/"/g, '&quot;')}"><i class="fa-solid fa-share-nodes" aria-hidden="true"></i> Share</button>`;
  }
  function wireDemoDownload() {
    document.getElementById('modal-download-btn')?.addEventListener('click', () => {
      window.Meridian.toast.show({ type: 'info', title: 'Demo build', message: 'File downloads aren’t wired up in this preview.' });
    });
  }

  function open(type, id) {
    const item = getItem(type, id);
    if (!item) return;
    renderers[type]?.(item);
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open-detail]');
    if (!btn) return;
    open(btn.dataset.openDetail, btn.dataset.id);
  });

  window.Meridian = window.Meridian || {};
  window.Meridian.detail = { registerItems, getItem, open };
})();
