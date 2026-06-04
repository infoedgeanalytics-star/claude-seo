/* ─────────────────────────────────────────────────────────────
   main.js  —  Renders author profile page from localStorage data
   ───────────────────────────────────────────────────────────── */

/* SVG icon paths ─────────────────────────────────────────────── */
const ICONS = {
  linkedin: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  twitter:  `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  email:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  rss:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>`
};

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── Render hero ─────────────────────────────────────────────── */
function renderHero(p, social) {
  const avatarHtml = p.avatarImage
    ? `<img src="${esc(p.avatarImage)}" alt="${esc(p.name)}">`
    : `<span class="avatar-initials" aria-hidden="true">${esc(p.avatarInitials)}</span>`;

  const statsHtml = p.stats.map(s =>
    `<div class="stat-pill" role="listitem">
       <span class="stat-pill-value">${esc(s.value)}</span>
       <span class="stat-pill-label">${esc(s.label)}</span>
     </div>`
  ).join('');

  const socialHtml = social.map(s =>
    `<a href="${esc(s.url)}" class="social-link" aria-label="${esc(s.label)}">
       ${ICONS[s.icon] || ''}${esc(s.label)}
     </a>`
  ).join('');

  document.getElementById('hero-section').innerHTML = `
    <div class="hero-inner">
      <div class="author-avatar-wrap">
        <div class="author-avatar" role="img" aria-label="Photo of ${esc(p.name)}">
          ${avatarHtml}
        </div>
        <div class="verified-badge" aria-label="Verified expert">
          <svg viewBox="0 0 18 18" fill="none"><path d="M3.5 9l4 4 7-7" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>
      <div class="author-content">
        <div class="author-eyebrow"><span class="dot" aria-hidden="true"></span>${esc(p.eyebrow)}</div>
        <h1 class="author-name" id="author-name">${esc(p.name)}</h1>
        <p class="author-title">${esc(p.title)} at <strong>${esc(p.company)}</strong></p>
        <p class="author-bio">${esc(p.bio)}</p>
        <div class="social-row">${socialHtml}</div>
        <div class="hero-stats" role="list" aria-label="Author statistics">${statsHtml}</div>
      </div>
    </div>`;
}

/* ── Render expertise strip ──────────────────────────────────── */
function renderExpertise(tags) {
  const el = document.getElementById('expertise-tags');
  el.innerHTML = tags.map((t, i) =>
    `<span class="tag${i===0?' is-active':''}" role="button" tabindex="0">${esc(t)}</span>`
  ).join('');
}

/* ── Render articles ─────────────────────────────────────────── */
function renderArticles(articles) {
  const featured = articles.find(a => a.featured);
  const rest     = articles.filter(a => !a.featured);
  const all      = featured ? [featured, ...rest] : rest;

  document.getElementById('article-grid').innerHTML = all.map(a => {
    const isFeat = a.featured;
    const badge  = a.badge
      ? `<span class="card-badge ${esc(a.badgeStyle)}">${esc(a.badge)}</span>` : '';
    return `
      <article class="article-card${isFeat?' is-featured':''}">
        <div class="card-thumb" style="background:${esc(a.thumbBg||'linear-gradient(135deg,#eef0ff,#dde0ff)')}${a.thumbImage?';padding:0;overflow:hidden':''}">
          ${a.thumbImage
            ? `<img src="${esc(a.thumbImage)}" alt="${esc(a.title)}" style="width:100%;height:100%;object-fit:cover;display:block;">`
            : `<span class="card-thumb-emoji" aria-hidden="true">${a.emoji}</span>`
          }
          ${badge}
        </div>
        <div class="card-body">
          <div class="card-meta">
            <span>${esc(a.category)}</span>
            <span class="sep" aria-hidden="true"></span>
            <time datetime="${esc(a.date)}">${esc(a.dateLabel)}</time>
          </div>
          <h3 class="card-title">${esc(a.title)}</h3>
          <p class="card-excerpt">${esc(a.excerpt)}</p>
          <div class="card-footer">
            <span class="read-time">⏱ ${esc(a.readTime)}</span>
            <a href="${esc(a.url)}" class="read-btn">Read article</a>
          </div>
        </div>
      </article>`;
  }).join('');
}

/* ── Render sidebar ──────────────────────────────────────────── */
function renderSidebar(data) {
  // Credentials
  document.getElementById('credential-list').innerHTML = data.credentials.map(c =>
    `<li class="credential">
       <div class="credential-icon" aria-hidden="true">${c.icon}</div>
       <div>
         <div class="credential-name">${esc(c.name)}</div>
         <div class="credential-detail">${esc(c.detail)}</div>
       </div>
     </li>`
  ).join('');

  // Stats
  document.getElementById('sidebar-stats').innerHTML = data.sidebarStats.map(s =>
    `<div class="stat-box">
       <div class="stat-value">${esc(s.value)}</div>
       <div class="stat-label">${esc(s.label)}</div>
     </div>`
  ).join('');

  // Topics
  document.getElementById('topic-list').innerHTML = data.topics.map(t =>
    `<li><div class="topic-row" role="link" tabindex="0">
       <span class="topic-name">${esc(t.name)}</span>
       <span class="topic-count">${esc(t.count)}</span>
     </div></li>`
  ).join('');

  // CTA
  const c = data.cta;
  document.getElementById('sidebar-cta').innerHTML =
    `<div class="cta-icon" aria-hidden="true">${c.icon}</div>
     <h3 class="cta-title">${esc(c.title)}</h3>
     <p class="cta-desc">${esc(c.desc)}</p>
     <a href="${esc(c.url)}" class="cta-btn">${esc(c.label)}</a>`;
}

