/**
 * Full search results page. Reuses the exact same client-side index as the
 * Ctrl/Cmd+K search modal (`Meridian.search.buildIndex`) so results are
 * identical whichever entry point a visitor used.
 */
(function () {
  function rowHTML({ source, title, sub, id }) {
    return `<a class="search-result-row" href="${source.page}?id=${encodeURIComponent(id)}">
      <span class="icon-badge"><i class="fa-solid ${source.icon}" aria-hidden="true"></i></span>
      <span>
        <span class="title">${title}</span><br>
        <span class="sub">${source.label} &middot; ${sub}</span>
      </span>
    </a>`;
  }

  async function runSearch(query) {
    const resultsEl = document.getElementById('search-results-list');
    const countEl = document.getElementById('search-results-count');
    const index = await window.Meridian.search.buildIndex();
    if (!query.trim()) {
      resultsEl.innerHTML = '<div class="empty-state"><i class="fa-solid fa-magnifying-glass fa-2xl" aria-hidden="true"></i><p>Enter a search term above to look across publications, conferences, events, courses, certifications, news, blog, and jobs.</p></div>';
      countEl.textContent = '';
      return;
    }
    const q = query.toLowerCase();
    const matches = index.filter((r) => `${r.title} ${r.sub}`.toLowerCase().includes(q));
    countEl.textContent = `${matches.length} result${matches.length === 1 ? '' : 's'} for "${query}"`;
    resultsEl.innerHTML = matches.length
      ? matches.map(rowHTML).join('')
      : '<div class="empty-state"><i class="fa-solid fa-circle-question fa-2xl" aria-hidden="true"></i><p>No results. Try a different term.</p></div>';
  }

  function init() {
    const input = document.getElementById('search-results-input');
    const query = new URLSearchParams(location.search).get('q') || '';
    input.value = query;
    runSearch(query);

    let debounceTimer;
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const url = new URL(location.href);
        url.searchParams.set('q', input.value);
        history.replaceState(null, '', url);
        runSearch(input.value);
      }, 200);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
