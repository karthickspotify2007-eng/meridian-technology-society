/**
 * Generic listing controller: search + select filters + single-select chip
 * groups + sort, paginated card rendering. One implementation reused by
 * Publications, Conferences, Events, Learning, Certifications, Resources,
 * News, Blog, and Careers instead of writing the same filter/search/paginate
 * logic nine times.
 */
(function () {
  function debounce(fn, wait) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  }

  function create({ items, container, renderCard, pageSize = 9, countEl, emptyHTML, controls = {}, onRender }) {
    const state = { page: 1, items };

    function matchesSearch(item) {
      const { el, keys } = controls.search || {};
      const query = el ? el.value.trim().toLowerCase() : '';
      if (!query) return true;
      const haystack = keys.map((k) => String(item[k] ?? '')).join(' ').toLowerCase();
      return haystack.includes(query);
    }

    function matchesSelects(item) {
      return (controls.selects || []).every(({ el, key }) => {
        const val = el.value;
        return !val || val === 'all' || String(item[key]) === val;
      });
    }

    function matchesChips(item) {
      return (controls.chips || []).every(({ container: chipContainer, key }) => {
        const active = chipContainer.querySelector('.chip-m.is-active');
        const val = active ? active.dataset.value : 'all';
        return !val || val === 'all' || String(item[key]) === val;
      });
    }

    function computeFiltered() {
      let list = state.items.filter((item) => matchesSearch(item) && matchesSelects(item) && matchesChips(item));
      if (controls.sort?.el && controls.sort.comparators) {
        const cmp = controls.sort.comparators[controls.sort.el.value];
        if (cmp) list = [...list].sort(cmp);
      }
      return list;
    }

    function renderPage() {
      const filtered = computeFiltered();
      const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      state.page = Math.min(state.page, totalPages);
      const start = (state.page - 1) * pageSize;
      const pageItems = filtered.slice(start, start + pageSize);

      container.innerHTML = pageItems.length ? pageItems.map(renderCard).join('') : (emptyHTML || '<div class="empty-state"><p>No results match your filters.</p></div>');
      if (countEl) countEl.textContent = `${filtered.length} result${filtered.length === 1 ? '' : 's'}`;
      if (controls.paginationEl) {
        window.Meridian.pagination.render({
          container: controls.paginationEl,
          totalItems: filtered.length,
          pageSize,
          currentPage: state.page,
          onPageChange: (page) => { state.page = page; renderPage(); container.closest('section')?.scrollIntoView({ block: 'start', behavior: 'smooth' }); },
        });
      }
      if (onRender) onRender(pageItems);
    }

    function bind(el, evt, handler) { if (el) el.addEventListener(evt, handler); }

    bind(controls.search?.el, 'input', debounce(() => { state.page = 1; renderPage(); }, 220));
    (controls.selects || []).forEach(({ el }) => bind(el, 'change', () => { state.page = 1; renderPage(); }));
    bind(controls.sort?.el, 'change', () => { state.page = 1; renderPage(); });
    (controls.chips || []).forEach(({ container: chipContainer }) => {
      chipContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.chip-m');
        if (!btn) return;
        chipContainer.querySelectorAll('.chip-m').forEach((c) => c.classList.remove('is-active'));
        btn.classList.add('is-active');
        state.page = 1;
        renderPage();
      });
    });

    renderPage();
    return {
      refresh: renderPage,
      setItems: (newItems) => { state.items = newItems; state.page = 1; renderPage(); },
    };
  }

  window.Meridian = window.Meridian || {};
  window.Meridian.listing = { create };
})();
