/**
 * Events listing: type + mode filters, date sort, backed by the shared
 * Filters.js listing controller.
 */
(function () {
  async function init() {
    const events = await window.Meridian.data.getMerged('events');
    window.Meridian.detail.registerItems('event', events);

    const typeSelect = document.getElementById('filter-type');
    const modeSelect = document.getElementById('filter-mode');
    [...new Set(events.map((e) => e.type))].sort().forEach((t) => typeSelect.add(new Option(t, t)));
    [...new Set(events.map((e) => e.mode))].sort().forEach((m) => modeSelect.add(new Option(m, m)));

    window.Meridian.listing.create({
      items: events,
      container: document.getElementById('events-grid'),
      renderCard: window.Meridian.cards.eventCard,
      pageSize: 6,
      countEl: document.getElementById('events-count'),
      controls: {
        search: { el: document.getElementById('events-search'), keys: ['title', 'description', 'location'] },
        selects: [{ el: typeSelect, key: 'type' }, { el: modeSelect, key: 'mode' }],
        sort: {
          el: document.getElementById('events-sort'),
          comparators: { soonest: (a, b) => new Date(a.date) - new Date(b.date), latest: (a, b) => new Date(b.date) - new Date(a.date) },
        },
        paginationEl: document.getElementById('events-pagination'),
      },
      onRender: () => {
        window.Meridian.tilt.init(document);
        window.Meridian.bookmark.init(document);
        if (window.AOS) AOS.refreshHard();
      },
    });

    const openId = new URLSearchParams(location.search).get('id');
    if (openId) window.Meridian.detail.open('event', openId);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
