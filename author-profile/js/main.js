/* ─────────────────────────────────────────────────────────────
   Naukri360 – Author Profile  |  main.js
   ───────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Filter tabs (article categories) ── */
  document.querySelectorAll('.filter-btn[role="tab"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.filter-row');
      row.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
    });
  });

  /* ── Expertise tag toggle ── */
  document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', () => {
      document.querySelectorAll('.tag').forEach(t => t.classList.remove('is-active'));
      tag.classList.add('is-active');
    });
  });

  /* ── Mobile menu toggle ── */
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav    = document.querySelector('.main-nav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const open = mainNav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', open);
      menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    /* Close nav when a link is clicked */
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => mainNav.classList.remove('is-open'));
    });
  }

  /* ── Scroll-based header shadow ── */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.style.boxShadow = window.scrollY > 10
        ? '0 4px 24px rgba(0,0,0,.35)'
        : '0 2px 16px rgba(0,0,0,.25)';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Lazy-load article images / animate cards on scroll ── */
  const cards = document.querySelectorAll('.article-card, .pub-card, .related-card');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity   = '1';
            entry.target.style.transform = entry.target.classList.contains('article-card')
              ? 'translateY(0)' : 'translateY(0) scale(1)';
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    cards.forEach(card => {
      card.style.opacity    = '0';
      card.style.transform  = 'translateY(18px)';
      card.style.transition = 'opacity .4s ease, transform .4s ease';
      io.observe(card);
    });
  }

  /* ── Load-more button (demo: reveals placeholder cards) ── */
  const loadMoreBtn = document.querySelector('.btn-load-more');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      loadMoreBtn.textContent = 'Loading…';
      loadMoreBtn.disabled    = true;
      setTimeout(() => {
        loadMoreBtn.textContent = 'No more articles';
        loadMoreBtn.style.opacity = '.45';
        loadMoreBtn.style.cursor  = 'default';
      }, 800);
    });
  }

  /* ── Smooth back-to-top on logo click ── */
  document.querySelector('.logo-wrap')?.addEventListener('click', e => {
    if (window.scrollY > 80) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

});
