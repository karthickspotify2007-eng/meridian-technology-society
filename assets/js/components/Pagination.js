/**
 * Renders numbered pagination controls into a container element and wires
 * click handling. Used by Filters.js's listing controller; also usable
 * standalone (e.g. Admin tables).
 */
(function () {
  function renderPagination({ container, totalItems, pageSize, currentPage, onPageChange }) {
    if (!container) return;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    if (totalPages <= 1) { container.innerHTML = ''; return; }

    function pageButton(page, label = page, isCurrent = false) {
      return `<button type="button" class="page-btn-m ${isCurrent ? 'is-active' : ''}" data-page="${page}" ${isCurrent ? 'aria-current="page"' : ''}>${label}</button>`;
    }

    let pages = [];
    const windowSize = 1;
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= windowSize) pages.push(p);
    }
    let html = `<button type="button" class="page-btn-m page-nav-m" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous page"><i class="fa-solid fa-chevron-left"></i></button>`;
    let lastPage = 0;
    pages.forEach((p) => {
      if (p - lastPage > 1) html += '<span class="page-ellipsis-m">&hellip;</span>';
      html += pageButton(p, p, p === currentPage);
      lastPage = p;
    });
    html += `<button type="button" class="page-btn-m page-nav-m" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Next page"><i class="fa-solid fa-chevron-right"></i></button>`;

    container.innerHTML = html;
    container.querySelectorAll('[data-page]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const page = Number(btn.dataset.page);
        if (page >= 1 && page <= totalPages) onPageChange(page);
      });
    });
  }

  window.Meridian = window.Meridian || {};
  window.Meridian.pagination = { render: renderPagination };
})();
