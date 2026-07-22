/**
 * Toast notifications, appended to `#toast-region` (lives at the end of the
 * footer partial so it's present on every page after partials load).
 */
(function () {
  const ICONS = { success: 'fa-circle-check', error: 'fa-circle-exclamation', info: 'fa-circle-info' };

  function showToast({ title, message, type = 'info', duration = 4500 }) {
    const region = document.getElementById('toast-region');
    if (!region) return;
    const toast = document.createElement('div');
    toast.className = `toast-m toast-${type}`;
    toast.setAttribute('role', 'status');
    toast.innerHTML = `
      <i class="fa-solid ${ICONS[type] || ICONS.info} toast-icon" aria-hidden="true"></i>
      <div class="toast-m-body">${title ? `<strong>${title}</strong>` : ''}${message ? `<span>${message}</span>` : ''}</div>
      <button type="button" class="toast-m-close" aria-label="Dismiss notification"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
    `;
    function remove() {
      toast.classList.add('is-leaving');
      setTimeout(() => toast.remove(), 260);
    }
    toast.querySelector('.toast-m-close').addEventListener('click', remove);
    region.appendChild(toast);
    if (duration) setTimeout(remove, duration);
  }

  window.Meridian = window.Meridian || {};
  window.Meridian.toast = { show: showToast };
})();
