/**
 * Global search (Ctrl/Cmd+K). Builds a lightweight client-side index across
 * publications, conferences, events, courses, certifications, news, blog and
 * jobs the first time it's opened, then filters as you type. Selecting a
 * result navigates to that item's listing page with `?id=` — each listing
 * page's script reads that query param on load and opens the matching
 * detail modal automatically (see Filters.js consumers).
 */
(function () {
  const SOURCES = [
    { key: 'publications', icon: 'fa-book-open', label: 'Publications', page: '/pages/publications.html', title: (i) => i.title, sub: (i) => `${i.type} · ${i.year}` },
    { key: 'conferences', icon: 'fa-calendar-days', label: 'Conferences', page: '/pages/conferences.html', title: (i) => i.title, sub: (i) => `${i.city}, ${i.country}` },
    { key: 'events', icon: 'fa-calendar-check', label: 'Events', page: '/pages/events.html', title: (i) => i.title, sub: (i) => `${i.date} · ${i.mode}` },
    { key: 'courses', icon: 'fa-graduation-cap', label: 'Learning', page: '/pages/learning.html', title: (i) => i.title, sub: (i) => `${i.level} · ${i.duration}` },
    { key: 'certifications', icon: 'fa-certificate', label: 'Certifications', page: '/pages/certifications.html', title: (i) => i.title, sub: (i) => i.code },
    { key: 'news', icon: 'fa-newspaper', label: 'News', page: '/pages/news.html', title: (i) => i.title, sub: (i) => i.category },
    { key: 'blog', icon: 'fa-pen-nib', label: 'Blog', page: '/pages/blog.html', title: (i) => i.title, sub: (i) => i.author, idField: 'slug' },
    { key: 'jobs', icon: 'fa-briefcase', label: 'Careers', page: '/pages/careers.html', title: (i) => i.title, sub: (i) => i.location },
  ];

  let index = null;
  let activeIndex = -1;

  async function buildIndex() {
    if (index) return index;
    const data = await window.Meridian.data.getAllData(SOURCES.map((s) => s.key));
    index = SOURCES.flatMap((src) => (data[src.key] || []).map((item) => ({
      source: src, item, title: src.title(item), sub: src.sub(item), id: item[src.idField || 'id'],
    })));
    return index;
  }

  function resultRow({ source, title, sub, id }, i) {
    return `<div class="search-result-item ${i === activeIndex ? 'is-active' : ''}" data-index="${i}" role="option" tabindex="-1">
      <i class="fa-solid ${source.icon}" aria-hidden="true"></i>
      <div><strong>${title}</strong><span>${source.label} &middot; ${sub}</span></div>
    </div>`;
  }

  function ensureModal() {
    let el = document.getElementById('search-modal');
    if (el) return el;
    el = document.createElement('div');
    el.className = 'search-modal-backdrop';
    el.id = 'search-modal';
    el.innerHTML = `
      <div class="search-modal" role="dialog" aria-modal="true" aria-label="Site search">
        <div class="search-modal-input-row">
          <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          <input type="text" id="search-modal-input" placeholder="Search publications, events, courses, jobs..." aria-label="Search Meridian" autocomplete="off">
          <kbd>Esc</kbd>
        </div>
        <div class="search-modal-results" id="search-modal-results" role="listbox"></div>
        <a href="/pages/search-results.html" id="search-modal-viewall" class="m-notif-viewall">View all results</a>
      </div>`;
    document.body.appendChild(el);
    return el;
  }

  function renderResults(query) {
    const resultsEl = document.getElementById('search-modal-results');
    const viewAllEl = document.getElementById('search-modal-viewall');
    if (!query.trim()) {
      resultsEl.innerHTML = '<p class="text-muted-m" style="padding:1rem;">Start typing to search across the whole site &mdash; publications, conferences, events, courses, certifications, news, blog, and jobs.</p>';
      if (viewAllEl) viewAllEl.hidden = true;
      return [];
    }
    const q = query.toLowerCase();
    const matches = index.filter((r) => `${r.title} ${r.sub}`.toLowerCase().includes(q)).slice(0, 20);
    activeIndex = matches.length ? 0 : -1;
    resultsEl.innerHTML = matches.length
      ? matches.map((r, i) => resultRow(r, i)).join('')
      : '<p class="text-muted-m" style="padding:1rem;">No results. Try a different term.</p>';
    if (viewAllEl) { viewAllEl.hidden = false; viewAllEl.href = `/pages/search-results.html?q=${encodeURIComponent(query.trim())}`; }
    return matches;
  }

  function navigateTo(match) {
    location.href = `${match.source.page}?id=${encodeURIComponent(match.id)}`;
  }

  let cleanupTrap = null;
  let currentMatches = [];

  async function open() {
    await buildIndex();
    const backdrop = ensureModal();
    const input = document.getElementById('search-modal-input');
    backdrop.classList.add('is-open');
    input.value = '';
    currentMatches = renderResults('');
    cleanupTrap = window.Meridian.a11y.trapFocus(backdrop.querySelector('.search-modal'), close);
    input.focus();
  }

  function close() {
    const backdrop = document.getElementById('search-modal');
    if (!backdrop) return;
    backdrop.classList.remove('is-open');
    if (cleanupTrap) { cleanupTrap(); cleanupTrap = null; }
  }

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      open();
    }
    if (e.key === 'Escape') close();
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('#search-trigger')) { e.preventDefault(); open(); }
    if (e.target.id === 'search-modal') close();

    const row = e.target.closest('.search-result-item');
    if (row && currentMatches[Number(row.dataset.index)]) navigateTo(currentMatches[Number(row.dataset.index)]);
  });

  document.addEventListener('input', (e) => {
    if (e.target.id === 'search-modal-input') currentMatches = renderResults(e.target.value);
  });

  document.addEventListener('keydown', (e) => {
    if (e.target.id !== 'search-modal-input') return;
    if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = Math.min(activeIndex + 1, currentMatches.length - 1); renderActive(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); renderActive(); }
    if (e.key === 'Enter' && currentMatches[activeIndex]) navigateTo(currentMatches[activeIndex]);
  });

  function renderActive() {
    document.querySelectorAll('.search-result-item').forEach((el) => {
      el.classList.toggle('is-active', Number(el.dataset.index) === activeIndex);
    });
  }

  window.Meridian = window.Meridian || {};
  window.Meridian.search = { open, close, buildIndex, SOURCES };
})();
