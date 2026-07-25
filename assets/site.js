/* ============ 3D PIPELINE (read/write path) ============ */
function makePipeline3D(){
  const el = document.getElementById('pipe3d');
  if (!el || !window.THREE) return;
  const W = () => el.clientWidth, H = () => el.clientHeight || 300;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, W()/H(), 0.1, 100);
  camera.position.set(0, 1.4, 7.6); camera.lookAt(0, 0, 0);
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W(), H());
  renderer.setClearColor(0x000000, 0);
  el.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  const dl = new THREE.DirectionalLight(0x0B5CFF, 0.9); dl.position.set(2,4,4); scene.add(dl);
  const dl2 = new THREE.DirectionalLight(0xffffff, 0.35); dl2.position.set(-3,2,3); scene.add(dl2);

  const xs = [-4.2, -2.1, 0, 2.1, 4.2];
  const accentIdx = 2;
  const nodes = [];
  xs.forEach((x,i)=>{
    const grp = new THREE.Group();
    const geom = new THREE.BoxGeometry(1.0, 0.8, 0.8);
    const body = new THREE.Mesh(geom, new THREE.MeshPhysicalMaterial({
      color: i===accentIdx ? 0x0B5CFF : 0x1B1B26,
      metalness:0.55, roughness:0.45,
      emissive: i===accentIdx ? 0x0B5CFF : 0x000000,
      emissiveIntensity: i===accentIdx ? 0.55 : 0.0,
      transparent:true, opacity: 0.92
    }));
    grp.add(body);
    const wf = new THREE.LineSegments(
      new THREE.WireframeGeometry(geom),
      new THREE.LineBasicMaterial({color: i===accentIdx ? 0x8FB4FF : 0x6A6C78, transparent:true, opacity: i===accentIdx?0.85:0.55})
    );
    grp.add(wf);
    grp.position.set(x, 0, 0);
    grp.userData = {i, ph: Math.random()*Math.PI*2};
    scene.add(grp);
    nodes.push(grp);
  });
  for (let i=0;i<xs.length-1;i++){
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(xs[i]+0.5, 0, 0),
      new THREE.Vector3(xs[i+1]-0.5, 0, 0)
    ]);
    scene.add(new THREE.Line(geo, new THREE.LineBasicMaterial({color:0x0B5CFF, transparent:true, opacity:0.32})));
  }

  const packets = [];
  function spawn(isWrite){
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 16, 12),
      new THREE.MeshBasicMaterial({color: isWrite ? 0x16B8E8 : 0x2E8BFF})
    );
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 12),
      new THREE.MeshBasicMaterial({color: isWrite ? 0x16B8E8 : 0x2E8BFF, transparent:true, opacity:0.18})
    );
    m.add(halo);
    m.userData = {t:0, speed: 0.0050 + Math.random()*0.0030, write:isWrite};
    scene.add(m);
    packets.push(m);
  }

  let last = 0;
  function loop(now){
    if (now - last > 480 && packets.length < 10){ spawn(Math.random() < 0.4); last = now; }
    for (let i=packets.length-1;i>=0;i--){
      const p = packets[i];
      p.userData.t += p.userData.speed;
      if (p.userData.t > 1){ scene.remove(p); packets.splice(i,1); continue; }
      const t = p.userData.t;
      p.position.x = xs[0] + t*(xs[xs.length-1]-xs[0]);
      p.position.y = Math.sin(t*Math.PI)*0.55 + 0.05;
      p.position.z = Math.cos(t*Math.PI*1.5)*0.18;
    }
    const tt = (now||0)*0.001;
    nodes.forEach(n => {
      n.rotation.y += 0.006;
      n.rotation.x = Math.sin(tt*0.7 + n.userData.ph)*0.05;
    });
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  window.addEventListener('resize', ()=>{
    camera.aspect = W()/H(); camera.updateProjectionMatrix();
    renderer.setSize(W(), H());
  });
}

