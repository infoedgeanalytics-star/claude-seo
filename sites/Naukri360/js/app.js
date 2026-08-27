// ═══════════════════════════════════════════════
// Naukri360 UI Interactions (no inline styles)
// ═══════════════════════════════════════════════
(function(){
  // Employer dropdown
  var et=document.getElementById('employerToggle');
  if(et){var dd=et.closest('.dropdown');et.addEventListener('click',function(e){e.stopPropagation();dd.classList.toggle('active')});document.addEventListener('click',function(){dd.classList.remove('active')})}

  // Mobile menu
  var mt=document.querySelector('.mobile-menu-toggle');
  var mm=document.querySelector('.mobile-mega-menu');
  var mc=document.querySelector('.menu-close');
  var ov=document.querySelector('.menu-overlay');
  function openM(){if(mm)mm.classList.add('active');if(ov)ov.classList.add('active');document.body.classList.add('menu-open')}
  function closeM(){if(mm)mm.classList.remove('active');if(ov)ov.classList.remove('active');document.body.classList.remove('menu-open')}
  if(mt)mt.addEventListener('click',openM);
  if(mc)mc.addEventListener('click',closeM);
  if(ov)ov.addEventListener('click',closeM);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeM()});
  document.querySelectorAll('.mega-toggle').forEach(function(b){b.addEventListener('click',function(){b.closest('.has-mega').classList.toggle('active')})});

  // Sidebar sticky handled by CSS

  // Filter chips are <a href> anchor links — each filter is a bookmarkable URL.
  // Behaviour by href shape:
  //   • starts with "#templates/<cat>"  → in-page filter, no navigation
  //   • anything else (full URL, "/path", relative path) → normal anchor click,
  //     browser navigates away as usual
  // Uses event delegation because site.js rebuilds the chips dynamically from
  // page data (CMS) AFTER this script finishes binding.
  function applyFilterFromHash(){
    var m=String(window.location.hash||'').match(/^#templates\/([a-z0-9-]+)/i);
    var cat=m?m[1].toLowerCase():null;
    if(!cat) return;
    var radio=document.getElementById('filter-'+cat);
    if(radio){ radio.checked=true; }
  }
  document.addEventListener('click',function(e){
    var a=e.target.closest && e.target.closest('.filter-btn[data-filter]');
    if(!a) return;
    var cat=a.getAttribute('data-filter');
    var href=a.getAttribute('href')||'';
    // Only intercept the click if the href is the in-page hash form. External
    // or absolute URLs are left alone so the browser navigates naturally.
    if(/^#templates\//i.test(href)){
      e.preventDefault();
      var radio=document.getElementById('filter-'+cat);
      if(radio){ radio.checked=true; }
      if(history.replaceState) history.replaceState(null,'','#templates/'+cat);
    }
  });
  window.addEventListener('hashchange',applyFilterFromHash);
  // Run after site.js has populated chips (it runs synchronously on DOMContentLoaded).
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',applyFilterFromHash);
  } else {
    applyFilterFromHash();
  }

  // "Try this free template" buttons + the surrounding card are JS-driven
  // navigation: each carries data-href set from CMS data (per-template link
  // overrides global templateButtonUrl). External URLs open in a new tab,
  // same-origin paths replace the current tab. Empty/"#" hrefs do nothing.
  function navHref(href, ev){
    if(!href || href==='#') { if(ev) ev.preventDefault(); return; }
    if(ev) ev.preventDefault();
    if(/^https?:\/\//i.test(href)){
      // External — open in new tab, noopener for security
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = href;
    }
  }
  document.addEventListener('click', function(e){
    var btn = e.target.closest && e.target.closest('.read-more-btn[data-href]');
    if(btn){ navHref(btn.getAttribute('data-href'), e); return; }
    var card = e.target.closest && e.target.closest('.cardlink[data-href]');
    if(card){ navHref(card.getAttribute('data-href'), e); }
  });
  // Keyboard accessibility for the card-as-link
  document.addEventListener('keydown', function(e){
    if(e.key !== 'Enter' && e.key !== ' ') return;
    var card = e.target.closest && e.target.closest('.cardlink[data-href][role="link"]');
    if(card){ e.preventDefault(); navHref(card.getAttribute('data-href')); }
  });

  // Sticky filter
  window.addEventListener('scroll',function(){
    var fb=document.querySelector('.filter-buttons');
    var g=document.getElementById('gallery');
    if(!fb||!g)return;
    var sy=window.scrollY;
    var gt=g.getBoundingClientRect().top+sy-500;
    var gb=gt+g.offsetHeight-fb.offsetHeight+500;
    fb.classList.toggle('sticky',sy>=gt&&sy<=gb);
  },{passive:true});

})();
