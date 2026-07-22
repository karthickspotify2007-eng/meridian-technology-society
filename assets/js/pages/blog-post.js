/**
 * Single blog post template. Reads `?slug=` from the URL, renders the
 * matching post from /data/blog.json, updates the document title/meta
 * description client-side (this route has no server-side rendering, so a
 * crawler that doesn't execute JS will see the generic fallback meta tags —
 * a known tradeoff of a static, framework-free build; noted in the README),
 * wires the comment thread and share buttons, and lists related posts.
 */
(function () {
  function renderNotFound() {
    document.getElementById('post-content').innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-file-circle-question fa-2xl" aria-hidden="true"></i>
        <h2>Post not found</h2>
        <p>We couldn't find that article. It may have been moved.</p>
        <a href="/pages/blog.html" class="btn-m btn-m-primary">Back to Blog</a>
      </div>`;
  }

  async function init() {
    const slug = new URLSearchParams(location.search).get('slug');
    const posts = await window.Meridian.data.getMerged('blog');
    const post = posts.find((p) => p.slug === slug);

    if (!post) { renderNotFound(); return; }

    document.title = `${post.title} | Meridian Blog`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', post.excerpt);

    document.getElementById('post-breadcrumb-title').textContent = post.title;
    document.getElementById('post-content').innerHTML = `
      <span class="badge-m">${post.category}</span>
      <h1 style="margin-top:0.6rem;">${post.title}</h1>
      <div class="post-meta-row">
        <span class="m-avatar">${post.author.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}</span>
        <div>
          <strong>${post.author}</strong><br>
          <span class="text-muted-m" style="font-size:var(--m-fs-xs);">${post.authorRole}</span>
        </div>
        <span class="text-muted-m" style="margin-left:auto;font-size:var(--m-fs-sm);">${window.Meridian.cards.formatDate(post.date)} &middot; ${post.readTime} min read</span>
      </div>
      <div class="post-body">${post.content.map((p) => `<p>${p}</p>`).join('')}</div>
      <div class="post-share-row">
        <button type="button" class="btn-m btn-m-secondary" data-bookmark-btn data-bookmark-type="blog" data-bookmark-id="${post.id}" data-bookmark-title="${post.title.replace(/"/g, '&quot;')}" aria-pressed="false"><i class="fa-regular fa-heart" aria-hidden="true"></i> Save</button>
        <button type="button" class="btn-m btn-m-ghost" data-share-btn data-share-title="${post.title.replace(/"/g, '&quot;')}"><i class="fa-solid fa-share-nodes" aria-hidden="true"></i> Share</button>
      </div>
    `;
    window.Meridian.bookmark.init(document);
    window.Meridian.share.init(document);
    window.Meridian.commentThread.render(document.getElementById('comment-thread'), post.id);

    const related = posts.filter((p) => p.id !== post.id && p.category === post.category).slice(0, 3);
    const fallbackRelated = related.length ? related : posts.filter((p) => p.id !== post.id).slice(0, 3);
    document.getElementById('related-posts').innerHTML = fallbackRelated.map(window.Meridian.cards.blogCard).join('');
    window.Meridian.tilt.init(document);
    window.Meridian.bookmark.init(document);
    if (window.AOS) AOS.refreshHard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