/* ============ 3D GLOBE ============ */
function makeGlobe3D(){
  const el = document.getElementById('globe3d');
  if (!el || !window.THREE) return;
  const W = () => el.clientWidth, H = () => el.clientHeight || 420;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, W()/H(), 0.1, 100);
  camera.position.set(0, 0, 6);
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W(), H());
  renderer.setClearColor(0x000000, 0);
  el.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const dl = new THREE.DirectionalLight(0x0B5CFF, 1.0); dl.position.set(3,2,5); scene.add(dl);

  const r = 1.7;
  const grp = new THREE.Group();
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(r, 36, 28),
    new THREE.MeshPhysicalMaterial({color:0x12121C, metalness:0.35, roughness:0.7, transparent:true, opacity:0.92})
  );
  grp.add(sphere);
  grp.add(new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.SphereGeometry(r*1.005, 28, 18)),
    new THREE.LineBasicMaterial({color:0x0B5CFF, transparent:true, opacity:0.32})
  ));
  // outer ring (atmospheric)
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(r*1.18, r*1.20, 64),
    new THREE.MeshBasicMaterial({color:0x2E8BFF, side:THREE.DoubleSide, transparent:true, opacity:0.5})
  );
  ring.rotation.x = Math.PI*0.18;
  grp.add(ring);

  const pts = [
    [0.4, 0.7, 0.6],[ -0.6, 0.4, 0.7],[ -0.9, 0.5, 0.0],
    [0.9, 0.2, 0.4],[ 1.0, 0.6, -0.3],[ -0.3, -0.6, 0.7],
    [0.5, -0.5, -0.6],[ -0.85, -0.1, -0.4],[ 0.1, 0.85, -0.4]
  ];
  const ringPulse = [];
  pts.forEach(p=>{
    const v = new THREE.Vector3(...p).normalize().multiplyScalar(r*1.02);
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 14, 10),
      new THREE.MeshBasicMaterial({color:0x2E8BFF})
    );
    dot.position.copy(v); grp.add(dot);
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.06, 0.085, 24),
      new THREE.MeshBasicMaterial({color:0x5B93FF, side:THREE.DoubleSide, transparent:true, opacity:0.6})
    );
    halo.position.copy(v); halo.lookAt(0,0,0);
    halo.userData = {ph: Math.random()*Math.PI*2};
    ringPulse.push(halo);
    grp.add(halo);
  });

  // arcs
  function arc(a,b){
    const va = new THREE.Vector3(...a).normalize().multiplyScalar(r*1.02);
    const vb = new THREE.Vector3(...b).normalize().multiplyScalar(r*1.02);
    const mid = va.clone().add(vb).multiplyScalar(0.5).normalize().multiplyScalar(r*1.65);
    const curve = new THREE.QuadraticBezierCurve3(va, mid, vb);
    const pts = curve.getPoints(40);
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.Line(geo, new THREE.LineBasicMaterial({color:0x5B93FF, transparent:true, opacity:0.55}));
  }
  for (let i=0;i<pts.length;i++){
    grp.add(arc(pts[i], pts[(i+2)%pts.length]));
    grp.add(arc(pts[i], pts[(i+4)%pts.length]));
  }

  scene.add(grp);

  let mx=0, my=0;
  el.parentElement.addEventListener('mousemove', (e)=>{
    const r = el.getBoundingClientRect();
    mx = ((e.clientX - r.left)/r.width - 0.5) * 0.6;
    my = ((e.clientY - r.top)/r.height - 0.5) * 0.4;
  });

  const t0 = performance.now();
  function loop(){
    const t = (performance.now()-t0)*0.001;
    grp.rotation.y = t*0.18 + mx*0.6;
    grp.rotation.x = Math.sin(t*0.2)*0.15 - my*0.4;
    ringPulse.forEach(d=>{
      const s = 1 + (Math.sin(t*2 + d.userData.ph) + 1) * 0.7;
      d.scale.setScalar(s);
      d.material.opacity = Math.max(0, 0.6 - (s-1)*0.4);
    });
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();
  window.addEventListener('resize', ()=>{
    camera.aspect = W()/H(); camera.updateProjectionMatrix();
    renderer.setSize(W(), H());
  });
}

