/**
 * Communities page: fetches /data/communities.json and renders it through
 * the shared Filters.js listing controller (search only — no selects/chips
 * needed for eight items) so the search box works exactly like it does on
 * every other listing page.
 */
(function () {
  async function init() {
    const communities = await window.Meridian.data.getMerged('communities');
    window.Meridian.listing.create({
      items: communities,
      container: document.getElementById('communities-grid'),
      renderCard: window.Meridian.cards.communityCard,
      pageSize: 8,
      countEl: document.getElementById('communities-count'),
      controls: {
        search: { el: document.getElementById('communities-search'), keys: ['name', 'description', 'topics'] },
      },
      onRender: () => {
        window.Meridian.tilt.init(document);
        window.Meridian.cards.syncJoinButtons(document);
        if (window.AOS) AOS.refreshHard();
      },
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
