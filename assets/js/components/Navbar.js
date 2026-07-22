/**
 * Sticky navbar behavior: scroll shadow, mega-menu / dropdown open-close
 * (click + keyboard + outside-click + Escape), mobile off-canvas menu, and
 * the avatar dropdown. Exposes `Meridian.ui.bindDropdown` so other header
 * widgets (Notifications.js) can reuse the same open/close mechanics.
 */
(function () {
  const openDropdowns = new Set();

  /** Generic trigger-button <-> panel dropdown wiring. Returns {close}. */
  function bindDropdown(trigger, panel, { onOpen, closeOnSelect = true } = {}) {
    const wrapper = trigger.closest('.has-menu') || trigger.parentElement;

    function close() {
      trigger.setAttribute('aria-expanded', 'false');
      wrapper.classList.remove('is-open');
      panel.hidden = panel.tagName === 'DIV' && panel.hasAttribute('hidden') ? true : panel.hidden;
      openDropdowns.delete(close);
    }
    function open() {
      openDropdowns.forEach((fn) => fn());
      trigger.setAttribute('aria-expanded', 'true');
      wrapper.classList.add('is-open');
      if (panel.hasAttribute('hidden')) panel.hidden = false;
      openDropdowns.add(close);
      if (onOpen) onOpen();
    }
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      isOpen ? close() : open();
    });
    if (closeOnSelect) {
      panel.addEventListener('click', (e) => {
        if (e.target.closest('a,button')) close();
      });
    }
    return { open, close };
  }

  function initScrollShadow() {
    const header = document.getElementById('site-header-el');
    if (!header) return;
    function onScroll() {
      header.classList.toggle('is-scrolled', window.scrollY > 4);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initMenus() {
    document.querySelectorAll('.has-menu').forEach((li) => {
      const trigger = li.querySelector('.m-nav-trigger');
      const panel = li.querySelector('.m-dropdown, .m-mega');
      if (trigger && panel) bindDropdown(trigger, panel);
    });

    const avatarTrigger = document.getElementById('avatar-trigger');
    const avatarMenu = document.getElementById('avatar-menu');
    if (avatarTrigger && avatarMenu) {
      avatarMenu.hidden = false;
      avatarTrigger.closest('.m-member-actions').classList.add('has-menu');
      bindDropdown(avatarTrigger, avatarMenu);
    }

    document.addEventListener('click', () => openDropdowns.forEach((fn) => fn()));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') openDropdowns.forEach((fn) => fn());
    });
  }

  function initMobileMenu() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const closeBtn = document.getElementById('mobile-menu-close');
    const menu = document.getElementById('mobile-menu');
    const backdrop = document.getElementById('mobile-menu-backdrop');
    if (!toggle || !menu || !backdrop) return;
    let cleanupTrap = null;

    function open() {
      menu.classList.add('is-open');
      backdrop.hidden = false;
      requestAnimationFrame(() => backdrop.classList.add('is-open'));
      menu.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      cleanupTrap = window.Meridian.a11y.trapFocus(menu, close);
    }
    function close() {
      menu.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      setTimeout(() => { backdrop.hidden = true; }, 250);
      if (cleanupTrap) cleanupTrap();
      toggle.focus();
    }
    toggle.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);
    menu.querySelectorAll('a, button').forEach((el) => el.addEventListener('click', () => {
      if (el.tagName === 'A') close();
    }));
  }

  window.Meridian = window.Meridian || {};
  window.Meridian.onPartialsReady(() => {
    initScrollShadow();
    initMenus();
    initMobileMenu();
  });

  window.Meridian = window.Meridian || {};
  window.Meridian.ui = window.Meridian.ui || {};
  window.Meridian.ui.bindDropdown = bindDropdown;
})();