/* ============ HERO 3D — wire icosahedron + particles ============ */
function makeHero3D(){
  const el = document.getElementById('hero3d');
  if (!el || !window.THREE) return;
  const W = () => el.clientWidth, H = () => Math.max(el.clientHeight, 600);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, W()/H(), 0.1, 200);
  camera.position.set(0, 0, 12);
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W(), H());
  renderer.setClearColor(0x000000, 0);
  el.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const key = new THREE.DirectionalLight(0x0B5CFF, 1.0); key.position.set(4,3,5); scene.add(key);
  const rim = new THREE.DirectionalLight(0x2E8BFF, 0.5); rim.position.set(-4,-2,3); scene.add(rim);

  // Big wire icosahedron
  const objs = [];
  function makeSolid(geom, opt){
    const grp = new THREE.Group();
    const body = new THREE.Mesh(geom, new THREE.MeshPhysicalMaterial({
      color: opt.color, metalness:.4, roughness:.5,
      transparent:true, opacity: opt.bodyOp ?? 0.10, side:THREE.DoubleSide
    }));
    grp.add(body);
    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(geom),
      new THREE.LineBasicMaterial({color: opt.wire, transparent:true, opacity: opt.wireOp ?? 0.55})
    );
    grp.add(wire);
    grp.position.set(opt.x, opt.y, opt.z||0);
    grp.scale.setScalar(opt.s ?? 1);
    grp.userData = { rx: (Math.random()*0.5+0.1)*0.0035, ry: (Math.random()*0.5+0.1)*0.0045, fx: opt.x, fy: opt.y, ph: Math.random()*Math.PI*2 };
    scene.add(grp);
    objs.push(grp);
  }
  makeSolid(new THREE.IcosahedronGeometry(1.6, 0),  {x:-4.5, y:1.0, color:0x0B5CFF, wire:0x5B93FF, s:1.0});
  makeSolid(new THREE.OctahedronGeometry(1.0, 0),   {x:4.6,  y:-1.4, color:0x0B5CFF, wire:0x5B93FF, s:1.0});
  makeSolid(new THREE.TorusKnotGeometry(0.6,0.18,80,12,2,3), {x:3.8, y:1.8, color:0x2E8BFF, wire:0x8FB4FF, s:1.0, bodyOp:.06});
  makeSolid(new THREE.TetrahedronGeometry(0.85,0),  {x:-3.5, y:-2.0, color:0x0B5CFF, wire:0x5B93FF, s:1.0});
  makeSolid(new THREE.DodecahedronGeometry(0.55,0), {x:0.6, y:2.6, z:-1, color:0x0B5CFF, wire:0x5B93FF, s:1.0, bodyOp:.08});

  // Starfield
  const N = 380;
  const sg = new THREE.BufferGeometry();
  const sp = new Float32Array(N*3);
  for (let i=0;i<N;i++){
    sp[i*3]   = (Math.random()-0.5)*36;
    sp[i*3+1] = (Math.random()-0.5)*22;
    sp[i*3+2] = -8 + Math.random()*-14;
  }
  sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({
    color:0x0B5CFF, size:0.06, transparent:true, opacity:0.5,
    sizeAttenuation:true, depthWrite:false, blending:THREE.AdditiveBlending
  })));

  let mx=0, my=0;
  el.parentElement.addEventListener('mousemove', (e)=>{
    const r = el.getBoundingClientRect();
    mx = ((e.clientX - r.left)/r.width - 0.5) * 0.6;
    my = ((e.clientY - r.top)/r.height - 0.5) * 0.4;
  });

  const t0 = performance.now();
  function loop(){
    const t = (performance.now()-t0)*0.001;
    objs.forEach(o => {
      o.rotation.x += o.userData.rx;
      o.rotation.y += o.userData.ry;
      o.position.x = o.userData.fx + Math.sin(t*0.5 + o.userData.ph)*0.18;
      o.position.y = o.userData.fy + Math.cos(t*0.4 + o.userData.ph)*0.16;
    });
    camera.position.x += (mx*1.4 - camera.position.x)*0.04;
    camera.position.y += (-my*1.0 - camera.position.y)*0.04;
    camera.lookAt(0,0,0);
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();

  window.addEventListener('resize', ()=>{
    camera.aspect = W()/H();
    camera.updateProjectionMatrix();
    renderer.setSize(W(), H());
  });
}

/* ============ Latency bars on viewport enter ============ */
(function(){
  const bars = document.querySelectorAll('.bar-fill');
  const wrap = document.querySelector('.lat-wrap');
  if (!wrap) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if (e.isIntersecting){
        bars.forEach(b=>{ b.style.width = b.dataset.w + '%'; });
        io.disconnect();
      }
    });
  },{threshold:.2});
  io.observe(wrap);
})();

