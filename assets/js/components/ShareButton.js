/**
 * Share button: Web Share API where available (mobile browsers, some
 * desktop browsers), falling back to copy-link-to-clipboard + toast.
 */
(function () {
  async function handleShare(btn) {
    const url = btn.dataset.shareUrl || location.href;
    const title = btn.dataset.shareTitle || document.title;
    const text = btn.dataset.shareText || '';

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        /* user cancelled share sheet — no error toast needed */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      window.Meridian.toast.show({ type: 'success', title: 'Link copied', message: url, duration: 2600 });
    } catch {
      window.Meridian.toast.show({ type: 'error', title: 'Could not copy link', message: url });
    }
  }

  function init(root = document) {
    root.querySelectorAll('[data-share-btn]').forEach((btn) => {
      if (btn.dataset.shareBound) return;
      btn.dataset.shareBound = 'true';
      btn.addEventListener('click', (e) => { e.preventDefault(); handleShare(btn); });
    });
  }

  window.Meridian = window.Meridian || {};
  window.Meridian.onPartialsReady(() => init());
  window.Meridian.share = { init };
})();
