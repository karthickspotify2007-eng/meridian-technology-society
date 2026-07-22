/**
 * Careers board: type + department filters, mock application via DetailModal.
 */
(function () {
  async function init() {
    const jobs = await window.Meridian.data.getData('jobs');
    window.Meridian.detail.registerItems('job', jobs);

    const typeSelect = document.getElementById('filter-type');
    const deptSelect = document.getElementById('filter-department');
    [...new Set(jobs.map((j) => j.type))].sort().forEach((t) => typeSelect.add(new Option(t, t)));
    [...new Set(jobs.map((j) => j.department))].sort().forEach((d) => deptSelect.add(new Option(d, d)));

    window.Meridian.listing.create({
      items: jobs,
      container: document.getElementById('jobs-grid'),
      renderCard: window.Meridian.cards.jobCard,
      pageSize: 6,
      countEl: document.getElementById('jobs-count'),
      controls: {
        search: { el: document.getElementById('jobs-search'), keys: ['title', 'description', 'location'] },
        selects: [{ el: typeSelect, key: 'type' }, { el: deptSelect, key: 'department' }],
        paginationEl: document.getElementById('jobs-pagination'),
      },
      onRender: () => { window.Meridian.tilt.init(document); if (window.AOS) AOS.refreshHard(); },
    });

    const openId = new URLSearchParams(location.search).get('id');
    if (openId) window.Meridian.detail.open('job', openId);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