/* ============ Path demo — auto-cycling tabs + steps ============ */
(function(){
  const tabs = document.querySelectorAll('.ptab');
  if (!tabs.length) return;
  const panels = {
    write:{el:document.getElementById('pc-write'), ctx:'Single-key write · 128 B value · TCP binary protocol'},
    read: {el:document.getElementById('pc-read'),  ctx:'Single-key read · 128 B value · TCP binary protocol'},
    delete:{el:document.getElementById('pc-delete'),ctx:'Single-key delete · tombstone · TCP binary protocol'},
  };
  const ctx = document.getElementById('pathCtx');
  const tabOrder = ['write','read','delete'];
  let curTab = 0, stepTimerId = null, tabTimerId = null, paused = false;

  function setActiveTab(key){
    tabs.forEach(x=>x.classList.remove('active'));
    const btn = [...tabs].find(t=>t.dataset.path===key);
    if (btn) btn.classList.add('active');
    Object.values(panels).forEach(p=>{p.el.style.display='none'});
    const p = panels[key];
    p.el.style.display='flex';
    if (ctx) ctx.textContent = p.ctx;
    const steps = p.el.querySelectorAll('.pstep');
    steps.forEach(s=>s.classList.remove('active'));
    if (steps.length) steps[0].classList.add('active');
  }
  function cycleStep(){
    const p = panels[tabOrder[curTab]];
    const steps = p.el.querySelectorAll('.pstep');
    const cur = [...steps].findIndex(s=>s.classList.contains('active'));
    steps.forEach(s=>s.classList.remove('active'));
    const next = (cur+1) % steps.length;
    steps[next].classList.add('active');
  }
  function startStepCycle(){
    if (stepTimerId) clearInterval(stepTimerId);
    stepTimerId = setInterval(()=>{ if (!paused) cycleStep(); }, 900);
  }
  function startTabCycle(){
    if (tabTimerId) clearInterval(tabTimerId);
    tabTimerId = setInterval(()=>{
      if (paused) return;
      curTab = (curTab+1) % tabOrder.length;
      setActiveTab(tabOrder[curTab]);
    }, 4500);
  }
  tabs.forEach(t=>{
    t.addEventListener('click',()=>{
      paused = false;
      curTab = tabOrder.indexOf(t.dataset.path);
      setActiveTab(tabOrder[curTab]);
      startStepCycle();
    });
  });
  const pathPanel = document.querySelector('.path-panel');
  if (pathPanel){
    pathPanel.addEventListener('mouseenter',()=>{ paused = true; });
    pathPanel.addEventListener('mouseleave',()=>{ paused = false; });
  }
  setActiveTab(tabOrder[curTab]);
  startStepCycle();
  startTabCycle();
})();

/* ============ Path shapes 3D ============ */
function makePathShapes3D(){
  const wrap = document.getElementById('pathShapes3d');
  if (!wrap || !window.THREE) return;
  const W = () => wrap.clientWidth, H = () => wrap.clientHeight;
  if (!W() || !H()) return;
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(W(),H());
  renderer.setClearColor(0x000000,0);
  wrap.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, W()/H(), 0.1, 100);
  camera.position.set(0,0,9);
  scene.add(new THREE.AmbientLight(0xffffff,0.25));
  const keyLight = new THREE.DirectionalLight(0x2E8BFF,1.8);
  keyLight.position.set(3,5,6); scene.add(keyLight);
  const fillLight = new THREE.PointLight(0x0B5CFF,0.6,14);
  fillLight.position.set(-3,2,3); scene.add(fillLight);

  const mat = new THREE.MeshPhysicalMaterial({
    color:0x181824, metalness:0.55, roughness:0.35,
    emissive:0x0B5CFF, emissiveIntensity:0.06,
  });
  const matB = mat.clone(); matB.emissiveIntensity = 0.03;

  const card1 = new THREE.Mesh(new THREE.BoxGeometry(1.9,2.4,0.14),mat);
  card1.position.set(-1.4,-0.6,0);
  card1.rotation.set(0.18,-0.22,-0.32);
  scene.add(card1);

  const card2 = new THREE.Mesh(new THREE.BoxGeometry(1.5,1.8,0.12),matB);
  card2.position.set(0.6,-1.3,-0.8);
  card2.rotation.set(-0.1,0.18,0.2);
  scene.add(card2);

  const tetra = new THREE.Mesh(new THREE.TetrahedronGeometry(1.15,0),mat.clone());
  tetra.position.set(1.5,1.1,-0.5);
  tetra.rotation.set(0.4,0.5,0.2);
  scene.add(tetra);

  const ringGeo = new THREE.RingGeometry(0.7,0.78,40);
  const ringMat = new THREE.MeshBasicMaterial({color:0x0B5CFF,opacity:0.18,transparent:true,side:THREE.DoubleSide});
  const ring1 = new THREE.Mesh(ringGeo,ringMat); ring1.rotation.x = -Math.PI/2; ring1.position.set(-1.4,-2.0,0); scene.add(ring1);
  const ring2 = ring1.clone(); ring2.position.set(0.6,-2.4,-0.8); scene.add(ring2);
  const ring3 = ring1.clone(); ring3.position.set(1.5,-0.6,-0.5); scene.add(ring3);

  let t=0;
  (function loop(){
    t+=0.007;
    card1.position.y = -0.6 + Math.sin(t)*0.18;
    card1.rotation.z = -0.32 + Math.sin(t*0.7)*0.04;
    ring1.position.y = -2.0 + Math.sin(t)*0.18;
    card2.position.y = -1.3 + Math.sin(t*0.9+2)*0.13;
    ring2.position.y = -2.4 + Math.sin(t*0.9+2)*0.13;
    tetra.rotation.y += 0.008;
    tetra.position.y = 1.1 + Math.sin(t*1.2+1)*0.15;
    ring3.position.y = -0.6 + Math.sin(t*1.2+1)*0.15;
    renderer.render(scene,camera);
    requestAnimationFrame(loop);
  })();

  window.addEventListener('resize', ()=>{
    camera.aspect = W()/H(); camera.updateProjectionMatrix();
    renderer.setSize(W(),H());
  });
}

