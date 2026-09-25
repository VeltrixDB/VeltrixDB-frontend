/* VeltrixDB homepage — Confluent-style interactions */
(function () {
  'use strict';

  /* ---- Mobile menu ---- */
  var burger = document.getElementById('navBurger');
  var menu = document.getElementById('mobileMenu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { menu.classList.remove('open'); });
    });
  }

  /* ---- Terminal typing ----
     The session is written in the HTML (so it reads correctly with JS off or
     reduced motion); this only re-types those same lines once, when the
     terminal scrolls into view. Nothing here invents output. */
  var body = document.querySelector('#heroTerm .term-body');
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (body && !reduced && 'IntersectionObserver' in window) {
    var steps = Array.prototype.map.call(body.querySelectorAll('.ln'), function (ln) {
      var c = ln.querySelector('.cmd');
      return {
        cmd: c ? c.textContent : '',
        outs: Array.prototype.map.call(ln.querySelectorAll('.out'), function (o) {
          return { text: o.textContent, ok: o.classList.contains('ok') };
        })
      };
    });
    var played = false;
    var play = function () {
      if (played) return; played = true;
      body.style.minHeight = body.offsetHeight + 'px';
      body.innerHTML = '';
      var i = 0;
      (function next() {
        if (i >= steps.length) return;
        var step = steps[i++];
        var ln = document.createElement('div'); ln.className = 'ln';
        var p = document.createElement('span'); p.className = 'p'; p.textContent = '$ ';
        var cmd = document.createElement('span'); cmd.className = 'cmd';
        ln.appendChild(p); ln.appendChild(cmd); body.appendChild(ln);
        var t = 0;
        (function type() {
          cmd.textContent = step.cmd.slice(0, t);
          if (t++ < step.cmd.length) return setTimeout(type, 18);
          step.outs.forEach(function (o) {
            var out = document.createElement('span');
            out.className = 'out' + (o.ok ? ' ok' : '');
            out.textContent = o.text;
            ln.appendChild(out);
          });
          setTimeout(next, 520);
        })();
      })();
    };
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); setTimeout(play, 300); }
    }, { threshold: 0.4 });
    io.observe(body);
  }

  /* ---- Copy button ---- */
  var copyBtn = document.getElementById('termCopy');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      navigator.clipboard && navigator.clipboard.writeText('docker run -p 9000:9000 ghcr.io/veltrixdb/veltrixdb:latest');
      var prev = copyBtn.textContent; copyBtn.textContent = 'Copied ✓';
      setTimeout(function () { copyBtn.textContent = prev; }, 1600);
    });
  }

  /* ---- Scroll reveal + bar fill ---- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      if (e.target.id === 'bars') {
        e.target.querySelectorAll('.bar-fill').forEach(function (b) {
          b.style.width = b.getAttribute('data-w') + '%';
        });
      }
      io.unobserve(e.target);
    });
  }, { threshold: 0.18 });
  document.querySelectorAll('.reveal, #bars').forEach(function (el) { io.observe(el); });
})();
