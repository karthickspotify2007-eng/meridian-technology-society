/**
 * Login page: validated form against the mock auth layer (core/auth.js).
 * Includes one-click demo-credential fill buttons since there's no real
 * account system to sign up through outside this demo.
 */
(function () {
  function init() {
    if (window.Meridian.auth.isAuthenticated()) {
      location.replace('/dashboard.html');
      return;
    }

    const form = document.getElementById('login-form');
    const errorEl = document.getElementById('login-error');

    document.querySelectorAll('[data-fill-demo]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.getElementById('login-email').value = btn.dataset.fillDemo === 'admin' ? 'admin@meridian.org' : 'demo@meridian.org';
        document.getElementById('login-password').value = btn.dataset.fillDemo === 'admin' ? 'meridianadmin' : 'meridian2026';
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorEl.hidden = true;
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Signing in...';

      const result = await window.Meridian.auth.login(email, password);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign in';

      if (!result.ok) {
        errorEl.textContent = result.error;
        errorEl.hidden = false;
        return;
      }
      const redirect = new URLSearchParams(location.search).get('redirect');
      location.href = redirect ? decodeURIComponent(redirect) : '/dashboard.html';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
