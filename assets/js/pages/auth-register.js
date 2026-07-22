/**
 * Registration page: validated form against the mock auth layer, creating a
 * new local "member" account (see core/auth.js — persisted to localStorage,
 * not a real backend).
 */
(function () {
  function init() {
    if (window.Meridian.auth.isAuthenticated()) {
      location.replace('/dashboard.html');
      return;
    }

    const form = document.getElementById('register-form');
    const errorEl = document.getElementById('register-error');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorEl.hidden = true;

      const name = document.getElementById('register-name').value.trim();
      const email = document.getElementById('register-email').value.trim();
      const password = document.getElementById('register-password').value;
      const confirm = document.getElementById('register-confirm').value;
      const terms = document.getElementById('register-terms').checked;

      if (password.length < 8) {
        errorEl.querySelector('span').textContent = 'Password must be at least 8 characters.';
        errorEl.hidden = false;
        return;
      }
      if (password !== confirm) {
        errorEl.querySelector('span').textContent = 'Passwords do not match.';
        errorEl.hidden = false;
        return;
      }
      if (!terms) {
        errorEl.querySelector('span').textContent = 'Please accept the terms to continue.';
        errorEl.hidden = false;
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Creating account...';

      const result = await window.Meridian.auth.register({ name, email, password });
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create account';

      if (!result.ok) {
        errorEl.querySelector('span').textContent = result.error;
        errorEl.hidden = false;
        return;
      }
      location.href = '/dashboard.html';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
