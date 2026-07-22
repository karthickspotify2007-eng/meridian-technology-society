/**
 * Generic modal/dialog factory used for publication/conference/event/blog
 * detail views and confirmation dialogs. One backdrop element is reused
 * across opens so repeated calls don't leak DOM nodes.
 */
(function () {
  let backdrop = null;
  let cleanupTrap = null;
  let lastFocused = null;

  function ensureBackdrop() {
    if (backdrop) return backdrop;
    backdrop = document.createElement('div');
    backdrop.className = 'm-modal-backdrop';
    backdrop.innerHTML = '<div class="m-modal" role="dialog" aria-modal="true"></div>';
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
    return backdrop;
  }

  function openModal({ title, bodyHTML, footHTML = '', labelledBy } = {}) {
    const bd = ensureBackdrop();
    const modal = bd.querySelector('.m-modal');
    const titleId = labelledBy || `modal-title-${Date.now()}`;
    modal.setAttribute('aria-labelledby', titleId);
    modal.innerHTML = `
      <div class="m-modal-head">
        <h2 id="${titleId}">${title}</h2>
        <button type="button" class="m-modal-close" aria-label="Close dialog"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
      </div>
      <div class="m-modal-body">${bodyHTML}</div>
      ${footHTML ? `<div class="m-modal-foot">${footHTML}</div>` : ''}
    `;
    lastFocused = document.activeElement;
    bd.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.m-modal-close').addEventListener('click', closeModal);
    cleanupTrap = window.Meridian.a11y.trapFocus(modal, closeModal);
    return modal;
  }

  function closeModal() {
    if (!backdrop) return;
    backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
    if (cleanupTrap) { cleanupTrap(); cleanupTrap = null; }
    if (lastFocused) lastFocused.focus();
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop && backdrop.classList.contains('is-open')) closeModal();
  });

  window.Meridian = window.Meridian || {};
  window.Meridian.modal = { open: openModal, close: closeModal };
})();
