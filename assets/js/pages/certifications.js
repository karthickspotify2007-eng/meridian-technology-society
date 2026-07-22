/**
 * Certifications catalog + a "verify a certificate" lookup tool. The
 * verification list is a small hardcoded demo set (there's no real issuing
 * backend in this build) so reviewers can see the intended UX.
 */
(function () {
  const DEMO_ISSUED = {
    'MCP-AIS-2026-00142': { holder: 'Jordan Avery', cert: 'Certified Applied AI Safety Practitioner', issued: '2026-03-10', expires: '2029-03-10' },
    'MCP-SEC-2025-00087': { holder: 'Elena Petrova', cert: 'Certified Security Engineer — Applied Cryptography', issued: '2025-11-02', expires: '2028-11-02' },
    'MCP-SRE-2024-00913': { holder: 'Michael Obi', cert: 'Certified Site Reliability Professional', issued: '2024-06-18', expires: '2027-06-18' },
  };

  function wireVerify() {
    const form = document.getElementById('verify-cert-form');
    const resultEl = document.getElementById('verify-cert-result');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = document.getElementById('verify-cert-input').value.trim().toUpperCase();
      const match = DEMO_ISSUED[code];
      if (match) {
        resultEl.className = 'verify-result is-valid';
        resultEl.innerHTML = `<i class="fa-solid fa-circle-check" aria-hidden="true"></i> <strong>Valid credential.</strong> ${match.cert} — issued to ${match.holder} on ${window.Meridian.cards.formatDate(match.issued)}, valid through ${window.Meridian.cards.formatDate(match.expires)}.`;
      } else {
        resultEl.className = 'verify-result is-invalid';
        resultEl.innerHTML = `<i class="fa-solid fa-circle-xmark" aria-hidden="true"></i> No credential found for "${code}". Try one of the demo IDs, e.g. <code>MCP-AIS-2026-00142</code>.`;
      }
      resultEl.hidden = false;
    });
  }

  async function init() {
    const certifications = await window.Meridian.data.getData('certifications');
    window.Meridian.detail.registerItems('certification', certifications);

    const domainSelect = document.getElementById('filter-domain');
    [...new Set(certifications.map((c) => c.domain))].sort().forEach((d) => domainSelect.add(new Option(d, d)));

    window.Meridian.listing.create({
      items: certifications,
      container: document.getElementById('certifications-grid'),
      renderCard: window.Meridian.cards.certificationCard,
      pageSize: 6,
      countEl: document.getElementById('certifications-count'),
      controls: {
        search: { el: document.getElementById('certifications-search'), keys: ['title', 'code', 'description'] },
        selects: [{ el: domainSelect, key: 'domain' }],
        paginationEl: document.getElementById('certifications-pagination'),
      },
      onRender: () => {
        window.Meridian.tilt.init(document);
        if (window.AOS) AOS.refreshHard();
      },
    });

    wireVerify();
    const openId = new URLSearchParams(location.search).get('id');
    if (openId) window.Meridian.detail.open('certification', openId);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
