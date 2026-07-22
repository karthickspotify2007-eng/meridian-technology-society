/**
 * Resources downloads library: type + topic filters.
 */
(function () {
  async function init() {
    const resources = await window.Meridian.data.getData('resources');
    window.Meridian.detail.registerItems('resource', resources);

    const typeSelect = document.getElementById('filter-type');
    const topicSelect = document.getElementById('filter-topic');
    [...new Set(resources.map((r) => r.type))].sort().forEach((t) => typeSelect.add(new Option(t, t)));
    [...new Set(resources.map((r) => r.topic))].sort().forEach((t) => topicSelect.add(new Option(t, t)));

    window.Meridian.listing.create({
      items: resources,
      container: document.getElementById('resources-grid'),
      renderCard: window.Meridian.cards.resourceCard,
      pageSize: 6,
      countEl: document.getElementById('resources-count'),
      controls: {
        search: { el: document.getElementById('resources-search'), keys: ['title', 'description'] },
        selects: [{ el: typeSelect, key: 'type' }, { el: topicSelect, key: 'topic' }],
        paginationEl: document.getElementById('resources-pagination'),
      },
      onRender: () => {
        window.Meridian.tilt.init(document);
        window.Meridian.bookmark.init(document);
        if (window.AOS) AOS.refreshHard();
      },
    });

    const openId = new URLSearchParams(location.search).get('id');
    if (openId) window.Meridian.detail.open('resource', openId);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