/* ============ Scroll-reveal animations (subtle, professional) ============ */
(function(){
  function tag(){
    document.querySelectorAll('section .eyebrow, section h2.sh, section .sh-sub, section .origin h2').forEach(el => el.classList.add('reveal'));
    [
      '.outcomes', '.pains', '.pricing', '.cases',
      '.resources', '.metric-row', '.stats-grid', '.deploy-pills',
      '.deep', '.dash-grid', '.calc-cards', '.honest-grid'
    ].forEach(sel => {
      document.querySelectorAll(sel).forEach(el => el.classList.add('reveal-stagger'));
    });
    [
      '.table-wrap', '.lat-wrap', '.path-demo', '.deploy', '.faq', '.news',
      '.pipe-wrap', '.globe-wrap', '.dash', '.calc', '.origin-body'
    ].forEach(sel => {
      document.querySelectorAll(sel).forEach(el => el.classList.add('reveal'));
    });
  }
  tag();
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => io.observe(el));
})();

/* ============ Hero 4.9 counter rollback (33 -> 4.9) ============ */
(function(){
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    const n = document.querySelector('.hero .big .num');
    if (n) n.textContent = '4.9';
    return;
  }
  const numEl = document.querySelector('.hero-kinetic .big .num');
  if (!numEl) return;
  let started = false;
  function animate(){
    if (started) return; started = true;
    const target = 4.9, start = 33.0;
    const dur = 1400;
    const t0 = performance.now();
    function step(now){
      const k = Math.min(1, (now - t0)/dur);
      // ease-out cubic
      const e = 1 - Math.pow(1 - k, 3);
      const v = start + (target - start) * e;
      numEl.textContent = v.toFixed(1);
      if (k < 1) requestAnimationFrame(step);
      else numEl.textContent = target.toFixed(1);
    }
    requestAnimationFrame(step);
  }
  // start shortly after load
  setTimeout(animate, 450);
})();

/* ============ Cost Calculator ============ */
(function(){
  const slider = document.getElementById('calcSlider');
  if (!slider) return;
  const opsEl = document.getElementById('calcOps');
  const ddbPrice = document.getElementById('ddbPrice');
  const vdbPrice = document.getElementById('vdbPrice');
  const ddbB = document.getElementById('ddbBreakdown');
  const vdbB = document.getElementById('vdbBreakdown');
  const savEl = document.getElementById('calcSavings');
  const multEl = document.getElementById('calcMultiplier');
  const DDB_PER_M = 1.00; // blended $/M ops
  function fmt(n){ return '$' + Math.round(n).toLocaleString(); }
  function tier(opsB){
    if (opsB <= 0.5) return { name:'Starter', base:499, capB:0.5 };
    if (opsB <= 5)   return { name:'Growth',  base:2490, capB:5 };
    return { name:'Enterprise', base:2490 + (opsB-5)*50, capB:opsB };
  }
  function vdbCost(opsB){
    if (opsB <= 0.5) return 499;
    if (opsB <= 5)   return 2490;
    return Math.round(2490 + (opsB-5) * 50); // $50 per extra billion
  }
  function update(){
    const v = +slider.value;
    const opsB = v;
    const opsM = opsB * 1000;
    const ddb = opsM * DDB_PER_M;
    const vdb = vdbCost(opsB);
    const savings = Math.max(0, ddb - vdb);
    const mult = ddb / Math.max(1, vdb);
    opsEl.textContent = opsB;
    ddbPrice.textContent = fmt(ddb);
    vdbPrice.textContent = fmt(vdb);
    ddbB.textContent = `$${DDB_PER_M.toFixed(2)} / M blended ops · ${opsB}B ops → ${fmt(ddb)}`;
    if (opsB <= 0.5) vdbB.textContent = 'Starter tier · single-region cluster';
    else if (opsB <= 5) vdbB.textContent = 'Growth tier · multi-region replication';
    else vdbB.textContent = `Growth $2,490 + ${(opsB-5).toFixed(0)}B overflow @ $50/B · same NVMe hardware`;
    if (savings > 0){
      savEl.textContent = fmt(savings);
      savEl.style.color = 'var(--good)';
      multEl.textContent = mult.toFixed(1) + '× cheaper';
    } else {
      savEl.textContent = fmt(-savings);
      savEl.style.color = 'var(--warm)';
      multEl.textContent = 'similar at this scale';
    }
    // fill colour on track
    const pct = ((v - +slider.min) / (+slider.max - +slider.min)) * 100;
    slider.style.backgroundSize = pct + '% 100%';
  }
  slider.addEventListener('input', update);
  update();
})();

