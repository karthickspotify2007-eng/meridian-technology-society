/**
 * Header notification bell: fetches /data/notifications.json and overlays a
 * localStorage read-state (since the JSON file itself is static seed data).
 * Also exposes `Meridian.notifications.getMerged()` so Dashboard ->
 * Notifications can render the identical list in a fuller layout.
 */
(function () {
  const READ_NAMESPACE = 'notifications-read';

  async function getMerged() {
    const seed = await window.Meridian.data.getData('notifications');
    const readIds = new Set(window.Meridian.store.read(READ_NAMESPACE, []));
    return seed.map((n) => ({ ...n, read: n.read || readIds.has(n.id) }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function markRead(id) {
    const list = window.Meridian.store.read(READ_NAMESPACE, []);
    if (!list.includes(id)) window.Meridian.store.write(READ_NAMESPACE, [...list, id]);
  }

  async function markAllRead() {
    const all = await window.Meridian.data.getData('notifications');
    window.Meridian.store.write(READ_NAMESPACE, all.map((n) => n.id));
  }

  const TYPE_ICON = {
    certification: 'fa-certificate', community: 'fa-comments', conference: 'fa-calendar-days',
    learning: 'fa-graduation-cap', membership: 'fa-id-card',
  };

  async function renderPanel() {
    const badge = document.getElementById('notif-badge');
    const list = document.getElementById('notif-list');
    if (!badge || !list) return;
    if (!window.Meridian.auth.isAuthenticated()) { badge.hidden = true; return; }

    const items = await getMerged();
    const unread = items.filter((n) => !n.read).length;
    badge.hidden = unread === 0;
    badge.textContent = String(unread);

    list.innerHTML = items.slice(0, 6).map((n) => `
      <div class="m-notif-item ${n.read ? '' : 'is-unread'}" data-notif-id="${n.id}" role="menuitem" tabindex="0">
        <strong><i class="fa-solid ${TYPE_ICON[n.type] || 'fa-bell'}" aria-hidden="true"></i> ${n.title}</strong>
        <span>${n.message}</span>
      </div>
    `).join('') || '<p class="text-muted-m" style="padding:0.6rem;">You&rsquo;re all caught up.</p>';
  }

  function wirePanel() {
    const trigger = document.getElementById('notif-trigger');
    const panel = document.getElementById('notif-panel');
    if (!trigger || !panel) return;
    window.Meridian.ui.bindDropdown(trigger, panel, { onOpen: renderPanel, closeOnSelect: false });

    panel.addEventListener('click', (e) => {
      const item = e.target.closest('[data-notif-id]');
      if (item) { markRead(item.dataset.notifId); renderPanel(); }
      if (e.target.closest('#notif-mark-all')) { markAllRead().then(renderPanel); }
    });
  }

  window.Meridian = window.Meridian || {};
  window.Meridian.onPartialsReady(() => {
    wirePanel();
    renderPanel();
  });

  window.Meridian = window.Meridian || {};
  window.Meridian.notifications = { getMerged, markRead, markAllRead };
})();
