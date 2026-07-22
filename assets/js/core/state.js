/**
 * Generic localStorage-backed JSON store. Every feature that needs to
 * "persist" in this backend-less build (bookmarks, comments, notification
 * read-state, admin CMS overlays, community memberships) reads/writes
 * through this one helper instead of hand-rolling JSON.parse/stringify
 * everywhere.
 */
(function () {
  const PREFIX = 'meridian:store:';

  function read(namespace, fallback) {
    try {
      const raw = localStorage.getItem(PREFIX + namespace);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function write(namespace, value) {
    localStorage.setItem(PREFIX + namespace, JSON.stringify(value));
    document.dispatchEvent(new CustomEvent('meridian:store-changed', { detail: { namespace, value } }));
  }

  /** Convenience for array-shaped stores keyed by id (bookmarks, joined communities, etc.) */
  function toggleInSet(namespace, id) {
    const list = read(namespace, []);
    const idx = list.indexOf(id);
    if (idx >= 0) list.splice(idx, 1); else list.push(id);
    write(namespace, list);
    return list;
  }

  function isInSet(namespace, id) {
    return read(namespace, []).includes(id);
  }

  window.Meridian = window.Meridian || {};
  window.Meridian.store = { read, write, toggleInSet, isInSet };
})();
