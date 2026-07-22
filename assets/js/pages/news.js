/**
 * Newsroom listing: category filter, newest-first by default.
 */
(function () {
  async function init() {
    const news = await window.Meridian.data.getData('news');
    window.Meridian.detail.registerItems('news', news);

    const categorySelect = document.getElementById('filter-category');
    [...new Set(news.map((n) => n.category))].sort().forEach((c) => categorySelect.add(new Option(c, c)));

    window.Meridian.listing.create({
      items: [...news].sort((a, b) => new Date(b.date) - new Date(a.date)),
      container: document.getElementById('news-grid'),
      renderCard: window.Meridian.cards.newsCard,
      pageSize: 6,
      countEl: document.getElementById('news-count'),
      controls: {
        search: { el: document.getElementById('news-search'), keys: ['title', 'summary'] },
        selects: [{ el: categorySelect, key: 'category' }],
        paginationEl: document.getElementById('news-pagination'),
      },
      onRender: () => { window.Meridian.tilt.init(document); if (window.AOS) AOS.refreshHard(); },
    });

    const openId = new URLSearchParams(location.search).get('id');
    if (openId) window.Meridian.detail.open('news', openId);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
