/**
 * Minimal hash-section router shared by the Dashboard and Admin shells.
 * Both are single real HTML files with several `[data-section]` panels and
 * a sidebar of `<a href="#name">` links — this just keeps the active panel,
 * the active sidebar link, and the URL hash in sync, and fires a callback so
 * a page can lazy-render a section's content the first time it's shown.
 */
(function () {
  function mountSectionRouter({ sections, defaultSection, onChange }) {
    const panels = document.querySelectorAll('[data-section]');
    const navLinks = document.querySelectorAll('.app-sidebar-nav a[href^="#"]');
    const shown = new Set();

    function activate(name) {
      const target = sections.includes(name) ? name : defaultSection;
      panels.forEach((p) => p.classList.toggle('is-active', p.dataset.section === target));
      navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${target}`));
      document.querySelectorAll('.app-sidebar').forEach((s) => s.classList.remove('is-open'));
      if (onChange) onChange(target, shown.has(target));
      shown.add(target);
      return target;
    }

    function currentFromHash() {
      return (location.hash || '').replace('#', '');
    }

    window.addEventListener('hashchange', () => activate(currentFromHash()));
    return activate(currentFromHash());
  }

  window.Meridian = window.Meridian || {};
  window.Meridian.router = { mountSectionRouter };
})();
