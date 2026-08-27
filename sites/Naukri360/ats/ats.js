/* ═══════════════════════════════════════════════════════════════
   ATS Resume Checker — client-side behaviour
   - Drag/drop + click-to-browse file picker
   - File-type + size validation
   - Animated score gauge
   - Mock scoring (replace ATS_API_URL below with your real endpoint)
═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  // ────────────────────────────────────────────────────────────
  // CONFIG — point this at your backend when ready
  // ────────────────────────────────────────────────────────────
  var ATS_API_URL = '';                            // e.g. '/api/ats/score'
  var MAX_BYTES   = 5 * 1024 * 1024;               // 5 MB
  var OK_TYPES    = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  var OK_EXT      = /\.(pdf|doc|docx)$/i;

  // ────────────────────────────────────────────────────────────
  // DOM refs
  // ────────────────────────────────────────────────────────────
  var form     = document.getElementById('ats-upload-form');
  var dz       = document.getElementById('ats-dropzone');
  var input    = document.getElementById('ats-file');
  var pill     = document.getElementById('ats-file-pill');
  var nameEl   = document.getElementById('ats-file-name');
  var clearBtn = document.getElementById('ats-file-clear');
  var jdInput  = document.getElementById('ats-jd-input');
  var analyse  = document.getElementById('ats-analyze-btn');
  var results  = document.getElementById('ats-results');
  var gaugeRing= document.getElementById('ats-gauge-ring');
  var gaugeNum = document.getElementById('ats-gauge-num');
  var scoreInline = document.getElementById('ats-score-inline');
  var catList  = document.getElementById('ats-cat-list');
  var dlReport = document.getElementById('ats-download-report');

  if(!form) return;

  // ────────────────────────────────────────────────────────────
  // File picker — click + keyboard + drag/drop
  // ────────────────────────────────────────────────────────────
  function openPicker(){ input.click(); }
  dz.addEventListener('click', openPicker);
  dz.addEventListener('keydown', function(e){
    if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openPicker(); }
  });

  ['dragenter','dragover'].forEach(function(ev){
    dz.addEventListener(ev, function(e){ e.preventDefault(); dz.classList.add('is-drag'); });
  });
  ['dragleave','drop'].forEach(function(ev){
    dz.addEventListener(ev, function(e){ e.preventDefault(); dz.classList.remove('is-drag'); });
  });
  dz.addEventListener('drop', function(e){
    var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if(f) handleFile(f);
  });

  input.addEventListener('change', function(){
    var f = input.files && input.files[0];
    if(f) handleFile(f);
  });

  clearBtn.addEventListener('click', function(){
    input.value = '';
    pill.hidden = true;
    analyse.disabled = true;
  });

  function handleFile(f){
    // Validate type — accept by extension if MIME is empty (drag/drop from some OSes)
    var typeOk = OK_TYPES.indexOf(f.type) >= 0 || OK_EXT.test(f.name);
    if(!typeOk){
      alert('Unsupported file type. Please upload a PDF, DOC, or DOCX.');
      return;
    }
    if(f.size > MAX_BYTES){
      alert('File too large. Maximum size is 5 MB.');
      return;
    }
    nameEl.textContent = f.name;
    pill.hidden = false;
    analyse.disabled = false;
    // Mirror into the hidden <input> so a real form-submit picks it up
    try {
      var dt = new DataTransfer();
      dt.items.add(f);
      input.files = dt.files;
    } catch(e){ /* DataTransfer not supported — file already on <input> if via change */ }
  }

  // ────────────────────────────────────────────────────────────
  // Submit handler — POST to ATS_API_URL or fall back to mock
  // ────────────────────────────────────────────────────────────
  form.addEventListener('submit', function(e){
    e.preventDefault();
    if(analyse.disabled) return;
    analyse.disabled = true;
    var originalLabel = analyse.textContent;
    analyse.textContent = 'Analysing…';

    var done = function(data){
      analyse.disabled = false;
      analyse.textContent = originalLabel;
      renderResults(data);
    };

    if(ATS_API_URL){
      var fd = new FormData();
      fd.append('resume', input.files[0]);
      if(jdInput.value.trim()) fd.append('jd', jdInput.value.trim());
      fetch(ATS_API_URL, { method:'POST', body:fd })
        .then(function(r){ return r.json(); })
        .then(done)
        .catch(function(err){
          console.error('[ATS]', err);
          alert('Sorry — could not reach the scoring service. Showing a sample report.');
          done(mockResult());
        });
    } else {
      // No backend wired up — show the demo result so the UI works end-to-end.
      setTimeout(function(){ done(mockResult()); }, 700);
    }
  });

  // ────────────────────────────────────────────────────────────
  // Render results (animates the gauge + category bars)
  // ────────────────────────────────────────────────────────────
  function renderResults(data){
    var overall = clamp(Math.round(data.overall||0), 0, 100);
    results.hidden = false;

    // Score gauge
    if(scoreInline) scoreInline.textContent = overall;
    animateNumber(gaugeNum, overall);
    animateGauge(overall);

    // Band label + colour
    var bandEl = results.querySelector('.ats-score-band');
    if(bandEl){
      bandEl.className = 'ats-score-band ' + (overall >= 80 ? 'ats-band-good' : overall >= 60 ? 'ats-band-warn' : 'ats-band-bad');
      bandEl.textContent = overall >= 80 ? 'Good — recruiter-ready with minor fixes'
                         : overall >= 60 ? 'Needs work — a few high-impact fixes will lift you'
                         :                'Critical — fix the items below before applying';
    }

    // Categories
    if(catList && Array.isArray(data.categories)){
      catList.innerHTML = data.categories.map(function(c){
        var status = c.score >= 80 ? 'ok' : c.score >= 65 ? 'warn' : 'bad';
        // Snap to nearest 5% bucket so CSS classes drive width (no inline style)
        var bucket = Math.round(c.score / 5) * 5;
        if(bucket < 0) bucket = 0; if(bucket > 100) bucket = 100;
        return '<li class="ats-cat" data-status="'+status+'">'
             +   '<div class="ats-cat-head"><span>'+esc(c.label)+'</span><span class="ats-cat-score">'+c.score+'%</span></div>'
             +   '<div class="ats-bar"><span class="w-'+bucket+'"></span></div>'
             +   '<div class="ats-cat-note">'+esc(c.note||'')+'</div>'
             + '</li>';
      }).join('');
    }

    // Scroll into view
    setTimeout(function(){ results.scrollIntoView({behavior:'smooth', block:'start'}); }, 80);
  }

  function animateGauge(score){
    // Circle r=52 → circumference ≈ 326.7
    var C = 2 * Math.PI * 52;
    var offset = C * (1 - clamp(score,0,100)/100);
    if(gaugeRing){
      // stroke-dasharray / stroke-dashoffset are SVG presentation attributes,
      // not CSS — keep them on the element. The transition that animates them
      // lives in ats.css under #ats-gauge-ring.
      gaugeRing.setAttribute('stroke-dasharray', C.toFixed(1));
      gaugeRing.setAttribute('stroke-dashoffset', C);
      // Trigger reflow so the transition kicks in from the new starting offset.
      void gaugeRing.getBoundingClientRect();
      gaugeRing.setAttribute('stroke-dashoffset', offset.toFixed(1));
      // Colour by score band — also an SVG attribute, animated via the CSS rule above.
      gaugeRing.setAttribute('stroke', score >= 80 ? '#16a34a' : score >= 60 ? '#f59e0b' : '#ef4444');
    }
  }
  function animateNumber(el, to){
    if(!el) return;
    var from = 0, t0 = null, dur = 800;
    function step(ts){
      if(!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      el.textContent = Math.round(from + (to - from) * p);
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function clamp(n,lo,hi){ return Math.max(lo, Math.min(hi, n)); }
  function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // ────────────────────────────────────────────────────────────
  // Mock report — used when ATS_API_URL is empty or fetch fails
  // ────────────────────────────────────────────────────────────
  function mockResult(){
    return {
      overall: 82,
      categories: [
        { label:'Keyword match',            score:88, note:'Strong overlap with the job description. Consider adding "stakeholder management".' },
        { label:'Formatting & parseability',score:95, note:'Clean single-column layout, no images or tables blocking the parser.' },
        { label:'Section structure',        score:70, note:'Missing a clear "Skills" header — most ATS look for the literal word.' },
        { label:'Action verbs & impact',    score:68, note:'Replace "responsible for" with verbs like "led", "shipped", "owned".' },
        { label:'Length & density',         score:90, note:'Right-sized for your years of experience (1.2 pages).' },
        { label:'Contact information',      score:55, note:'Add LinkedIn URL and city — recruiters filter on both.' },
        { label:'Quantified achievements',  score:82, note:'Good use of metrics. Add one more in your most recent role.' },
        { label:'File type & encoding',     score:75, note:'Re-export from Word as PDF (not "print to PDF") for cleaner text.' }
      ]
    };
  }

  // ────────────────────────────────────────────────────────────
  // "Download full PDF report" — placeholder
  // ────────────────────────────────────────────────────────────
  if(dlReport){
    dlReport.addEventListener('click', function(){
      alert('PDF report download — wire this to your backend (/api/ats/report.pdf).');
    });
  }
})();
