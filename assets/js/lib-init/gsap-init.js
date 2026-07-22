/**
 * GSAP + ScrollTrigger bootstrap. Registers the plugin once and exposes a
 * small `Meridian.gsapUtil.batchReveal` helper for section-level fade/rise
 * reveals (used on Home; inner pages mostly lean on AOS for simple card
 * reveals, per the brief's animation list covering both libraries).
 */
(function () {
  if (typeof gsap === 'undefined') return;
  if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

  const reduced = window.Meridian?.a11y?.prefersReducedMotion?.();

  function batchReveal(selector, { stagger = 0.12, y = 28, scale = 0.97 } = {}) {
    const els = gsap.utils.toArray(selector);
    if (!els.length) return;
    if (reduced) { gsap.set(els, { opacity: 1, y: 0, scale: 1 }); return; }
    gsap.set(els, { opacity: 0, y, scale });
    ScrollTrigger.batch(els, {
      start: 'top 88%',
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger, ease: 'power3.out' }),
      once: true,
    });
  }

  /** Scroll-scrubbed depth effect — each matched element drifts at its own
   * speed as it crosses the viewport, giving a layered "premium" parallax
   * feel instead of everything moving in perfect lockstep with the scrollbar. */
  function parallax(selector, { yPercent = -18 } = {}) {
    if (reduced) return;
    gsap.utils.toArray(selector).forEach((el) => {
      gsap.to(el, {
        yPercent, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      });
    });
  }

  window.Meridian = window.Meridian || {};
  window.Meridian.gsapUtil = { batchReveal, parallax };
})();
