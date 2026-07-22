/**
 * Bookmark ("save") toggle used on Publications/Conferences/Events/Learning/
 * Resources/Blog cards. Persists to the `bookmarks` store as `"type:id"`
 * strings so Dashboard -> Saved items can render across all content types
 * from one list. Requires an authenticated session (mirrors a real product
 * where saving is a member feature); prompts guests to log in instead.
 */
(function () {
  const NAMESPACE = 'bookmarks';

  function keyFor(type, id) { return `${type}:${id}`; }

  function isBookmarked(type, id) {
    return window.Meridian.store.isInSet(NAMESPACE, keyFor(type, id));
  }

  function getAllBookmarks() {
    return window.Meridian.store.read(NAMESPACE, []).map((key) => {
      const [type, ...rest] = key.split(':');
      return { type, id: rest.join(':') };
    });
  }

  function syncButton(btn) {
    const { bookmarkType: type, bookmarkId: id } = btn.dataset;
    const saved = isBookmarked(type, id);
    btn.classList.toggle('is-saved', saved);
    btn.setAttribute('aria-pressed', String(saved));
    const icon = btn.querySelector('i');
    if (icon) icon.className = saved ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
  }

  function initBookmarkButtons(root = document) {
    root.querySelectorAll('[data-bookmark-btn]').forEach((btn) => {
      syncButton(btn);
      if (btn.dataset.bookmarkBound) return;
      btn.dataset.bookmarkBound = 'true';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.Meridian.auth.isAuthenticated()) {
          window.Meridian.toast.show({
            type: 'info', title: 'Log in to save items',
            message: 'Create a free Meridian account to bookmark content to your dashboard.',
          });
          return;
        }
        const { bookmarkType: type, bookmarkId: id, bookmarkTitle: title } = btn.dataset;
        window.Meridian.store.toggleInSet(NAMESPACE, keyFor(type, id));
        syncButton(btn);
        window.Meridian.toast.show({
          type: 'success',
          title: isBookmarked(type, id) ? 'Saved' : 'Removed from saved items',
          message: title || '',
          duration: 2200,
        });
      });
    });
  }

  document.addEventListener('meridian:store-changed', (e) => {
    if (e.detail.namespace === NAMESPACE) initBookmarkButtons();
  });

  window.Meridian = window.Meridian || {};
  window.Meridian.bookmark = { init: initBookmarkButtons, isBookmarked, getAllBookmarks };
})();
