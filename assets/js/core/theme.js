/**
 * Dark/Light theme controller. Uses Bootstrap 5.3's `data-bs-theme` attribute
 * as the single source of truth, persisted to localStorage. Defaults to
 * light for every new visitor regardless of OS preference — a deliberate
 * choice for a professional/enterprise look, not an oversight. A blocking
 * inline snippet in each page's <head> already sets this attribute before
 * first paint to avoid a flash of the wrong theme — this module just keeps
 * it in sync and wires up the toggle buttons, which live inside the
 * async-loaded header/footer partials.
 */
(function () {
  const STORAGE_KEY = 'meridian:theme:v2';

  function getStoredTheme() {
    return localStorage.getItem(STORAGE_KEY);
  }

  function getPreferredTheme() {
    const stored = getStoredTheme();
    return stored === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    document.querySelectorAll('#theme-toggle, #footer-theme-toggle').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(theme === 'dark'));
    });
    document.dispatchEvent(new CustomEvent('meridian:theme-changed', { detail: { theme } }));
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-bs-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  applyTheme(getPreferredTheme());

  document.addEventListener('click', (e) => {
    if (e.target.closest('#theme-toggle, #footer-theme-toggle')) {
      toggleTheme();
    }
  });

  window.Meridian = window.Meridian || {};
  window.Meridian.theme = { applyTheme, toggleTheme, getPreferredTheme };
})();
