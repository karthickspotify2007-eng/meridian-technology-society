/**
 * Comment thread for blog posts. Persisted per-post under
 * `comments:{postId}` in the localStorage store — there's no backend, so
 * comments are local to the visitor's browser, seeded with a couple of
 * illustrative entries per post the first time a thread renders.
 */
(function () {
  function namespaceFor(postId) { return `comments:${postId}`; }

  function seedFor(postId) {
    return [
      { id: `${postId}-seed-1`, author: 'Marcus Bellweather', date: '2026-07-09', text: 'This matches what we saw migrating our own incident process — the shape-based triage is a great teaching device.' },
      { id: `${postId}-seed-2`, author: 'Yuki Tanaka', date: '2026-07-10', text: 'Would love a follow-up on how this generalizes to GPU-bound training jobs specifically.' },
    ];
  }

  function getComments(postId) {
    const existing = window.Meridian.store.read(namespaceFor(postId), null);
    if (existing === null) {
      const seeded = seedFor(postId);
      window.Meridian.store.write(namespaceFor(postId), seeded);
      return seeded;
    }
    return existing;
  }

  function addComment(postId, text) {
    const session = window.Meridian.auth.getSession();
    const comments = getComments(postId);
    comments.push({
      id: `c-${Date.now()}`,
      author: session ? session.name : 'Guest',
      date: new Date().toISOString().slice(0, 10),
      text,
    });
    window.Meridian.store.write(namespaceFor(postId), comments);
    return comments;
  }

  function render(container, postId) {
    const comments = getComments(postId);
    const session = window.Meridian.auth.getSession();
    container.innerHTML = `
      <h3>${comments.length} Comment${comments.length === 1 ? '' : 's'}</h3>
      <div class="comment-list">
        ${comments.map((c) => `
          <div class="comment-item">
            <span class="comment-avatar">${c.author.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}</span>
            <div>
              <strong>${c.author}</strong> <span class="text-muted-m">${c.date}</span>
              <p>${c.text}</p>
            </div>
          </div>
        `).join('')}
      </div>
      <form class="comment-form" data-comment-form>
        <div class="form-m-group">
          <label for="comment-text">${session ? `Commenting as ${session.name}` : 'Add a comment (log in to use your name)'}</label>
          <textarea id="comment-text" name="text" rows="3" placeholder="Share your thoughts..." required></textarea>
        </div>
        <button type="submit" class="btn-m btn-m-primary">Post comment</button>
      </form>
    `;
    container.querySelector('[data-comment-form]').addEventListener('submit', (e) => {
      e.preventDefault();
      const textarea = container.querySelector('#comment-text');
      if (!textarea.value.trim()) return;
      addComment(postId, textarea.value.trim());
      render(container, postId);
      window.Meridian.toast.show({ type: 'success', title: 'Comment posted', duration: 2200 });
    });
  }

  window.Meridian = window.Meridian || {};
  window.Meridian.commentThread = { render };
})();
