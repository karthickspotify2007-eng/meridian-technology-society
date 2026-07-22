/**
 * Small accessibility helpers shared by every overlay (modals, search,
 * mobile menu, dropdowns): a focus trap and a reduced-motion check.
 */
(function () {
  const FOCUSABLE_SELECTOR = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])', 'select:not([disabled])',
    'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  function getFocusable(container) {
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter((el) => el.offsetParent !== null);
  }

  /** Traps Tab/Shift+Tab within `container` and closes on Escape via `onEscape`. Returns a cleanup fn. */
  function trapFocus(container, onEscape) {
    function handleKeydown(e) {
      if (e.key === 'Escape') {
        onEscape && onEscape();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = getFocusable(container);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    container.addEventListener('keydown', handleKeydown);
    const focusable = getFocusable(container);
    if (focusable.length) focusable[0].focus();
    return () => container.removeEventListener('keydown', handleKeydown);
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  window.Meridian = window.Meridian || {};
  window.Meridian.a11y = { getFocusable, trapFocus, prefersReducedMotion };
})();
