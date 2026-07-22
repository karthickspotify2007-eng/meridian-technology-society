/**
 * Contact form: client-side validation (required fields + email format),
 * mock submit (toast + reset — there's no backend to actually deliver this).
 */
(function () {
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateField(input) {
    const group = input.closest('.form-m-group');
    let valid = true;
    if (input.hasAttribute('required') && !input.value.trim()) valid = false;
    if (input.type === 'email' && input.value.trim() && !EMAIL_RE.test(input.value.trim())) valid = false;
    group.classList.toggle('has-error', !valid);
    return valid;
  }

  function init() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const fields = form.querySelectorAll('input[required], textarea[required], input[type="email"]');

    fields.forEach((field) => {
      field.addEventListener('blur', () => validateField(field));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let allValid = true;
      let firstInvalid = null;
      fields.forEach((field) => {
        const ok = validateField(field);
        if (!ok && !firstInvalid) firstInvalid = field;
        allValid = allValid && ok;
      });
      if (!allValid) {
        firstInvalid?.focus();
        window.Meridian.toast.show({ type: 'error', title: 'Please check the form', message: 'Some required fields need your attention.' });
        return;
      }
      window.Meridian.toast.show({ type: 'success', title: 'Message sent', message: "We'll get back to you within two business days." });
      form.reset();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
