/**
 * Lenis smooth scroll — TEMPORARILY DISABLED.
 *
 * Across several rounds of tuning, users kept reporting scrolling as
 * frozen/very slow even after fixes that checked out correctly in source and
 * in isolated testing. Rather than keep iterating blind on a feature that
 * touches every page's core scroll behavior, this backs out to plain native
 * browser scrolling — which always works — until Lenis can be reintroduced
 * behind a way to verify it properly in a real browser session.
 *
 * Native scroll is not a downside worth apologizing for: it's instant,
 * predictable, and exactly what every visitor's OS/browser already tuned for
 * their own hardware and input device. The rest of the "premium" motion
 * design (GSAP scroll reveals, hero parallax, card tilt, AOS) is untouched
 * and still fully active — this only removes the wheel-input easing layer.
 *
 * To re-enable later: restore the Lenis constructor + rAF loop that used to
 * live here, and verify actual scroll movement in a real browser (not just
 * "no console errors") before shipping it again.
 */
(function () {
  window.Meridian = window.Meridian || {};
  window.Meridian.lenis = null;
})();