/* ============ Dashboard chart + bars ============ */
(function(){
  const chart = document.getElementById('dashChart');
  const bars = document.getElementById('dashBars');
  if (!chart || !bars) return;
  const W=600, H=140, N=60;
  function rand(min,max){ return min + Math.random()*(max-min); }
  // three series: p50, p95, p99 (sub-5ms each)
  function series(base, jitter, spikes){
    return Array.from({length:N}, (_,i)=> base + Math.sin(i*0.3)*jitter*0.4 + rand(-jitter,jitter) + (spikes && Math.random()<0.05 ? rand(jitter,jitter*2) : 0));
  }
  function path(data, max){
    return data.map((v,i)=>{
      const x = (i/(N-1))*W;
      const y = H - Math.min(H, (v/max)*H*0.85) - 8;
      return (i===0?'M':'L')+x.toFixed(1)+' '+y.toFixed(1);
    }).join(' ');
  }
  const p50 = series(0.6, 0.15, false);
  const p95 = series(1.4, 0.35, false);
  const p99 = series(3.6, 0.6, true);
  const max = 6.5; // ms scale
  chart.innerHTML = `
    <defs>
      <linearGradient id="dashFill" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#0B5CFF" stop-opacity=".35"/>
        <stop offset="100%" stop-color="#0B5CFF" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <line x1="0" y1="${H-(5/max)*H*0.85-8}" x2="${W}" y2="${H-(5/max)*H*0.85-8}" stroke="rgba(255,255,255,.08)" stroke-dasharray="3 4"/>
    <text x="${W-4}" y="${H-(5/max)*H*0.85-12}" text-anchor="end" font-family="JetBrains Mono" font-size="9" fill="#5A5C66" letter-spacing=".08em">SLA 5MS</text>
    <path d="${path(p99, max)} L${W} ${H} L0 ${H} Z" fill="url(#dashFill)"/>
    <path d="${path(p99, max)}" fill="none" stroke="#0B5CFF" stroke-width="1.5"/>
    <path d="${path(p95, max)}" fill="none" stroke="#16B8E8" stroke-width="1.2" stroke-opacity=".7"/>
    <path d="${path(p50, max)}" fill="none" stroke="#46D391" stroke-width="1.2" stroke-opacity=".7"/>
  `;
  // bars: 32 shards visible, varied heights
  const heights = Array.from({length:32}, (_,i)=> 30 + Math.sin(i*0.5)*30 + Math.random()*30);
  bars.innerHTML = heights.map(h=>`<div class="b" style="height:0"></div>`).join('');
  // animate in when in viewport
  const io = new IntersectionObserver((ents)=>{
    ents.forEach(e=>{
      if (e.isIntersecting){
        bars.querySelectorAll('.b').forEach((b,i)=>{
          setTimeout(()=>{ b.style.height = heights[i] + '%'; }, i*20);
        });
        io.disconnect();
      }
    });
  }, {threshold:.3});
  io.observe(bars);
})();

/* ============ smooth scroll ============ */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const id = a.getAttribute('href');
    if (id.length>1){
      const t = document.querySelector(id);
      if (t){e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'})}
    }
  });
});

/* ============ Boot ============ */
(function boot(){
  // Respect prefers-reduced-motion: skip the ambient 3D scenes entirely.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function go(){ try{ makeHero3D(); }catch(e){ console.warn(e); } try{ makePipeline3D(); }catch(e){ console.warn(e); } try{ makeGlobe3D(); }catch(e){ console.warn(e); } try{ makePathShapes3D(); }catch(e){ console.warn(e); } }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else go();
})();

