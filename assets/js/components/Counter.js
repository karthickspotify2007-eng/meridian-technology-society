/**
 * Animated stat counters. Any element with `data-counter="483000"` (optional
 * `data-counter-suffix="+"`) counts up once when it scrolls into view, via
 * GSAP if loaded, otherwise a plain rAF fallback. Respects reduced motion.
 */
(function () {
  function formatNumber(n) {
    return Math.round(n).toLocaleString('en-US');
  }

  function animateOne(el) {
    const to = Number(el.dataset.counter || 0);
    const suffix = el.dataset.counterSuffix || '';
    const reduced = window.Meridian?.a11y?.prefersReducedMotion?.();

    if (reduced || typeof gsap === 'undefined') {
      el.textContent = formatNumber(to) + suffix;
      return;
    }
    const proxy = { val: 0 };
    gsap.to(proxy, {
      val: to,
      duration: 1.8,
      ease: 'power2.out',
      onUpdate: () => { el.textContent = formatNumber(proxy.val) + suffix; },
    });
  }

  function initCounters(root = document) {
    const els = Array.from(root.querySelectorAll('[data-counter]')).filter((el) => !el.dataset.counterBound);
    if (!els.length) return;
    els.forEach((el) => { el.dataset.counterBound = 'true'; });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateOne(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    els.forEach((el) => observer.observe(el));
  }

  window.Meridian = window.Meridian || {};
  window.Meridian.counter = { init: initCounters };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initCounters());
  } else {
    initCounters();
  }
})();
