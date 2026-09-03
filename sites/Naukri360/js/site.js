// ═══════════════════════════════════════════════
// Naukri360 Site Renderer
// Reads CMS_PAGES, renders into #app, generates schemas
// ═══════════════════════════════════════════════
(function(){
  // Get page slug from URL
  var params = new URLSearchParams(window.location.search);
  var slug = params.get('page') || CMS_DEFAULT;

  // Load saved data or defaults
  var saved = null;
  try { var r = localStorage.getItem('cms_pages'); if(r) saved = JSON.parse(r); } catch(e){}
  var pages = saved || CMS_PAGES;

  // Scrub U+FFFD (the "�" seen in content) that got baked into localStorage by
  // an earlier CSV import before the cp1252 fallback existed. The character
  // was almost always a curly apostrophe (U+2019), so between two letters we
  // restore the apostrophe; in any other position fall back to a straight '.
  function scrubReplacementChars(v){
    if (typeof v === 'string'){
      if (v.indexOf('\uFFFD') < 0) return v;
      return v
        .replace(/([A-Za-z0-9])\uFFFD([A-Za-z])/g, "$1\u2019$2")
        .replace(/\uFFFD/g, "\u2019");
    }
    if (Array.isArray(v)){ for (var i=0;i<v.length;i++) v[i] = scrubReplacementChars(v[i]); return v; }
    if (v && typeof v === 'object'){ for (var k in v) if (Object.prototype.hasOwnProperty.call(v,k)) v[k] = scrubReplacementChars(v[k]); return v; }
    return v;
  }
  scrubReplacementChars(pages);

  var D = pages[slug] || pages[CMS_DEFAULT];
  if(!D) return;

  // Update <head> meta
  document.title = D.seo.title;
  setMeta('description', D.seo.desc);
  setMeta('keywords', D.seo.keywords);
  var canon = document.querySelector('link[rel="canonical"]');
  if(canon) canon.href = D.seo.canonical;
  setOG('og:title', D.seo.title);
  setOG('og:description', D.seo.desc);
  setOG('og:url', D.seo.canonical);
  setOG('og:locale', 'en_IN');
  setOG('og:site_name', 'Naukri360');
  setOG('og:image', D.seo.ogImage || 'img/banner-right.png');
  // Twitter card
  var twTitle=document.querySelector('meta[name="twitter:title"]');
  var twDesc=document.querySelector('meta[name="twitter:description"]');
  if(twTitle)twTitle.content=D.seo.title;
  if(twDesc)twDesc.content=D.seo.desc;

  // Generate JSON-LD schemas
  injectSchema('schema-org', {
    "@context":"https://schema.org","@type":"Organization",
    "name":"Naukri360","url":"https://www.naukri.com/naukri360",
    "logo":"https://www.naukri.com/naukri360/img/naukri-logo.png"
  });
  // Product + Reviews
  var revTesti=((D.useGlobalTestimonials!==false&&D.globalTestimonials&&D.globalTestimonials.length>0)?D.globalTestimonials:D.testimonials);
  var productName="Naukri360 "+D.title;
  var productUrl=D.seo.canonical||"https://www.naukri.com/naukri360";

  // 1. SoftwareApplication with AggregateRating (star ratings in SERP)
  injectSchema('schema-product', {
    "@context":"https://schema.org",
    "@type":"SoftwareApplication",
    "name":productName,
    "applicationCategory":"BusinessApplication",
    "operatingSystem":"Web",
    "url":productUrl,
    "image":D.seo.ogImage||"img/banner-right.png",
    "description":D.seo.desc,
    "offers":{"@type":"Offer","price":"0.00","priceCurrency":"USD","availability":"https://schema.org/InStock"},
    "aggregateRating":{
      "@type":"AggregateRating",
      "ratingValue":D.schema.ratingValue,
      "ratingCount":D.schema.ratingCount,
      "reviewCount":D.schema.reviewCount,
      "bestRating":"5",
      "worstRating":"1"
    },
    "review":revTesti.map(function(t){
      return {
        "@type":"Review",
        "name":t.heading,
        "reviewBody":t.text,
        "datePublished":D.created||"2026-01-01",
        "author":{"@type":"Person","name":t.author},
        "reviewRating":{
          "@type":"Rating",
          "ratingValue":"5",
          "bestRating":"5",
          "worstRating":"1"
        },
        "publisher":{"@type":"Organization","name":"Naukri360"}
      };
    })
  });

  // 2. Individual Review schemas — each standalone with itemReviewed (Review snippets)
  revTesti.forEach(function(t,i){
    injectSchema('schema-review-'+i, {
      "@context":"https://schema.org",
      "@type":"Review",
      "itemReviewed":{
        "@type":"SoftwareApplication",
        "name":productName,
        "applicationCategory":"BusinessApplication",
        "url":productUrl,
        "image":D.seo.ogImage||"img/banner-right.png"
      },
      "reviewRating":{
        "@type":"Rating",
        "ratingValue":"5",
        "bestRating":"5",
        "worstRating":"1"
      },
      "name":t.heading,
      "author":{"@type":"Person","name":t.author},
      "reviewBody":t.text,
      "datePublished":D.created||"2026-01-01",
      "publisher":{"@type":"Organization","name":"Naukri360"}
    });
  });


  // FAQ schema — filter empty items & strip HTML from question names (Google FAQ rich results require plain-text name + non-empty answer text)
  var faqItems = (D.faq||[])
    .filter(function(f){ return f && f.q && String(f.q).trim() && f.a && String(f.a).trim(); })
    .map(function(f){
      var q = String(f.q).replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
      var a = String(f.a).trim();
      return {"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}};
    });
  if(faqItems.length > 0){
    injectSchema('schema-faq', {
      "@context":"https://schema.org","@type":"FAQPage",
      "mainEntity": faqItems
    });
  }
  // Build breadcrumbs from the slug's folder structure so UI + schema always match URL depth,
  // even when stored schema.breadcrumbs is stale or only has a single level.
  // Standard prefix: Home (naukri.com root) → Naukri360 (the campaign root) → … page chain.
  var bcRoot = "https://www.naukri.com";
  var bcBase = bcRoot + "/naukri360";
  var bcParts = String(D.slug||slug||"").split("/").filter(Boolean);
  var bcCrumbs = [
    {n:"Home", u:bcRoot},
    {n:"Naukri360", u:bcBase}
  ];
  var bcPath = "";
  for (var bi=0; bi<bcParts.length; bi++){
    bcPath = bcPath ? bcPath+"/"+bcParts[bi] : bcParts[bi];
    var bcIsLast = (bi === bcParts.length-1);
    var bcName;
    if (bcIsLast) {
      bcName = D.title || bcParts[bi];
    } else if (pages[bcPath] && pages[bcPath].title) {
      bcName = pages[bcPath].title;
    } else {
      bcName = bcParts[bi].replace(/-/g," ").replace(/\b\w/g,function(c){return c.toUpperCase();});
    }
    bcCrumbs.push({n:bcName, u:bcBase+"/"+bcPath});
  }
  D.schema.breadcrumbs = bcCrumbs;
  injectSchema('schema-breadcrumb', {
    "@context":"https://schema.org","@type":"BreadcrumbList",
    "itemListElement": bcCrumbs.map(function(b,i,arr){
      var entry={"@type":"ListItem","position":i+1,"name":b.n};
      // Last item (the current page) is intentionally omitted to follow
      // Google's recommended BreadcrumbList shape — leaving "item" off marks
      // the page itself as the trailing crumb so it's not interlinked.
      if(i<arr.length-1) entry.item=b.u;
      return entry;
    })
  });

  // ═══ LLM / AEO / GEO Optimization Schemas ═══

  // 1. Speakable schema — tells voice assistants/LLMs which content to read aloud
  injectSchema('schema-speakable', {
    "@context":"https://schema.org","@type":"WebPage",
    "name":D.seo.title,
    "url":D.seo.canonical||"https://www.naukri.com/naukri360/"+D.slug,
    "speakable":{
      "@type":"SpeakableSpecification",
      "cssSelector":["#hero-h1",".banner-left p",".answer-content",".testimonial-text"]
    }
  });

  // 2. HowTo schema — step-by-step for "How to make a resume" queries
  var sd=D.sidebar||{};
  if(sd.steps&&sd.steps.length>0){
    injectSchema('schema-howto', {
      "@context":"https://schema.org","@type":"HowTo",
      "name":sd.heading||"How to Create a Resume",
      "description":"Step-by-step guide to creating a professional resume with Naukri360",
      "totalTime":"PT15M",
      "tool":{"@type":"HowToTool","name":"Naukri360 Resume Builder"},
      "step":sd.steps.map(function(s,i){
        return {"@type":"HowToStep","position":i+1,"name":"Step "+(i+1),"text":s,"url":D.seo.canonical||"https://www.naukri.com/naukri360"};
      })
    });
  }

  // 3. Service schema — for local/geo SEO and AI assistants
  injectSchema('schema-service', {
    "@context":"https://schema.org","@type":"Service",
    "name":"Naukri360 "+D.title,
    "serviceType":"Resume Building",
    "provider":{"@type":"Organization","name":"Naukri360","url":"https://www.naukri.com/naukri360"},
    "description":D.seo.desc,
    "areaServed":{"@type":"Country","name":"India"},
    "audience":{"@type":"Audience","audienceType":"Job Seekers"},
    "availableChannel":{"@type":"ServiceChannel","serviceUrl":"https://www.naukri.com/naukri360","serviceType":"Online"}
  });

  // 4. DefinedTerm schema — helps LLMs understand key concepts on the page
  injectSchema('schema-terms', {
    "@context":"https://schema.org","@type":"DefinedTermSet",
    "name":"Resume Building Concepts",
    "hasDefinedTerm":[
      {"@type":"DefinedTerm","name":"ATS","description":"Applicant Tracking System - software used by employers to filter and rank job applications automatically based on keywords, formatting, and relevance."},
      {"@type":"DefinedTerm","name":"Resume Template","description":"A pre-designed resume layout with professional formatting that users can customize with their own information, skills, and experience."},
      {"@type":"DefinedTerm","name":"Cover Letter","description":"A one-page document sent alongside a resume that introduces the applicant and explains why they are qualified for the specific position."},
      {"@type":"DefinedTerm","name":"ATS Score","description":"A compatibility rating (0-100) that indicates how well a resume is optimized for automated screening by Applicant Tracking Systems."}
    ]
  });

  // 5. Action schema — helps AI assistants trigger actions
  injectSchema('schema-action', {
    "@context":"https://schema.org","@type":"WebApplication",
    "name":"Naukri360",
    "url":"https://www.naukri.com/naukri360",
    "applicationCategory":"BusinessApplication",
    "operatingSystem":"Web",
    "potentialAction":[
      {"@type":"CreateAction","name":"Create Resume","target":{"@type":"EntryPoint","urlTemplate":"https://www.naukri.com/resume-editor","actionPlatform":["http://schema.org/DesktopWebPlatform","http://schema.org/MobileWebPlatform"]},"object":{"@type":"CreativeWork","name":"Resume"}},
      {"@type":"ViewAction","name":"Browse Templates","target":"https://www.naukri.com/naukri360/resume-templates"}
    ]
  });

  // ItemList schema for templates (auto-generated)
  if(D.templates && D.templates.length > 0) {
    injectSchema('schema-itemlist', {
      "@context":"https://schema.org","@type":"ItemList",
      "name": D.templates_heading || "Resume Templates",
      "numberOfItems": D.templates.length,
      "itemListElement": D.templates.map(function(t,i){
        return {
          "@type":"ListItem","position":i+1,
          "item":{"@type":"CreativeWork","name":t.name,"description":t.desc,
            "image":t.image||"img/cv3.png",
            "url":t.link||D.seo.canonical}
        };
      })
    });
  }

  // CollectionPage schema — marks this page as a curated collection of resume templates
  if(D.templates && D.templates.length > 0){
    injectSchema('schema-collection', {
      "@context":"https://schema.org","@type":"CollectionPage",
      "name":D.seo.title,
      "description":D.seo.desc,
      "url":D.seo.canonical||"https://www.naukri.com/naukri360/"+D.slug,
      "mainEntity":{
        "@type":"ItemList",
        "name":D.templates_heading||"Resume Templates",
        "numberOfItems":D.templates.length,
        "itemListElement":D.templates.map(function(t,i){
          return {"@type":"ListItem","position":i+1,"item":{"@type":"CreativeWork","name":t.name,"description":t.desc,"image":t.image||"img/cv3.png","url":t.link||D.seo.canonical}};
        })
      }
    });
  }

  // SoftwareApplication schema for the Naukri Resume Maker tool
  injectSchema('schema-resume-maker', {
    "@context":"https://schema.org","@type":"SoftwareApplication",
    "name":"Naukri Resume Maker",
    "applicationCategory":"BusinessApplication",
    "operatingSystem":"Web",
    "url":"https://www.naukri.com/resume-maker",
    "description":"Create professional resumes online with Naukri’s free resume maker. Choose from 25+ ATS-friendly templates.",
    "offers":{"@type":"Offer","price":"0.00","priceCurrency":"INR","availability":"https://schema.org/InStock"},
    "aggregateRating":{"@type":"AggregateRating","ratingValue":D.schema.ratingValue||"4.8","ratingCount":D.schema.ratingCount||"12847","reviewCount":D.schema.reviewCount||"8934","bestRating":"5","worstRating":"1"}
  });

  // Fill template variables
  fill('page_h1', D.hero.h1);
  fill('hero_text', D.hero.text);
  // CTA: global is default, page-level overrides only if non-empty
  var gl=D.globalHeroLinks||{};
  var cta1Text = gl.cta1_text || 'Get Started Free';
  var cta2Text = gl.cta2_text || 'Browse Templates';
  if(D.hero.cta1 && D.hero.cta1.trim()) cta1Text = D.hero.cta1;
  if(D.hero.cta2 && D.hero.cta2.trim()) cta2Text = D.hero.cta2;
  fill('cta_text', cta1Text);
  fill('cta_text1', cta2Text);
  // Hero CTA links
  var c1=document.getElementById('hero-cta1'),c2=document.getElementById('hero-cta2');
  if(c1){c1.href=D.hero.cta1_url||gl.cta1_url||'#';if(c1.href.indexOf('http')===0){c1.target='_blank';c1.rel='noopener noreferrer'}}
  if(c2){c2.href=D.hero.cta2_url||gl.cta2_url||'#templates';if(c2.href.indexOf('http')===0){c2.target='_blank';c2.rel='noopener noreferrer'}}
  // Sticky bar
  var sb=D.stickyBar||{},barEl=document.getElementById('stickyBar');
  if(barEl){if(sb.enabled===false){barEl.style.display='none'}else{barEl.style.display='';
    var bt=document.getElementById('bar-text'),bl=document.getElementById('bar-link'),blt=document.getElementById('bar-linktext');
    if(bt&&sb.text)bt.textContent=sb.text;if(blt&&sb.linkText)blt.textContent=sb.linkText;
    if(bl&&sb.linkUrl){bl.href=sb.linkUrl;if(sb.linkUrl.indexOf('http')===0){bl.target='_blank';bl.rel='noopener noreferrer'}}
    if(sb.bgColor)barEl.style.backgroundColor=sb.bgColor;if(sb.textColor)barEl.style.color=sb.textColor;
  }}
  // Sidebar "3 easy steps"
  var sd=D.sidebar||{};
  fill('sidebar_heading',sd.heading||'');
  fill('sidebar_step1',(sd.steps&&sd.steps[0])||'');
  fill('sidebar_step2',(sd.steps&&sd.steps[1])||'');
  fill('sidebar_step3',(sd.steps&&sd.steps[2])||'');
  fill('sidebar_cta_text',sd.ctaText||'');
  var sdImg=document.getElementById('sidebar-img');
  if(sdImg&&sd.image)sdImg.src=sd.image;
  var sdCta=document.getElementById('sidebar-cta');
  if(sdCta&&sd.ctaUrl){sdCta.href=sd.ctaUrl;if(sd.ctaUrl.indexOf('http')===0){sdCta.target='_blank';sdCta.rel='noopener noreferrer'}}
  // Dynamic sidebar steps (beyond 3)
  var stepsUl=document.getElementById('sidebar-steps');
  if(stepsUl&&sd.steps&&sd.steps.length>0){
    var stepsHtml='';
    sd.steps.forEach(function(s){stepsHtml+='<li>'+s+'</li>'});
    stepsUl.innerHTML=stepsHtml;
  }

  // Pages that aren't about resume templates at all (e.g. a feature landing
  // page like Naukri Neo) hide the whole gallery section instead of showing
  // it empty. Skips the heading/chip-rebuild work below entirely.
  if(D.hideTemplatesSection){
    var tplSection = document.getElementById('templates');
    if (tplSection) tplSection.style.display = 'none';
    // "Resumes created today" is resume-template-specific messaging — hide
    // it too on pages that have no templates section at all.
    var heroSub = document.getElementById('hero-subheading');
    if (heroSub) heroSub.style.display = 'none';
  } else {
  fill('tpl_heading', D.templates_heading);
  fill('tpl_sub', D.templates_sub);

  // Filter chips — page-level overrides global. Each chip is a real <a href>
  // anchor link with a data-filter that drives the existing CSS-based filter.
  var chips = (D.useGlobalFilterChips===false && D.filterChips && D.filterChips.length)
    ? D.filterChips
    : (D.globalFilterChips && D.globalFilterChips.length ? D.globalFilterChips : null);
  if (chips) {
    var ulChips = document.querySelector('.filter-buttons');
    var inputsParent = ulChips ? ulChips.parentNode : null;
    if (ulChips && inputsParent){
      // Rebuild the radio inputs (one per cat) so CSS :checked rules fire.
      // Remove existing radios with name="filter".
      Array.from(inputsParent.querySelectorAll('input[type="radio"][name="filter"]')).forEach(function(r){r.remove();});
      var inputsHtml = '';
      var liHtml = '';
      chips.forEach(function(c, i){
        var cat = String(c.cat||'').toLowerCase();
        if (!cat) return;
        var label = String(c.label||cat);
        var url = String(c.url||('#templates/'+cat));
        var safeUrl = url.replace(/"/g,'&quot;');
        var safeLabel = label.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        inputsHtml += '<input type="radio" name="filter" id="filter-'+cat+'"'+(i===0?' checked':'')+' hidden>';
        liHtml += '<li><a href="'+safeUrl+'" data-filter="'+cat+'" class="filter-btn" role="tab"><span>'+safeLabel+'</span></a></li>';
      });
      ulChips.insertAdjacentHTML('beforebegin', inputsHtml);
      ulChips.innerHTML = liHtml;
    }
  }
  }
  // Rescue content that already has bullets mangled to "?" (or similar
  // substitutions) because the CSV was saved in legacy ANSI. We scan each
  // rendered text block for runs of "MARKER text<br>MARKER text..." and
  // rebuild them as proper <ul>/<ol>. Runs on strings (pre-insert).
  function rescueBullets(html){
    if(!html) return html;
    var s = String(html);
    // Preserve tables verbatim — bullet rescue would mangle <tr>/<td> structure.
    if(/<table[\s>]/i.test(s)) return s;
    // Normalize nbsp BEFORE the hit check so "Features:&nbsp;? Foo" is spotted.
    s = s.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ');
    // Count marker hits to decide whether to rescue. We look for markers after
    // any whitespace, '>', ':', ')', '.', '!', ';' — so embedded prose "?" in
    // questions ("Is it free?") doesn't trigger a rewrite unless there are
    // multiple marker runs.
    var BULLET_CHAR = '[?•►▶▪◦‣⁃\\-*]';
    var hitRe = new RegExp('(?:^|[>\\s\\n\\r:.)!;])\\s*'+BULLET_CHAR+'\\s', 'g');
    var hits = (s.match(hitRe) || []).length;
    if (hits < 2) return s.replace(/\u0020/g, ' ');

    // Normalize block-level HTML to newlines and strip inline tags so we can
    // reliably split on markers regardless of how the text was wrapped.
    s = s.replace(/<\/(p|div|li|h[1-6])>\s*<(p|div|li|h[1-6])[^>]*>/gi, '\n');
    s = s.replace(/<\/?(p|div|li|h[1-6])[^>]*>/gi, '\n');
    s = s.replace(/<br\s*\/?>/gi, '\n');
    s = s.replace(/<\/?(span|b|i|em|strong|u|small)[^>]*>/gi, '');

    // Break any marker that follows punctuation ("include:? Foo") onto its own line.
    s = s.replace(new RegExp('([:).!])\\s*('+BULLET_CHAR+')\\s', 'g'), '$1\n$2 ');
    // Break marker runs that sit mid-line ("foo ? bar ? baz") onto their own lines.
    s = s.replace(new RegExp('\\s+('+BULLET_CHAR+')\\s+', 'g'), '\n$1 ');

    var lines = s.split(/\r?\n+/).map(function(l){return l.trim();}).filter(Boolean);

    var out = [], buf = [], mode = 'none';
    var BULLET = new RegExp('^'+BULLET_CHAR+'\\s+(.+)$');
    var NUMBER = /^(\d+)[\.)]\s+(.+)$/;
    function flush(){
      if (!buf.length){ mode='none'; return; }
      if (mode==='ul'){
        out.push('<ul>'+buf.map(function(t){return '<li>'+t+'</li>';}).join('')+'</ul>');
      } else if (mode==='ol'){
        out.push('<ol start="'+buf[0].n+'">'+buf.map(function(x){return '<li value="'+x.n+'">'+x.t+'</li>';}).join('')+'</ol>');
      } else {
        out.push(buf.join('<br>'));
      }
      buf=[]; mode='none';
    }
    for (var i=0; i<lines.length; i++){
      var line = lines[i], m;
      if ((m = line.match(BULLET))){
        if (mode!=='ul') flush();
        mode='ul'; buf.push(m[1]);
      } else if ((m = line.match(NUMBER))){
        if (mode!=='ol') flush();
        mode='ol'; buf.push({n:m[1], t:m[2]});
      } else {
        if (mode!=='text') flush();
        mode='text'; buf.push(line);
      }
    }
    flush();
    return out.join('');
  }

  // Dynamic sections rendering
  var secContainer = document.getElementById('dynamic-sections');
  if(secContainer && D.sections && D.sections.length > 0) {
    var secHtml = '';
    D.sections.forEach(function(sec, idx) {
      secHtml += '<div class="sec2Inner'+(idx>0?' sec2Inner2':'')+'">';
      if(sec.h2) secHtml += '<h2>'+sec.h2+'</h2>';
      if(sec.image) secHtml += '<img src="'+sec.image+'" width="640" alt="'+(sec.h2||'Content image')+'" loading="lazy">';
      if(sec.text) secHtml += '<div class="sec-body">'+rescueBullets(sec.text)+'</div>';
      if(sec.h3) secHtml += '<h3>'+sec.h3+'</h3>';
      if(sec.h3_text) secHtml += '<div class="sec-body">'+rescueBullets(sec.h3_text)+'</div>';
      if(sec.points && sec.points.length > 0) {
        secHtml += '<div class="clear"></div><ul class="ulLast">';
        sec.points.forEach(function(p){ secHtml += '<li>'+p+'</li>'; });
        secHtml += '</ul>';
      }
      secHtml += '</div>';
    });
    secContainer.innerHTML = secHtml;
  }
  fill('testi_heading', D.testimonials_heading);
  fill('footer_h2', D.footer_heading);
  fill('footer_text', D.footer_text);
  // Render breadcrumb UI matching the BreadcrumbList schema: linked segments with the
  // current page as an un-linked, aria-current label.
  var bcSep = ' <span class="bc-sep" aria-hidden="true">&gt;</span> ';
  var bcHtml = D.schema.breadcrumbs.map(function(b,i,arr){
    var safeName = String(b.n||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    if (i === arr.length - 1) return '<span aria-current="page">'+safeName+'</span>';
    var safeUrl = String(b.u||'').replace(/"/g,'&quot;');
    return '<a href="'+safeUrl+'">'+safeName+'</a>';
  }).join(bcSep);
  fill('breadcrumb', bcHtml);



  // Match the gallery card count to the actual template count. The live
  // index.html template ships with 9 placeholder <article>s — pages with
  // fewer templates would otherwise show stale defaults in the extras, and
  // pages with more would silently drop overflow templates.
  (function syncGallery(){
    if(D.hideTemplatesSection) return;
    var gallery=document.getElementById('gallery');
    if(!gallery) return;
    var cards=gallery.querySelectorAll('.image-card');
    var want=(D.templates||[]).length;
    // Remove surplus
    for(var i=cards.length-1;i>=want;i--){
      if(cards[i] && cards[i].parentNode) cards[i].parentNode.removeChild(cards[i]);
    }
    // Clone the last card to cover overflow (preserves the markup shape so
    // the forEach below can fill data via data-tpl / data-cms hooks).
    if(want>cards.length && cards.length>0){
      var proto=cards[cards.length-1];
      for(var j=cards.length;j<want;j++){
        var clone=proto.cloneNode(true);
        clone.setAttribute('data-tpl', String(j+1));
        // Re-tag the data-cms placeholders so fill() targets this card
        var nameEl=clone.querySelector('[data-cms^="tpl_"][data-cms$="_name"]');
        if(nameEl) nameEl.setAttribute('data-cms','tpl_'+(j+1)+'_name');
        var descEl=clone.querySelector('[data-cms^="tpl_"][data-cms$="_desc"]');
        if(descEl) descEl.setAttribute('data-cms','tpl_'+(j+1)+'_desc');
        gallery.appendChild(clone);
      }
    }
  })();

  // Fill templates — name, desc, category, and custom images
  D.templates.forEach(function(t,i){
    fill('tpl_'+(i+1)+'_name', t.name);
    fill('tpl_'+(i+1)+'_desc', t.desc);
    var card = document.querySelector('[data-tpl="'+(i+1)+'"]');
    if(card) {
      card.setAttribute('data-category', t.cat);
      // Update image if custom image set
      if(t.image) {
        var img = card.querySelector('img');
        if(img) { img.src = t.image; img.alt = t.name + ' resume template'; }
      }
      // Link precedence per template:
      //   per-template t.link
      //     → globalTemplates[i].link (if useGlobalTemplateLinks is on)
      //     → (falls through to globalBtnUrl below)
      var perTplLink = t.link;
      var useGlobalTplLinks = D.useGlobalTemplateLinks !== false;
      var globalTplLink = useGlobalTplLinks && Array.isArray(D.globalTemplates) && D.globalTemplates[i]
        ? (D.globalTemplates[i].link||'')
        : '';
      var resolvedLink = perTplLink || globalTplLink;
      if(resolvedLink) {
        var cardLink = card.querySelector('.cardlink');
        if(cardLink) {
          cardLink.setAttribute('data-href', resolvedLink);
          cardLink.setAttribute('title', t.name + ' resume template');
        }
        var btnEl = card.querySelector('.read-more-btn');
        if(btnEl) btnEl.setAttribute('data-href', resolvedLink);
      }
    }
  });

  // Apply template button URL and text to all cards that don't already have
  // a per-template data-href. Precedence:
  //   per-template t.link  →  page templateButtonUrl (when override is on)
  //                        →  global globalTemplateButtonUrl
  var useGlobalBtn = D.useGlobalTemplateButton !== false; // default true
  var globalBtnUrl = useGlobalBtn
    ? (D.globalTemplateButtonUrl || D.templateButtonUrl || '')
    : (D.templateButtonUrl || D.globalTemplateButtonUrl || '');
  var globalBtnText = useGlobalBtn
    ? (D.globalTemplateButtonText || D.templateButtonText || 'Try this free template')
    : (D.templateButtonText || D.globalTemplateButtonText || 'Try this free template');
  // Global PDF/DOC URLs (page overrides global when present)
  var pdfUrlGlobal = D.templatePdfUrl || D.globalTemplatePdfUrl || '';
  var docUrlGlobal = D.templateDocUrl || D.globalTemplateDocUrl || '';
  document.querySelectorAll('.image-card').forEach(function(card, idx){
    var tpl = (D.templates||[])[idx] || {};
    var perPdf = tpl.pdfUrl || pdfUrlGlobal || globalBtnUrl;
    var perDoc = tpl.docUrl || docUrlGlobal || globalBtnUrl;
    var btn = card.querySelector('.read-more-btn');
    if(btn) {
      btn.textContent = globalBtnText;
      if(!btn.getAttribute('href') || btn.getAttribute('href')==='#') btn.setAttribute('href', globalBtnUrl || '#');
      if(!btn.getAttribute('data-href')) btn.setAttribute('data-href', globalBtnUrl);
    }
    var link = card.querySelector('.cardlink');
    if(link) {
      if(!link.getAttribute('data-href') || link.getAttribute('data-href') === '#') {
        link.setAttribute('data-href', globalBtnUrl);
      }
      if(link.tagName === 'A' && (!link.getAttribute('href') || link.getAttribute('href')==='#')){
        link.setAttribute('href', globalBtnUrl || '#');
      }
    }
    var pdfA = card.querySelector('.tpl-fmt-pdf');
    if(pdfA) pdfA.setAttribute('href', perPdf || '#');
    var docA = card.querySelector('.tpl-fmt-doc');
    if(docA) docA.setAttribute('href', perDoc || '#');
  });

  // Fill testimonials
  var useTesti=(D.useGlobalTestimonials!==false&&D.globalTestimonials&&D.globalTestimonials.length>0)?D.globalTestimonials:D.testimonials;
  // Match testimonial card count to data length (HTML ships with 4 slides).
  (function syncTesti(){
    var wrapper=document.querySelector('.carousel-wrapper');
    var carousel=document.querySelector('.carousel-container');
    if(!wrapper||!carousel) return;
    var cards=wrapper.querySelectorAll('.testimonial-card');
    var want=(useTesti||[]).length;
    // Trim surplus cards
    for(var i=cards.length-1;i>=want;i--){ if(cards[i].parentNode) cards[i].parentNode.removeChild(cards[i]); }
    // Clone for overflow
    if(want>cards.length && cards.length>0){
      var proto=cards[cards.length-1];
      for(var j=cards.length;j<want;j++){
        var clone=proto.cloneNode(true);
        var n=j+1;
        var hd=clone.querySelector('.testimonial-title');
        var tx=clone.querySelector('.testimonial-text');
        var au=clone.querySelector('.author-name');
        var rl=clone.querySelector('.author-role');
        if(hd) hd.setAttribute('data-cms','testi_'+n+'_heading');
        if(tx) tx.setAttribute('data-cms','testi_'+n+'_text');
        if(au) au.setAttribute('data-cms','testi_'+n+'_author');
        if(rl) rl.setAttribute('data-cms','testi_'+n+'_role');
        wrapper.appendChild(clone);
      }
    }
    // Sync the carousel radio inputs + arrow labels to match.
    var radios=carousel.querySelectorAll('input.carousel-input');
    for(var k=radios.length-1;k>=want;k--){ if(radios[k].parentNode) radios[k].parentNode.removeChild(radios[k]); }
    if(want>radios.length && radios.length>0){
      var refRadio=radios[radios.length-1];
      for(var m=radios.length;m<want;m++){
        var nr=refRadio.cloneNode(true);
        nr.id='slide'+(m+1);
        nr.checked=false;
        refRadio.parentNode.insertBefore(nr, refRadio.nextSibling);
      }
    }
    // Hide arrows if only one (or zero) testimonial
    var arrows=carousel.querySelectorAll('.carousel-arrow');
    arrows.forEach(function(a){ a.style.display = (want>1?'':'none'); });
  })();
  useTesti.forEach(function(t,i){
    fill('testi_'+(i+1)+'_heading', t.heading);
    fill('testi_'+(i+1)+'_text', t.text);
    fill('testi_'+(i+1)+'_author', t.author);
    fill('testi_'+(i+1)+'_role', t.role);
  });

  // Match FAQ card count to D.faq.length (HTML ships with 4 placeholders).
  (function syncFaq(){
    var acc=document.querySelector('.accordion'); if(!acc) return;
    var items=acc.querySelectorAll('.faq-item');
    var want=(D.faq||[]).length;
    for(var i=items.length-1;i>=want;i--){ if(items[i].parentNode) items[i].parentNode.removeChild(items[i]); }
    if(want>items.length && items.length>0){
      var proto=items[items.length-1];
      for(var j=items.length;j<want;j++){
        var clone=proto.cloneNode(true);
        var n=j+1;
        var input=clone.querySelector('input[type="checkbox"]');
        var label=clone.querySelector('label.faq-question');
        var qNum=clone.querySelector('.q-num');
        var qText=clone.querySelector('.q-text');
        var ans=clone.querySelector('.answer-content');
        if(input){ input.id='q'+n; input.checked=false; }
        if(label) label.setAttribute('for','q'+n);
        if(qNum) qNum.textContent='Q'+n;
        if(qText) qText.setAttribute('data-cms','q'+n);
        if(ans) ans.setAttribute('data-cms','q'+n+'_answer');
        acc.appendChild(clone);
      }
    }
  })();

  // Fill FAQ
  D.faq.forEach(function(f,i){
    fill('q'+(i+1), f.q);
    fill('q'+(i+1)+'_answer', f.a);
  });

  // Render content blocks
  var cbContainer = document.getElementById('content-blocks');
  if(cbContainer && D.content_blocks && D.content_blocks.length > 0) {
    var html = '';
    D.content_blocks.forEach(function(b){
      html += '<div class="content-block-item'+(b.cssClass?' '+b.cssClass:'')+'">';
      if(b.title) html += '<h2>'+b.title+'</h2>';
      html += '<div class="block-body">'+b.content+'</div></div>';
    });
    cbContainer.innerHTML = html;
  }



  // Interlinking — populate the chip strip from CMS data (global or page list).
  (function renderInterlinks(){
    var sec=document.getElementById('interlinks-section');
    if(!sec) return;
    // Heading/sub-text: apply a page-specific override independently of the
    // link list below, so a page with custom text but no CMS link data
    // (falling back to the static baked-in list) still gets its own heading.
    // Pages without an override keep the static placeholder text untouched.
    if(typeof D.interlinks_heading==='string' && D.interlinks_heading){
      var hd=document.getElementById('interlinks-h2');
      if(hd) hd.textContent = D.interlinks_heading;
    }
    if(typeof D.interlinks_sub==='string' && D.interlinks_sub){
      var sb=document.getElementById('interlinks-sub');
      if(sb) sb.textContent = D.interlinks_sub;
    }
    var useGlobal = D.useGlobalInterlinks !== false;
    var rawList = useGlobal
      ? (Array.isArray(D.globalInterlinks)?D.globalInterlinks:[])
      : (Array.isArray(D.interlinks)?D.interlinks:[]);
    // Drop a chip that points at the current page (self-link is noise).
    var here = (D.seo && D.seo.canonical) || ('https://www.naukri.com/naukri360/'+slug);
    var list = rawList.filter(function(x){ return x && x.url && x.url !== here; });
    // If CMS has no link data, leave whatever static markup was baked into
    // the HTML intact (so crawlers and no-JS users still see the SEO link list).
    if(!list.length) return;
    sec.style.display='';
    var ul=document.getElementById('interlinks-list');
    if(!ul) return;
    var html='';
    list.forEach(function(l){
      if(!l||!l.label) return;
      var url=l.url||'#';
      var ext=/^https?:\/\//i.test(url);
      var lbl=String(l.label).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      var safeUrl=String(url).replace(/"/g,'&quot;');
      html+='<li><a href="'+safeUrl+'" class="filter-btn"'+(ext?' target="_blank" rel="noopener noreferrer"':'')+'><span>'+lbl+'</span></a></li>';
    });
    ul.innerHTML=html;
  })();

  // On the resume-templates hub page only, move "Explore More Resume
  // Templates" up to right after the template gallery (before "What Makes
  // the Best Resume Template?") instead of its default spot near the
  // bottom. Every other page keeps the section where the static HTML
  // already has it. Runs after renderInterlinks() so the section's content
  // is already populated before it's relocated.
  if(slug==='resume-templates'){
    var ilSection=document.getElementById('interlinks-section');
    var gallerySection=document.getElementById('templates');
    if(ilSection && gallerySection) gallerySection.insertAdjacentElement('afterend', ilSection);
  }

  // Helpers
  function fill(id, val) {
    var els = document.querySelectorAll('[data-cms="'+id+'"]');
    els.forEach(function(el){ el.innerHTML = val || ''; });
  }
  function setMeta(n,c){ var m=document.querySelector('meta[name="'+n+'"]'); if(m)m.content=c; }
  function setOG(p,c){ var m=document.querySelector('meta[property="'+p+'"]'); if(m)m.content=c; }
  function injectSchema(id,obj){
    var el=document.getElementById(id);
    if(el) el.textContent=JSON.stringify(obj);
    else { var s=document.createElement('script');s.type='application/ld+json';s.id=id;s.textContent=JSON.stringify(obj);document.head.appendChild(s); }
  }
})();