/* ============ R&D progress bars on viewport enter ============ */
(function(){
  const fills = document.querySelectorAll('.rd-prog-fill');
  const grid  = document.getElementById('rdGrid');
  if (!fills.length || !grid) return;
  let fired = false;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !fired) {
        fired = true;
        fills.forEach((f, i) => {
          setTimeout(() => { f.style.width = f.dataset.pct + '%'; }, i * 80);
        });
        io.disconnect();
      }
    });
  }, { threshold: 0.15 });
  io.observe(grid);
})();

/* ============ Reduced-motion helper ============ */
const vxReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============ Architect fit check ============ */
(function(){
  const box = document.getElementById('fitVerdict');
  const prog = document.getElementById('fitProgress');
  if (!box || !prog) return;
  const NAMES = ['q1','q2','q3','q4','q5'];

  function answers(){
    const a = {};
    NAMES.forEach(n => {
      const el = document.querySelector('input[name="'+n+'"]:checked');
      if (el) a[n] = el.value;
    });
    return a;
  }

  function verdict(a){
    // Honest disqualifiers first.
    if (a.q1 === 'fts')   return ['no','Wrong tool &mdash; and we mean it.',
      'VeltrixDB has no full-text or faceted search and never will. Use Elasticsearch/OpenSearch for search, and pair it with VeltrixDB only if you also have a point-lookup path.'];
    if (a.q1 === 'range') return ['no','A column store will serve you better.',
      'Range scans and analytical queries are exactly what LSM/columnar engines optimize for. VeltrixDB ships a basic RANGE scan, but if scans dominate, ClickHouse or a wide-column store is the honest recommendation.'];
    if (a.q2 === 'small') return ['no','Stay on Redis &mdash; seriously.',
      'Under ~50 GB your entire working set fits in RAM for a modest bill. VeltrixDB&rsquo;s economics only start winning when RAM pricing hurts. Come back at 10× the data.'];

    const notes = [];
    let level = 'yes';
    if (a.q3 === 'writep99'){ level = 'partial';
      notes.push('Sub-1ms durable writes conflict with our fsync-per-write group commit (~5&ndash;15 ms P50). If replication-based durability is acceptable (Q4), batched MultiPut gets close &mdash; pressure-test this in the demo.'); }
    if (a.q5 === 'zone'){
      notes.push('Zero-loss across a zone outage: start each node with --rack-id=&lt;zone&gt; and v1.1.0&rsquo;s rack-aware placement keeps every copy of a partition in a distinct zone &mdash; no manual pinning. It&rsquo;s new in this release, so rehearse the zone-failure drill before you rely on it.'); }
    if (a.q4 === 'fsync') notes.push('Every write fsynced: that&rsquo;s our default posture &mdash; group-commit WAL, durable before ACK.');
    if (a.q2 === 'huge') notes.push('>10 TB: bring 8 NVMe devices per node and read the NVMe provisioning guide &mdash; density is the whole point.');

    if (level === 'yes') return ['yes','Strong fit. Your workload is the design target.',
      'Point lookups, RAM-priced-out working set, read-latency SLA &mdash; this is exactly the shape VeltrixDB was built for. ' + notes.join(' ')];
    return ['partial','Fits with caveats &mdash; read these before the demo.', notes.join(' ')];
  }

  document.querySelectorAll('.fit input[type="radio"]').forEach(r => {
    r.addEventListener('change', () => {
      const a = answers();
      const n = Object.keys(a).length;
      prog.textContent = n + ' / 5 answered';
      if (n < NAMES.length){ box.className = 'fit-verdict'; box.innerHTML=''; return; }
      const [cls, title, body] = verdict(a);
      box.className = 'fit-verdict show fit-' + cls;
      box.innerHTML = '<div class="fv-title"><span class="fv-dot"></span>' + title + '</div>' +
        '<p>' + body + '</p>' +
        (cls === 'no'
          ? '<p><a href="redis-comparison.html">When each tool wins</a> &middot; <a href="faq.html">FAQ</a></p>'
          : '<p><a href="mailto:veltrixdb@gmail.com?subject=VeltrixDB%20Architecture%20Review">Book the architecture review</a> &middot; <a href="performance.html">See the measured numbers</a></p>');
    });
  });
})();

