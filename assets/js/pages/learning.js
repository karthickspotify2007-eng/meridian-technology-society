/**
 * Learning Hub: level + category filters, rating sort.
 */
(function () {
  async function init() {
    const courses = await window.Meridian.data.getData('courses');
    window.Meridian.detail.registerItems('course', courses);

    const levelSelect = document.getElementById('filter-level');
    const categorySelect = document.getElementById('filter-category');
    [...new Set(courses.map((c) => c.level))].forEach((l) => levelSelect.add(new Option(l, l)));
    [...new Set(courses.map((c) => c.category))].sort().forEach((c) => categorySelect.add(new Option(c, c)));

    window.Meridian.listing.create({
      items: courses,
      container: document.getElementById('courses-grid'),
      renderCard: window.Meridian.cards.courseCard,
      pageSize: 6,
      countEl: document.getElementById('courses-count'),
      controls: {
        search: { el: document.getElementById('courses-search'), keys: ['title', 'description', 'instructor'] },
        selects: [{ el: levelSelect, key: 'level' }, { el: categorySelect, key: 'category' }],
        sort: {
          el: document.getElementById('courses-sort'),
          comparators: { rating: (a, b) => b.rating - a.rating, popular: (a, b) => b.students - a.students },
        },
        paginationEl: document.getElementById('courses-pagination'),
      },
      onRender: () => {
        window.Meridian.tilt.init(document);
        window.Meridian.bookmark.init(document);
        if (window.AOS) AOS.refreshHard();
      },
    });

    const openId = new URLSearchParams(location.search).get('id');
    if (openId) window.Meridian.detail.open('course', openId);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
