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

  /* ---- Terminal typing ---- */
  var body = document.getElementById('termBody');
  if (body) {
    var steps = [
      { cmd: 'docker run -p 9000:9000 ghcr.io/veltrixdb/veltrixdb', out: 'VeltrixDB v1.1.0 · 8192 shards · listening on :9000', ok: true },
      { cmd: 'PUT session:8f3a {"uid":42,"cart":3}', out: 'OK · durable in 0.4ms' },
      { cmd: 'GET session:8f3a', out: '{"uid":42,"cart":3}  · 0.28ms (DRAM hit)' },
      { cmd: 'STATS p99', out: 'read p99 4.9ms · writeamp 1.0x · gc 0 events', ok: true }
    ];
    var i = 0;
    function line(step, done) {
      var ln = document.createElement('div');
      ln.className = 'ln';
      var p = document.createElement('span'); p.className = 'p'; p.textContent = '$ ';
      var cmd = document.createElement('span'); cmd.className = 'cmd';
      ln.appendChild(p); ln.appendChild(cmd);
      body.appendChild(ln);
      var t = 0;
      (function type() {
        cmd.textContent = step.cmd.slice(0, t);
        if (t++ <= step.cmd.length) { setTimeout(type, 22); }
        else {
          var out = document.createElement('span');
          out.className = 'out' + (step.ok ? ' ok' : '');
          out.textContent = step.out;
          ln.appendChild(out);
          done();
        }
      })();
    }
    function run() {
      if (i >= steps.length) { setTimeout(function () { body.innerHTML = ''; i = 0; run(); }, 3600); return; }
      line(steps[i++], function () { setTimeout(run, 620); });
    }
    run();
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
