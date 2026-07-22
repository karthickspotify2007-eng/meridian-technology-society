/**
 * Conferences listing: status chips (All/Upcoming/Past) + topic filter,
 * backed by the shared Filters.js listing controller.
 */
(function () {
  async function init() {
    const conferences = await window.Meridian.data.getData('conferences');
    window.Meridian.detail.registerItems('conference', conferences);

    const topicSelect = document.getElementById('filter-topic');
    [...new Set(conferences.map((c) => c.topic))].sort().forEach((t) => topicSelect.add(new Option(t, t)));

    const params = new URLSearchParams(location.search);
    const initialStatus = params.get('status');
    if (initialStatus) {
      const chip = document.querySelector(`#conference-status-chips [data-value="${initialStatus}"]`);
      if (chip) {
        document.querySelectorAll('#conference-status-chips .chip-m').forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');
      }
    }

    window.Meridian.listing.create({
      items: conferences,
      container: document.getElementById('conferences-grid'),
      renderCard: window.Meridian.cards.conferenceCard,
      pageSize: 6,
      countEl: document.getElementById('conferences-count'),
      controls: {
        search: { el: document.getElementById('conferences-search'), keys: ['title', 'code', 'description', 'city', 'country'] },
        selects: [{ el: topicSelect, key: 'topic' }],
        chips: [{ container: document.getElementById('conference-status-chips'), key: 'status' }],
        sort: {
          el: document.getElementById('conferences-sort'),
          comparators: { soonest: (a, b) => new Date(a.startDate) - new Date(b.startDate), latest: (a, b) => new Date(b.startDate) - new Date(a.startDate) },
        },
        paginationEl: document.getElementById('conferences-pagination'),
      },
      onRender: () => {
        window.Meridian.tilt.init(document);
        window.Meridian.bookmark.init(document);
        if (window.AOS) AOS.refreshHard();
      },
    });

    const openId = params.get('id');
    if (openId) window.Meridian.detail.open('conference', openId);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
