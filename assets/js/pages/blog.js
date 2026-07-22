/**
 * Blog listing: category filter, newest-first.
 */
(function () {
  async function init() {
    const posts = await window.Meridian.data.getMerged('blog');
    const categorySelect = document.getElementById('filter-category');
    [...new Set(posts.map((p) => p.category))].sort().forEach((c) => categorySelect.add(new Option(c, c)));

    window.Meridian.listing.create({
      items: [...posts].sort((a, b) => new Date(b.date) - new Date(a.date)),
      container: document.getElementById('blog-grid'),
      renderCard: window.Meridian.cards.blogCard,
      pageSize: 6,
      countEl: document.getElementById('blog-count'),
      controls: {
        search: { el: document.getElementById('blog-search'), keys: ['title', 'excerpt', 'author', 'tags'] },
        selects: [{ el: categorySelect, key: 'category' }],
        paginationEl: document.getElementById('blog-pagination'),
      },
      onRender: () => {
        window.Meridian.tilt.init(document);
        window.Meridian.bookmark.init(document);
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
