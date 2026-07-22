/**
 * Fetches shared header/footer/mega-menu markup and injects it into the
 * `[data-partial]` mount points every page declares.
 *
 * `Meridian.onPartialsReady(cb)` is the safe way for any other script to
 * react once the header/footer are actually in the DOM. It's defined
 * synchronously at the very top of this file (which is always the first
 * script tag on every page) and handles both orders: called before the
 * partials are ready, it queues `cb`; called after, it runs `cb`
 * immediately. This file is also first to fire its own fetches, so without
 * this queue, later scripts registering a plain
 * `document.addEventListener('meridian:partials-ready', ...)` could lose
 * the race against these same-origin, near-instant local fetches and never
 * see the event (this happened during development — see the mega menu /
 * theme-toggle wiring bug this fixed).
 */
(function () {
  window.Meridian = window.Meridian || {};
  let ready = false;
  const queue = [];

  window.Meridian.onPartialsReady = function (cb) {
    if (ready) cb();
    else queue.push(cb);
  };

  function dispatchReady() {
    ready = true;
    document.dispatchEvent(new CustomEvent('meridian:partials-ready'));
    queue.splice(0).forEach((cb) => cb());
  }

  async function loadPartial(url, mountSelector) {
    const mount = document.querySelector(mountSelector);
    if (!mount) return;
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
      mount.outerHTML = await res.text();
    } catch (err) {
      console.error('[Meridian] partial load failed', url, err);
    }
  }

  async function init() {
    await Promise.all([
      loadPartial('/components/header.html', '[data-partial="header"]'),
      loadPartial('/components/footer.html', '[data-partial="footer"]'),
    ]);
    const yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    dispatchReady();

    const loader = document.getElementById('page-loader');
    if (loader) requestAnimationFrame(() => loader.classList.add('is-hidden'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