/* ── Render testimonials ─────────────────────────────────────── */
function renderTestimonials(list) {
  document.getElementById('testi-grid').innerHTML = list.map(t =>
    `<blockquote class="testi-card">
       <div class="quote-symbol" aria-hidden="true">"</div>
       <p class="testi-text">${esc(t.quote)}</p>
       <footer class="testi-author">
         <div class="testi-avatar ${esc(t.avatarColor)}" aria-hidden="true">${esc(t.avatarInitial)}</div>
         <div>
           <div class="testi-name">${esc(t.name)}</div>
           <div class="testi-role">${esc(t.role)}</div>
         </div>
       </footer>
     </blockquote>`
  ).join('');
}

/* ── Render related authors ──────────────────────────────────── */
function renderRelated(authors) {
  document.getElementById('related-grid').innerHTML = authors.map(a =>
    `<article class="related-card">
       <div class="rel-avatar ${esc(a.color)}" aria-hidden="true">${esc(a.initial)}</div>
       <div class="rel-name">${esc(a.name)}</div>
       <div class="rel-title">${esc(a.title)}</div>
       <div class="rel-articles">${esc(a.articles)}</div>
     </article>`
  ).join('');
}

/* ── Filter tabs ─────────────────────────────────────────────── */
function initFilters(articles) {
  const categories = ['All', ...new Set(articles.map(a => a.category))];
  const filterRow  = document.getElementById('filter-row');

  filterRow.innerHTML = categories.map((cat, i) =>
    `<button class="filter-btn${i===0?' is-active':''}" role="tab"
             aria-selected="${i===0}" data-cat="${esc(cat)}">${esc(cat)}</button>`
  ).join('');

  filterRow.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    filterRow.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.remove('is-active');
      b.setAttribute('aria-selected','false');
    });
    btn.classList.add('is-active');
    btn.setAttribute('aria-selected','true');

    const cat = btn.dataset.cat;
    const filtered = cat === 'All' ? articles : articles.filter(a => a.category === cat);
    renderArticles(filtered);
    initScrollAnimations();
  });
}

/* ── Expertise tag toggle ────────────────────────────────────── */
function initTags() {
  document.getElementById('expertise-tags').addEventListener('click', e => {
    const tag = e.target.closest('.tag');
    if (!tag) return;
    document.querySelectorAll('#expertise-tags .tag')
            .forEach(t => t.classList.remove('is-active'));
    tag.classList.add('is-active');
  });
}

/* ── Card scroll animations ──────────────────────────────────── */
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) return;
  const cards = document.querySelectorAll(
    '.article-card, .pub-card, .related-card, .testi-card'
  );
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  cards.forEach(card => {
    card.style.opacity    = '0';
    card.style.transform  = 'translateY(18px)';
    card.style.transition = 'opacity .4s ease, transform .4s ease';
    io.observe(card);
  });
}

/* ── CMS link badge ──────────────────────────────────────────── */
function initCMSBadge() {
  const badge = document.createElement('a');
  badge.href  = 'cms/index.html';
  badge.title = 'Open CMS';
  badge.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
    Edit page`;
  Object.assign(badge.style, {
    position:   'fixed', bottom: '24px', right: '24px',
    background: '#4A3AFF', color: '#fff',
    padding: '10px 18px', borderRadius: '100px',
    fontSize: '13px', fontWeight: '700',
    display: 'flex', alignItems: 'center', gap: '7px',
    boxShadow: '0 4px 20px rgba(74,58,255,.45)',
    textDecoration: 'none', zIndex: '9999',
    transition: 'box-shadow .18s, transform .18s'
  });
  badge.onmouseenter = () => {
    badge.style.boxShadow = '0 6px 28px rgba(74,58,255,.6)';
    badge.style.transform = 'translateY(-2px)';
  };
  badge.onmouseleave = () => {
    badge.style.boxShadow = '0 4px 20px rgba(74,58,255,.45)';
    badge.style.transform = '';
  };
  document.body.appendChild(badge);
}

/* ── Boot ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const data = loadData();

  renderHero(data.profile, data.social);
  renderExpertise(data.expertise);
  renderArticles(data.articles);
  renderSidebar(data);
  renderTestimonials(data.testimonials);
  renderRelated(data.relatedAuthors);

  initFilters(data.articles);
  initTags();
  initScrollAnimations();
  initCMSBadge();
});
