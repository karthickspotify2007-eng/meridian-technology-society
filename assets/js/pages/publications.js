/**
 * Publications library: search + type/topic filters + sort, backed by the
 * shared Filters.js listing controller. Supports deep-linking a single
 * paper via `?id=pub-01`, which the global search modal relies on.
 */
(function () {
  async function init() {
    const publications = await window.Meridian.data.getMerged('publications');
    window.Meridian.detail.registerItems('publication', publications);

    const typeSelect = document.getElementById('filter-type');
    const topicSelect = document.getElementById('filter-topic');
    [...new Set(publications.map((p) => p.type))].sort().forEach((t) => typeSelect.add(new Option(t, t)));
    [...new Set(publications.map((p) => p.topic))].sort().forEach((t) => topicSelect.add(new Option(t, t)));

    window.Meridian.listing.create({
      items: publications,
      container: document.getElementById('publications-grid'),
      renderCard: window.Meridian.cards.publicationCard,
      pageSize: 6,
      countEl: document.getElementById('publications-count'),
      controls: {
        search: { el: document.getElementById('publications-search'), keys: ['title', 'authors', 'abstract'] },
        selects: [{ el: typeSelect, key: 'type' }, { el: topicSelect, key: 'topic' }],
        sort: {
          el: document.getElementById('publications-sort'),
          comparators: {
            newest: (a, b) => b.year - a.year,
            oldest: (a, b) => a.year - b.year,
            cited: (a, b) => b.citations - a.citations,
          },
        },
        paginationEl: document.getElementById('publications-pagination'),
      },
      onRender: () => {
        window.Meridian.tilt.init(document);
        window.Meridian.bookmark.init(document);
        if (window.AOS) AOS.refreshHard();
      },
    });

    const openId = new URLSearchParams(location.search).get('id');
    if (openId) window.Meridian.detail.open('publication', openId);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
