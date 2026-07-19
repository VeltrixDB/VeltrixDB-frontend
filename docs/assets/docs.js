// VeltrixDB Docs — shared behavior: mobile sidebar toggle, on-page TOC, copy-to-clipboard, scrollspy.
(function(){
  var toggle = document.querySelector('.menu-toggle');
  var sidebar = document.querySelector('.sidebar');
  if(toggle && sidebar){
    toggle.addEventListener('click', function(){ sidebar.classList.toggle('open'); });
    document.addEventListener('click', function(e){
      if(sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)){
        sidebar.classList.remove('open');
      }
    });
  }

  // Copy buttons on code blocks
  document.querySelectorAll('pre.code-block').forEach(function(block){
    var btn = document.createElement('button');
    btn.textContent = 'Copy';
    btn.setAttribute('type','button');
    btn.style.cssText = 'position:absolute;top:8px;right:8px;background:var(--surface-2);border:1px solid var(--line-2);color:var(--ink-3);font-family:var(--mono);font-size:10px;border-radius:5px;padding:3px 8px;cursor:pointer;text-transform:uppercase;letter-spacing:.05em;z-index:2';
    block.style.position = 'relative';
    block.appendChild(btn);
    btn.addEventListener('click', function(){
      var code = block.querySelector('code');
      navigator.clipboard.writeText(code ? code.innerText : block.innerText).then(function(){
        btn.textContent = 'Copied';
        setTimeout(function(){ btn.textContent = 'Copy'; }, 1400);
      });
    });
  });

  // Build on-page TOC from h2/h3 inside .content-col
  var tocRoot = document.querySelector('.toc-list');
  var content = document.querySelector('.content-col');
  if(tocRoot && content){
    var headers = content.querySelectorAll('h2, h3');
    var links = [];
    headers.forEach(function(h, i){
      if(!h.id){ h.id = 'sec-' + i + '-' + h.textContent.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      if(h.tagName === 'H3'){ a.className = 'lvl3'; }
      tocRoot.appendChild(a);
      links.push({el: h, link: a});
    });
    if(links.length){
      var onScroll = function(){
        var y = window.scrollY + 100;
        var current = links[0];
        links.forEach(function(l){ if(l.el.offsetTop <= y){ current = l; } });
        links.forEach(function(l){ l.link.classList.toggle('active', l === current); });
      };
      document.addEventListener('scroll', onScroll, {passive:true});
      onScroll();
    }
  }
})();

/* ============ Live sidebar search (client-side filter) ============ */
(function(){
  const input = document.getElementById('docsearch');
  const sidebar = document.querySelector('.sidebar');
  if (!input || !sidebar) return;

  const groups = Array.from(sidebar.querySelectorAll('.nav-group'));
  const entries = [];
  groups.forEach(g => {
    g.querySelectorAll('a').forEach(a => entries.push({a, g, text: a.textContent.toLowerCase()}));
  });

  let empty = null;
  function filter(q){
    q = q.trim().toLowerCase();
    let hits = 0;
    entries.forEach(e => {
      const hit = !q || e.text.includes(q);
      e.a.style.display = hit ? '' : 'none';
      if (hit) hits++;
    });
    groups.forEach(g => {
      const visible = Array.from(g.querySelectorAll('a')).some(a => a.style.display !== 'none');
      g.style.display = visible ? '' : 'none';
    });
    if (q && !hits){
      if (!empty){
        empty = document.createElement('div');
        empty.style.cssText = 'padding:14px 12px;font-size:12.5px;color:var(--ink-3, #8A8C95)';
        sidebar.appendChild(empty);
      }
      empty.textContent = 'No pages match "' + q + '" — try a broader term.';
      empty.style.display = '';
    } else if (empty){
      empty.style.display = 'none';
    }
    // On phones the sidebar is collapsed — surface it while searching.
    if (q) sidebar.classList.add('open');
  }
  input.addEventListener('input', () => filter(input.value));

  // Cmd/Ctrl+K focuses search; Escape clears it.
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'){ e.preventDefault(); input.focus(); input.select(); }
    if (e.key === 'Escape' && document.activeElement === input){ input.value=''; filter(''); input.blur(); }
  });
})();

/* ============ Breadcrumbs + prev/next pager (derived from the sidebar) ============ */
(function(){
  var sidebar = document.querySelector('.sidebar');
  var content = document.querySelector('.content-col');
  if(!sidebar || !content) return;

  // Flatten the sidebar into reading order. Hrefs are already correct
  // relative to the CURRENT page (each page ships its own sidebar), and the
  // current page's link carries class="active".
  var entries = [];
  var idx = -1;
  sidebar.querySelectorAll('.nav-group').forEach(function(g){
    var section = (g.querySelector('.nav-group-title') || {}).textContent || '';
    g.querySelectorAll('a').forEach(function(a){
      if(a.classList.contains('active') ||
         a.pathname === location.pathname) idx = entries.length;
      entries.push({href: a.getAttribute('href'), title: a.textContent.trim(), section: section});
    });
  });
  if(idx < 0) return; // landing page or unlisted

  var cur = entries[idx];
  var rootHref = cur.href.indexOf('../') === 0 ? '../index.html' : './index.html';

  // Breadcrumb above the first heading.
  var h1 = content.querySelector('h1');
  if(h1 && !content.querySelector('.crumbs') && !content.querySelector('.breadcrumb') && !document.querySelector('.breadcrumb')){
    var bc = document.createElement('nav');
    bc.className = 'crumbs';
    bc.setAttribute('aria-label','Breadcrumb');
    bc.innerHTML = '<a href="' + rootHref + '">Docs</a><span class="sep">/</span>' +
      '<span class="crumb-section">' + cur.section + '</span><span class="sep">/</span>' +
      '<span class="crumb-here" aria-current="page">' + cur.title + '</span>';
    h1.parentNode.insertBefore(bc, h1);
  }

  // Prev / next pager at the end of the article.
  var prev = entries[idx-1], next = entries[idx+1];
  if(prev || next){
    var pager = document.createElement('div');
    pager.className = 'pager';
    pager.innerHTML =
      (prev ? '<a class="pg pg-prev" href="' + prev.href + '"><span class="pg-k">&larr; Previous</span><span class="pg-t">' + prev.title + '</span><span class="pg-s">' + prev.section + '</span></a>' : '<span></span>') +
      (next ? '<a class="pg pg-next" href="' + next.href + '"><span class="pg-k">Next &rarr;</span><span class="pg-t">' + next.title + '</span><span class="pg-s">' + next.section + '</span></a>' : '<span></span>');
    content.appendChild(pager);
  }
})();
