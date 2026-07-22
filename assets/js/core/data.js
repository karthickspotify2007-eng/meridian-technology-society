/**
 * Small fetch+cache layer over the /data/*.json mock content files.
 * All public pages read through this so list/filter/search logic never
 * duplicates fetch/parse boilerplate.
 *
 * `getMerged`/`getAllMerged` additionally overlay any Admin CMS edits for
 * the resources Admin can manage (publications, events, blog, communities —
 * see ADMIN_MANAGED below and assets/js/pages/admin.js). The overlay is
 * read fresh on every call (cheap localStorage read) rather than cached, so
 * an edit made in one tab/section shows up immediately everywhere else on
 * the same page without needing a reload — this is what makes the Admin
 * CMS's changes actually take effect on the public site instead of being
 * cosmetic.
 */
(function () {
  const cache = new Map();
  const ADMIN_MANAGED = ['publications', 'events', 'blog', 'communities'];
  const OVERLAY_PREFIX = 'admin-overlay-';

  async function getData(name) {
    if (cache.has(name)) return cache.get(name);
    const promise = fetch(`/data/${name}.json`, { cache: 'no-cache' })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load data/${name}.json: ${res.status}`);
        return res.json();
      })
      .catch((err) => {
        console.error('[Meridian] data load failed', name, err);
        return [];
      });
    cache.set(name, promise);
    return promise;
  }

  async function getAllData(names) {
    const results = await Promise.all(names.map(getData));
    return names.reduce((acc, name, i) => {
      acc[name] = results[i];
      return acc;
    }, {});
  }

  function applyOverlay(name, seedItems) {
    if (!ADMIN_MANAGED.includes(name)) return seedItems;
    const overlay = window.Meridian.store.read(`${OVERLAY_PREFIX}${name}`, { edits: {}, deletes: [], adds: [] });
    const base = seedItems
      .filter((item) => !overlay.deletes.includes(String(item.id)))
      .map((item) => (overlay.edits[item.id] ? { ...item, ...overlay.edits[item.id] } : item));
    return [...base, ...overlay.adds];
  }

  async function getMerged(name) {
    const seed = await getData(name);
    return applyOverlay(name, seed);
  }

  async function getAllMerged(names) {
    const results = await Promise.all(names.map(getMerged));
    return names.reduce((acc, name, i) => {
      acc[name] = results[i];
      return acc;
    }, {});
  }

  window.Meridian = window.Meridian || {};
  window.Meridian.data = { getData, getAllData, getMerged, getAllMerged, ADMIN_MANAGED, OVERLAY_PREFIX };
})();
