/**
 * Forgot-password page: mock request flow — there's no real email system,
 * so submitting just swaps in a confirmation message.
 */
(function () {
  function init() {
    const form = document.getElementById('forgot-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('forgot-email').value.trim();
      document.getElementById('forgot-form-wrap').hidden = true;
      const confirmEl = document.getElementById('forgot-confirm');
      confirmEl.hidden = false;
      confirmEl.querySelector('[data-email-slot]').textContent = email;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
