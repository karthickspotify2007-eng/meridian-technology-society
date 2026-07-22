/**
 * Card markup factory — one function per content type, all built on the
 * `.card-m` primitive from card.css. Centralizing this means listing pages
 * (Publications/Conferences/Events/Learning/Certifications/Resources/News/
 * Blog/Careers) never hand-roll card HTML themselves.
 */
(function () {
  function formatDate(iso, opts = { month: 'short', day: 'numeric', year: 'numeric' }) {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', opts);
  }

  function bookmarkBtn(type, id, title) {
    return `<button type="button" class="card-m-bookmark" data-bookmark-btn data-bookmark-type="${type}" data-bookmark-id="${id}" data-bookmark-title="${title.replace(/"/g, '&quot;')}" aria-pressed="false" aria-label="Save ${title}">
      <i class="fa-regular fa-heart" aria-hidden="true"></i>
    </button>`;
  }

  function publicationCard(p) {
    return `<article class="card-m" data-tilt data-aos="fade-up">
      <div class="card-m-meta">
        <span class="badge-m">${p.type}</span>
        <span class="badge-m badge-m-teal">${p.topic}</span>
      </div>
      <h3 class="card-m-title">${p.title}</h3>
      <p class="card-m-desc">${p.authors.join(', ')}</p>
      <div class="card-m-footer">
        <span class="text-muted-m" style="font-size:var(--m-fs-xs)">${p.year} &middot; ${p.pages} pp.</span>
        <div style="display:flex;gap:0.3rem;align-items:center;">
          ${bookmarkBtn('publication', p.id, p.title)}
          <button type="button" class="btn-m btn-m-sm btn-m-secondary" data-open-detail="publication" data-id="${p.id}">View</button>
        </div>
      </div>
    </article>`;
  }

  function conferenceCard(c) {
    return `<article class="card-m" data-tilt data-aos="fade-up">
      <div class="card-m-meta">
        <span class="badge-m">${c.code}</span>
        <span class="badge-m ${c.status === 'past' ? 'badge-m-rose' : 'badge-m-teal'}">${c.status === 'past' ? 'Past' : 'Upcoming'}</span>
      </div>
      <h3 class="card-m-title">${c.title}</h3>
      <p class="card-m-desc">${c.description}</p>
      <div class="card-m-meta"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${c.city}, ${c.country} &middot; ${c.mode}</div>
      <div class="card-m-footer">
        <span class="text-muted-m" style="font-size:var(--m-fs-xs)">${formatDate(c.startDate)} &ndash; ${formatDate(c.endDate)}</span>
        <div style="display:flex;gap:0.3rem;align-items:center;">
          ${bookmarkBtn('conference', c.id, c.title)}
          <button type="button" class="btn-m btn-m-sm btn-m-secondary" data-open-detail="conference" data-id="${c.id}">Details</button>
        </div>
      </div>
    </article>`;
  }

  function eventCard(e) {
    return `<article class="card-m" data-tilt data-aos="fade-up">
      <div class="card-m-meta"><span class="badge-m">${e.type}</span><span class="badge-m badge-m-teal">${e.mode}</span></div>
      <h3 class="card-m-title">${e.title}</h3>
      <p class="card-m-desc">${e.description}</p>
      <div class="card-m-meta"><i class="fa-solid fa-clock" aria-hidden="true"></i> ${formatDate(e.date)} &middot; ${e.time} ${e.timezone}</div>
      <div class="card-m-footer">
        <span class="text-muted-m" style="font-size:var(--m-fs-xs)">${e.registered}/${e.capacity} registered</span>
        <div style="display:flex;gap:0.3rem;align-items:center;">
          ${bookmarkBtn('event', e.id, e.title)}
          <button type="button" class="btn-m btn-m-sm btn-m-primary" data-open-detail="event" data-id="${e.id}">Register</button>
        </div>
      </div>
    </article>`;
  }

  function courseCard(c) {
    return `<article class="card-m" data-tilt data-aos="fade-up">
      <div class="card-m-meta"><span class="badge-m">${c.level}</span><span class="badge-m badge-m-teal">${c.category}</span></div>
      <h3 class="card-m-title">${c.title}</h3>
      <p class="card-m-desc">${c.description}</p>
      <div class="card-m-meta"><i class="fa-solid fa-star" style="color:var(--m-amber-500)" aria-hidden="true"></i> ${c.rating} &middot; ${c.students.toLocaleString()} enrolled &middot; ${c.duration}</div>
      <div class="card-m-footer">
        <span class="text-muted-m" style="font-size:var(--m-fs-xs)">${c.price}</span>
        <div style="display:flex;gap:0.3rem;align-items:center;">
          ${bookmarkBtn('course', c.id, c.title)}
          <button type="button" class="btn-m btn-m-sm btn-m-secondary" data-open-detail="course" data-id="${c.id}">View course</button>
        </div>
      </div>
    </article>`;
  }

  function certificationCard(c) {
    return `<article class="card-m" data-tilt data-aos="fade-up">
      <div class="card-m-meta"><span class="badge-m">${c.code}</span><span class="badge-m badge-m-teal">${c.level}</span></div>
      <h3 class="card-m-title">${c.title}</h3>
      <p class="card-m-desc">${c.description}</p>
      <div class="card-m-meta"><i class="fa-solid fa-clock" aria-hidden="true"></i> ${c.examDuration} exam &middot; valid ${c.validity}</div>
      <div class="card-m-footer">
        <span class="text-muted-m" style="font-size:var(--m-fs-xs)">${c.domain}</span>
        <button type="button" class="btn-m btn-m-sm btn-m-secondary" data-open-detail="certification" data-id="${c.id}">Requirements</button>
      </div>
    </article>`;
  }

  function resourceCard(r) {
    return `<article class="card-m" data-tilt data-aos="fade-up">
      <div class="card-m-meta"><span class="badge-m">${r.type}</span><span class="badge-m badge-m-teal">${r.topic}</span></div>
      <h3 class="card-m-title">${r.title}</h3>
      <p class="card-m-desc">${r.description}</p>
      <div class="card-m-meta"><i class="fa-solid fa-file-arrow-down" aria-hidden="true"></i> ${r.format}${r.pages ? ` &middot; ${r.pages} pp.` : ''}</div>
      <div class="card-m-footer">
        ${bookmarkBtn('resource', r.id, r.title)}
        <button type="button" class="btn-m btn-m-sm btn-m-primary" data-open-detail="resource" data-id="${r.id}"><i class="fa-solid fa-download" aria-hidden="true"></i> Download</button>
      </div>
    </article>`;
  }

  function newsCard(n) {
    return `<article class="card-m" data-tilt data-aos="fade-up">
      <div class="card-m-meta"><span class="badge-m">${n.category}</span></div>
      <h3 class="card-m-title">${n.title}</h3>
      <p class="card-m-desc">${n.summary}</p>
      <div class="card-m-footer">
        <span class="text-muted-m" style="font-size:var(--m-fs-xs)">${formatDate(n.date)}</span>
        <button type="button" class="btn-m btn-m-sm btn-m-secondary" data-open-detail="news" data-id="${n.id}">Read more</button>
      </div>
    </article>`;
  }

  function blogCard(b) {
    return `<article class="card-m" data-tilt data-aos="fade-up">
      <div class="card-m-meta"><span class="badge-m">${b.category}</span><span class="text-muted-m" style="font-size:var(--m-fs-xs)">${b.readTime} min read</span></div>
      <h3 class="card-m-title"><a href="/pages/blog-post.html?slug=${b.slug}">${b.title}</a></h3>
      <p class="card-m-desc">${b.excerpt}</p>
      <div class="card-m-footer">
        <span class="text-muted-m" style="font-size:var(--m-fs-xs)">${b.author} &middot; ${formatDate(b.date)}</span>
        ${bookmarkBtn('blog', b.id, b.title)}
      </div>
    </article>`;
  }

  function jobCard(j) {
    return `<article class="card-m" data-tilt data-aos="fade-up">
      <div class="card-m-meta"><span class="badge-m">${j.type}</span><span class="badge-m badge-m-teal">${j.department}</span></div>
      <h3 class="card-m-title">${j.title}</h3>
      <p class="card-m-desc">${j.description}</p>
      <div class="card-m-meta"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${j.location}</div>
      <div class="card-m-footer">
        <span class="text-muted-m" style="font-size:var(--m-fs-xs)">Posted ${formatDate(j.postedDate)}</span>
        <button type="button" class="btn-m btn-m-sm btn-m-primary" data-open-detail="job" data-id="${j.id}">Apply</button>
      </div>
    </article>`;
  }

  function communityCard(c) {
    return `<article class="card-m feature-card" data-tilt data-aos="fade-up">
      <span class="card-m-icon"><i class="fa-solid ${c.icon}" aria-hidden="true"></i></span>
      <h3 class="card-m-title">${c.name}</h3>
      <p class="card-m-desc">${c.description}</p>
      <div class="tag-row">${c.topics.slice(0, 3).map((t) => `<span class="badge-m">${t}</span>`).join('')}</div>
      <div class="card-m-footer">
        <span class="text-muted-m" style="font-size:var(--m-fs-xs)">${c.memberCount.toLocaleString()} members</span>
        <button type="button" class="btn-m btn-m-sm btn-m-secondary" data-join-community="${c.id}">Join</button>
      </div>
    </article>`;
  }

  const JOINED_NAMESPACE = 'joined-communities';

  function syncJoinButtons(root = document) {
    root.querySelectorAll('[data-join-community]').forEach((btn) => {
      const joined = window.Meridian.store.isInSet(JOINED_NAMESPACE, btn.dataset.joinCommunity);
      btn.textContent = joined ? 'Joined' : 'Join';
      btn.classList.toggle('btn-m-primary', joined);
      btn.classList.toggle('btn-m-secondary', !joined);
    });
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-join-community]');
    if (!btn) return;
    if (!window.Meridian.auth.isAuthenticated()) {
      window.Meridian.toast.show({
        type: 'info', title: 'Log in to join a community',
        message: 'Create a free Meridian account to join technical communities.',
      });
      return;
    }
    window.Meridian.store.toggleInSet(JOINED_NAMESPACE, btn.dataset.joinCommunity);
    syncJoinButtons();
    window.Meridian.toast.show({ type: 'success', title: 'Community updated', duration: 2000 });
  });
  document.addEventListener('meridian:store-changed', (e) => { if (e.detail.namespace === JOINED_NAMESPACE) syncJoinButtons(); });

  window.Meridian = window.Meridian || {};
  window.Meridian.cards = {
    formatDate, publicationCard, conferenceCard, eventCard, courseCard,
    certificationCard, resourceCard, newsCard, blogCard, jobCard, communityCard,
    syncJoinButtons,
  };
})();
