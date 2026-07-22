/**
 * Subtle 3D card tilt on pointer move, for elements with `[data-tilt]`.
 * Uses GSAP quickTo for smooth interpolation; no-ops under reduced motion
 * or on touch-only devices (tilt has no meaningful touch equivalent).
 */
(function () {
  const MAX_TILT = 3.5;

  function initTilt(root = document) {
    if (window.Meridian?.a11y?.prefersReducedMotion?.()) return;
    if (window.matchMedia('(hover: none)').matches) return;
    if (typeof gsap === 'undefined') return;

    root.querySelectorAll('[data-tilt]').forEach((el) => {
      if (el.dataset.tiltBound) return;
      el.dataset.tiltBound = 'true';
      const rotateX = gsap.quickTo(el, 'rotateX', { duration: 0.4, ease: 'power2.out' });
      const rotateY = gsap.quickTo(el, 'rotateY', { duration: 0.4, ease: 'power2.out' });
      const lift = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power2.out' });
      el.style.transformStyle = 'preserve-3d';
      el.style.transformPerspective = '800px';

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        rotateY(px * MAX_TILT * 2);
        rotateX(-py * MAX_TILT * 2);
        lift(-2);
      });
      el.addEventListener('mouseleave', () => {
        rotateX(0); rotateY(0); lift(0);
      });
    });
  }

  window.Meridian = window.Meridian || {};
  window.Meridian.tilt = { init: initTilt };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initTilt());
  } else {
    initTilt();
  }
})();
