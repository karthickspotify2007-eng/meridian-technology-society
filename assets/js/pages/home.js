/**
 * Home page: fetches all the JSON feeds it needs, renders every data-driven
 * section via the shared Card.js factory, registers items with the shared
 * DetailModal system, then boots the Swiper carousels and re-runs the
 * cross-cutting enhancers (tilt, bookmarks, AOS, counters) on the freshly
 * inserted markup.
 */
(function () {
  const { cards } = window.Meridian;

  function renderGrid(containerId, items, renderFn) {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = items.map(renderFn).join('');
  }

  function swiperSlide(innerHTML) {
    return `<div class="swiper-slide">${innerHTML}</div>`;
  }

  function testimonialSlide(t) {
    return swiperSlide(`
      <div class="testimonial-card">
        <div class="stars">${'<i class="fa-solid fa-star"></i>'.repeat(5)}</div>
        <p class="quote">&ldquo;${t.quote}&rdquo;</p>
        <div class="who">
          <span class="m-avatar">${t.initials}</span>
          <div><strong>${t.name}</strong><span>${t.role}, ${t.org}</span></div>
        </div>
      </div>
    `);
  }

  function partnerSlide(p) {
    return swiperSlide(`<span class="partner-pill">${p.name}</span>`);
  }

  /** A single, light parallax pass on the hero visual as a whole (rather than
   * one ScrollTrigger per floating card) — enough to read as depth against
   * the static text column without stacking up multiple scroll-scrubbed
   * animations that all recompute on every scroll tick. */
  function initHeroParallax() {
    if (!window.Meridian.gsapUtil || window.Meridian.a11y.prefersReducedMotion()) return;
    window.Meridian.gsapUtil.parallax('.hero-m-visual', { yPercent: -14 });
  }

  /** Pauses the partners marquee's autoplay while it's scrolled out of view —
   * a purely decorative loop has no reason to keep animating (and costing a
   * frame every tick) once it's off-screen. */
  function gatePartnersMarquee(swiperInstance) {
    const el = document.getElementById('partners-swiper');
    if (!el || !swiperInstance) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) swiperInstance.autoplay?.start();
      else swiperInstance.autoplay?.stop();
    }, { threshold: 0 });
    observer.observe(el);
  }

  function applyCmsOverrides() {
    const overrides = window.Meridian.store.read('cms-home', {});
    if (overrides.heading) document.getElementById('hero-heading').textContent = overrides.heading;
    if (overrides.subheading) document.getElementById('hero-lead').textContent = overrides.subheading;
  }

  async function init() {
    applyCmsOverrides();
    const [merged, rest] = await Promise.all([
      window.Meridian.data.getAllMerged(['publications', 'events', 'communities']),
      window.Meridian.data.getAllData(['conferences', 'courses', 'news', 'testimonials', 'partners']),
    ]);
    const data = { ...merged, ...rest };

    const featuredPubs = data.publications.filter((p) => p.featured);
    renderGrid('featured-publications-track', featuredPubs, (p) => `<div class="swiper-slide">${cards.publicationCard(p)}</div>`);
    window.Meridian.detail.registerItems('publication', data.publications);

    const upcomingConfs = data.conferences.filter((c) => c.status === 'upcoming').slice(0, 3);
    renderGrid('home-conferences-grid', upcomingConfs, cards.conferenceCard);
    window.Meridian.detail.registerItems('conference', data.conferences);

    const upcomingEvents = [...data.events].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 3);
    renderGrid('home-events-grid', upcomingEvents, cards.eventCard);
    window.Meridian.detail.registerItems('event', data.events);

    renderGrid('home-communities-grid', data.communities.slice(0, 4), cards.communityCard);

    const topCourses = [...data.courses].sort((a, b) => b.rating - a.rating).slice(0, 3);
    renderGrid('home-courses-grid', topCourses, cards.courseCard);
    window.Meridian.detail.registerItems('course', data.courses);

    renderGrid('home-news-grid', data.news.slice(0, 3), cards.newsCard);
    window.Meridian.detail.registerItems('news', data.news);

    renderGrid('testimonials-track', data.testimonials, testimonialSlide);
    renderGrid('partners-track', [...data.partners, ...data.partners], partnerSlide);

    // Re-run cross-cutting enhancers on the markup we just inserted.
    window.Meridian.tilt.init(document);
    window.Meridian.bookmark.init(document);
    window.Meridian.cards.syncJoinButtons(document);
    window.Meridian.counter.init(document);
    if (window.AOS) AOS.refreshHard();

    if (typeof Swiper !== 'undefined') {
      const pubSwiper = new Swiper('#publications-swiper', {
        slidesPerView: 'auto', spaceBetween: 20, a11y: { enabled: true }, keyboardControl: true,
      });
      document.getElementById('pub-swiper-prev')?.addEventListener('click', () => pubSwiper.slidePrev());
      document.getElementById('pub-swiper-next')?.addEventListener('click', () => pubSwiper.slideNext());

      new Swiper('#testimonials-swiper', {
        slidesPerView: 'auto', spaceBetween: 20, centeredSlides: false, a11y: { enabled: true },
        autoplay: window.Meridian.a11y.prefersReducedMotion() ? false : { delay: 5000, disableOnInteraction: true },
      });

      const partnersSwiper = new Swiper('#partners-swiper', {
        slidesPerView: 'auto', spaceBetween: 40, loop: true, allowTouchMove: false, speed: 6000,
        autoplay: window.Meridian.a11y.prefersReducedMotion() ? false : { delay: 1, disableOnInteraction: false },
      });
      gatePartnersMarquee(partnersSwiper);
    }

    initHeroParallax();
  }

  function wireNewsletterForms() {
    document.addEventListener('submit', (e) => {
      const form = e.target.closest('[data-newsletter-form]');
      if (!form) return;
      e.preventDefault();
      window.Meridian.toast.show({ type: 'success', title: 'Subscribed!', message: 'Look out for the next Meridian digest in your inbox.' });
      form.reset();
    });
  }

  wireNewsletterForms();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
