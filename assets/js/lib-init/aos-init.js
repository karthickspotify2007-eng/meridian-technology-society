/**
 * AOS bootstrap for the simpler card/grid reveals on inner pages
 * (`[data-aos]` attributes already present in Card.js output).
 */
(function () {
  if (typeof AOS === 'undefined') return;
  AOS.init({
    duration: 600,
    easing: 'ease-out-cubic',
    once: true,
    offset: 60,
    disable: () => window.Meridian?.a11y?.prefersReducedMotion?.() || false,
  });

  document.addEventListener('meridian:store-changed', () => AOS.refreshHard());
})();