/* ============ Sticky subnav scrollspy ============ */
(function(){
  const nav = document.querySelector('.subnav');
  if (!nav || !('IntersectionObserver' in window)) return;
  const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
  const map = new Map();
  links.forEach(l => {
    const sec = document.getElementById(l.getAttribute('href').slice(1));
    if (sec) map.set(sec, l);
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting){
        links.forEach(l => l.classList.remove('current'));
        const link = map.get(e.target);
        if (link) link.classList.add('current');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  map.forEach((_, sec) => io.observe(sec));
})();

/* ============ Copy benchmark command ============ */
(function(){
  const btn = document.getElementById('copyRepro');
  const cmd = document.getElementById('reproCmd');
  if (!btn || !cmd) return;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(cmd.textContent);
      btn.textContent = 'Copied';
      setTimeout(() => { btn.textContent = 'Copy'; }, 1600);
    } catch (_) {
      const r = document.createRange(); r.selectNodeContents(cmd);
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
    }
  });
})();

/* ============ Latency chart / table toggle ============ */
(function(){
  const cBtn = document.getElementById('latChartBtn');
  const tBtn = document.getElementById('latTableBtn');
  const bars = document.getElementById('bars');
  const table = document.getElementById('latTable');
  if (!cBtn || !tBtn || !bars || !table) return;
  function set(mode){
    const isTable = mode === 'table';
    bars.classList.toggle('hidden', isTable);
    table.classList.toggle('show', isTable);
    cBtn.setAttribute('aria-pressed', String(!isTable));
    tBtn.setAttribute('aria-pressed', String(isTable));
  }
  cBtn.addEventListener('click', () => set('chart'));
  tBtn.addEventListener('click', () => set('table'));
})();

/* ============ Mobile menu ============ */
(function(){
  const btn = document.getElementById('navBurger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')){
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded','false');
    }
  });
})();

/* ============ Hero terminal — typed quickstart ============ */
(function(){
  const body = document.getElementById('termBody');
  if (!body) return;

  // The full session, rendered line by line.
  const SCRIPT = [
    {p:'$ ', text:'docker run -p 9000:9000 ghcr.io/veltrixdb/veltrixdb', cls:'cmd', type:true, pre:true},
    {p:'',   text:'[server] ready — plain: :9000  ·  94ms startup', cls:'out'},
    {p:'$ ', text:'printf "PUT hello world\\nGET hello\\n" | nc localhost 9000', cls:'cmd', type:true},
    {p:'',   text:'OK', cls:'ok'},
    {p:'',   text:'world', cls:'ok'},
    {p:'$ ', text:'', cls:'cmd', caret:true},
  ];

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function renderLine(item, instant){
    return new Promise(resolve => {
      let ln;
      if (item.pre){
        // The first command line already exists in markup (SEO/no-JS fallback).
        ln = body.querySelector('.ln');
        const span = ln.querySelector('.cmd');
        span.textContent = '';
        typeInto(span, item.text, instant).then(resolve);
        return;
      }
      ln = document.createElement('div');
      ln.className = 'ln';
      const p = document.createElement('span'); p.className = 'p'; p.textContent = item.p;
      const t = document.createElement('span'); t.className = item.cls;
      ln.appendChild(p); ln.appendChild(t);
      body.appendChild(ln);
      if (item.caret){
        const c = document.createElement('span'); c.className = 'caret'; c.setAttribute('aria-hidden','true');
        ln.appendChild(c);
        resolve(); return;
      }
      typeInto(t, item.text, instant || !item.type).then(resolve);
    });
  }

  function typeInto(el, text, instant){
    return new Promise(resolve => {
      if (instant){ el.textContent = text; resolve(); return; }
      let i = 0;
      (function tick(){
        el.textContent = text.slice(0, ++i);
        if (i < text.length) setTimeout(tick, 14 + Math.random()*22);
        else resolve();
      })();
    });
  }

  async function play(){
    for (const item of SCRIPT){
      await renderLine(item, reduced);
      if (!reduced && !item.type) await new Promise(r => setTimeout(r, 160));
    }
  }

  // Start when the terminal scrolls into view (or immediately if reduced motion).
  if (reduced || !('IntersectionObserver' in window)){ play(); return; }
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting){ io.disconnect(); play(); } });
  }, {threshold: .4});
  io.observe(body);
})();

/* ============ Hero terminal — copy quickstart ============ */
(function(){
  const btn = document.getElementById('termCopy');
  if (!btn) return;
  const CMDS = 'docker run -p 9000:9000 ghcr.io/veltrixdb/veltrixdb\nprintf "PUT hello world\\nGET hello\\n" | nc localhost 9000';
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(CMDS);
      btn.textContent = 'Copied';
      setTimeout(() => { btn.textContent = 'Copy'; }, 1600);
    } catch(_) {}
  });
})();
