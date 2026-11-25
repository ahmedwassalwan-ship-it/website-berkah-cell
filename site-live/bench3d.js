/* BERKAH CELL — meja service 3D (WebGL, prototipe Versi 3.8, pemilik 25 Nov 2026)
 * Dimuat hanya bila beranda dibuka dengan ?hero=3d. Laptop, iPhone, Android, dan karpet adalah
 * model 3D sungguhan (bentuk generik, tanpa logo merek) yang bisa diputar dengan geser/drag.
 * Berkahtron masih gambar 2D asli (badan + lengan) yang selalu menghadap kamera, karena belum ada
 * model 3D maskot. Tidak ada request luar: Three.js disimpan di vendor/three (lisensi MIT).
 * Hemat baterai: hanya merender saat animasi pembuka, saat diputar, dan sesaat sesudahnya. */
import * as THREE from './vendor/three/three.module.min.js';
import { RoundedBoxGeometry } from './vendor/three/RoundedBoxGeometry.js';
import { RoomEnvironment } from './vendor/three/RoomEnvironment.js';

const GOLD = '#D8B566';
const NAVY = '#0A1A33';
const FONT = '"Plus Jakarta Sans", "Segoe UI", Roboto, Arial, sans-serif';
const LOG = ['iPhone terhubung', 'Membaca perangkat…', 'Bypass iCloud…'];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const redraw = (...a) => { draw(c.getContext('2d'), w, h, ...a); tex.needsUpdate = true; };
  redraw();
  return { tex, redraw };
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }

// Layar laptop: tool bypass generik bergaya BERKAH CELL (tanpa nama software pihak lain)
function drawLaptop(g, w, h, s = { lines: 3, progress: 1, done: true }) {
  const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#0C1424'); bg.addColorStop(1, NAVY);
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  const gold = g.createLinearGradient(0, 0, w, 0); gold.addColorStop(0, '#F3DC9A'); gold.addColorStop(0.5, '#C9A54E'); gold.addColorStop(1, '#A07E2E');
  g.fillStyle = gold; rr(g, 24, 22, w - 48, 52, 8); g.fill();
  g.fillStyle = NAVY; g.font = `800 30px ${FONT}`; g.textBaseline = 'middle'; g.fillText('BERKAH CELL · Bypass Tool', 40, 49);
  g.font = `600 28px ${FONT}`;
  LOG.forEach((t, i) => {
    if (i >= s.lines) return;
    g.fillStyle = GOLD; g.fillText('▸', 30, 112 + i * 44); g.fillStyle = '#CFE0FF'; g.fillText(t, 58, 112 + i * 44);
  });
  g.fillStyle = 'rgba(255,255,255,.14)'; rr(g, 30, 248, w - 60, 14, 7); g.fill();
  if (s.progress > 0) { g.fillStyle = gold; rr(g, 30, 248, (w - 60) * s.progress, 14, 7); g.fill(); }
  if (s.done) { g.fillStyle = '#7BE0A1'; g.font = `800 30px ${FONT}`; g.fillText('✓ Selesai', 30, 296); }
}
// Layar iPhone: Dynamic Island, "hello" saat proses, ✓ saat selesai
function drawIphone(g, w, h, done = true) {
  const bg = g.createLinearGradient(0, 0, w, h); bg.addColorStop(0, '#F6F4EF'); bg.addColorStop(1, '#DCE3EF');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.fillStyle = '#111'; rr(g, w * 0.36, h * 0.03, w * 0.28, h * 0.035, h * 0.0175); g.fill();
  g.textAlign = 'center'; g.textBaseline = 'middle';
  if (done) { g.fillStyle = '#2EA66A'; g.font = `800 ${w * 0.42}px ${FONT}`; g.fillText('✓', w / 2, h / 2); }
  else { g.fillStyle = '#1F5FBF'; g.font = `italic 700 ${w * 0.2}px ${FONT}`; g.fillText('hello', w / 2, h / 2); }
}
function drawAndroid(g, w, h) {
  const bg = g.createLinearGradient(0, 0, w * 0.4, h); bg.addColorStop(0, '#4A8BEA'); bg.addColorStop(0.55, '#1F3F8F'); bg.addColorStop(1, '#122A60');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.fillStyle = '#05070B'; g.beginPath(); g.arc(w / 2, h * 0.045, w * 0.045, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,.9)'; g.font = `700 ${w * 0.2}px ${FONT}`; g.textAlign = 'center'; g.fillText('11:30', w / 2, h * 0.24);
  g.fillStyle = 'rgba(255,255,255,.28)';
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) { rr(g, w * (0.1 + c * 0.21), h * (0.66 + r * 0.13), w * 0.16, w * 0.16, w * 0.045); g.fill(); }
}
function drawMat(g, w, h) {
  const bg = g.createLinearGradient(0, 0, w, h); bg.addColorStop(0, '#163C72'); bg.addColorStop(1, '#0D244D');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(216,181,102,.09)'; g.lineWidth = 2;
  for (let x = 0; x <= w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y <= h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.strokeStyle = 'rgba(216,181,102,.75)'; g.lineWidth = 8; rr(g, 10, 10, w - 20, h - 20, 26); g.stroke();
}
function drawKeys(g, w, h) {
  g.fillStyle = '#2A3342'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#3B4558';
  for (let r = 0; r < 5; r++) for (let c = 0; c < 13; c++) { rr(g, 8 + c * ((w - 16) / 13), 8 + r * ((h - 16) / 5), (w - 16) / 13 - 5, (h - 16) / 5 - 5, 4); g.fill(); }
}
function tagSprite(text) {
  const { tex } = canvasTex(256, 96, (g, w, h) => {
    const gold = g.createLinearGradient(0, 0, w, 0); gold.addColorStop(0, '#F3DC9A'); gold.addColorStop(0.5, '#C9A54E'); gold.addColorStop(1, '#A07E2E');
    g.clearRect(0, 0, w, h); g.fillStyle = gold; rr(g, 6, 10, w - 12, h - 20, (h - 20) / 2); g.fill();
    g.fillStyle = NAVY; g.font = `800 44px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 2);
  });
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, toneMapped: false }));
  sp.scale.set(4.2, 1.575, 1); sp.renderOrder = 10;
  return sp;
}

export async function mount(host, opts) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const play = opts.play && !reduced;
  try { await document.fonts.load(`800 30px ${FONT}`); } catch (e) { /* font cadangan */ }

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement; canvas.className = 'bench3d-canvas';
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55;
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 200);
  const CAM_TARGET = new THREE.Vector3(0.6, 1.6, 1.4);

  scene.add(new THREE.HemisphereLight('#CFE0FF', '#0A1A33', 0.9));
  const key = new THREE.DirectionalLight('#FFF6E5', 2.2); key.position.set(9, 20, 12); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 6; key.shadow.bias = -0.0005;
  Object.assign(key.shadow.camera, { left: -22, right: 22, top: 16, bottom: -16, near: 1, far: 60 });
  scene.add(key);
  const rim = new THREE.DirectionalLight(GOLD, 1.2); rim.position.set(-14, 8, -14); scene.add(rim);

  const stage = new THREE.Group(); scene.add(stage);
  const disposables = [];
  const keep = (o) => { disposables.push(o); return o; };
  const std = (o) => keep(new THREE.MeshStandardMaterial(o));
  const mesh = (geo, mat, cast = true, recv = false) => { const m = new THREE.Mesh(keep(geo), mat); m.castShadow = cast; m.receiveShadow = recv; return m; };
  const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };

  // Karpet service
  const mat = mesh(new RoundedBoxGeometry(34, 0.6, 19, 3, 0.3), std({ color: '#0A1D40', roughness: 0.8 }), false, true);
  mat.position.y = -0.3; stage.add(mat);
  const matTop = canvasTex(1024, 576, drawMat);
  const matPlane = mesh(new THREE.PlaneGeometry(33.4, 18.4), std({ map: keep(matTop.tex), roughness: 0.75 }), false, true);
  matPlane.rotation.x = -Math.PI / 2; matPlane.position.y = 0.01; stage.add(matPlane);

  // Laptop (alas aluminium + layar berengsel)
  const alu = std({ color: '#C9CED6', metalness: 0.7, roughness: 0.32 });
  const laptop = new THREE.Group(); laptop.position.set(-9, 0, -2.6); laptop.rotation.y = 0.28; stage.add(laptop);
  const base = mesh(new RoundedBoxGeometry(12, 0.45, 8.2, 3, 0.2), alu); base.position.y = 0.23; laptop.add(base);
  const keys = canvasTex(512, 220, drawKeys);
  const kb = mesh(new THREE.PlaneGeometry(10.6, 4.3), std({ map: keep(keys.tex), roughness: 0.6 }), false);
  kb.rotation.x = -Math.PI / 2; kb.position.set(0, 0.465, -1.1); laptop.add(kb);
  const pad = mesh(new THREE.PlaneGeometry(4, 2.3), std({ color: '#B4BBC6', metalness: 0.6, roughness: 0.4 }), false);
  pad.rotation.x = -Math.PI / 2; pad.position.set(0, 0.462, 2.4); laptop.add(pad);
  const hinge = new THREE.Group(); hinge.position.set(0, 0.45, -4.0); hinge.rotation.x = -0.22; laptop.add(hinge);
  const lid = mesh(new RoundedBoxGeometry(12, 7.9, 0.32, 3, 0.16), alu); lid.position.set(0, 3.95, 0); hinge.add(lid);
  const bezel = mesh(new THREE.PlaneGeometry(11.7, 7.6), std({ color: '#121822', roughness: 0.4 }), false); bezel.position.set(0, 3.95, 0.165); hinge.add(bezel);
  const lapScreen = canvasTex(640, 400, drawLaptop);
  const scr = new THREE.Mesh(keep(new THREE.PlaneGeometry(11.0, 6.875)), keep(new THREE.MeshBasicMaterial({ map: lapScreen.tex, toneMapped: false })));
  scr.position.set(0, 3.95, 0.17); hinge.add(scr);
  const glow = new THREE.PointLight('#7FA8FF', 6, 14, 2); glow.position.set(0, 4, 2.5); hinge.add(glow);

  // iPhone berbaring di karpet (layar ke atas), tersambung kabel
  const iphone = new THREE.Group(); iphone.position.set(-0.6, 0, 4.6); iphone.rotation.y = -0.18; stage.add(iphone);
  const ipFrame = std({ color: '#8C96A6', metalness: 0.85, roughness: 0.25 });
  iphone.add(at(mesh(new RoundedBoxGeometry(3.7, 0.38, 7.6, 4, 0.18), ipFrame), 0, 0.19, 0));
  const ipScreen = canvasTex(256, 520, drawIphone);
  const ips = new THREE.Mesh(keep(new THREE.PlaneGeometry(3.4, 7.3)), keep(new THREE.MeshBasicMaterial({ map: ipScreen.tex, toneMapped: false })));
  ips.rotation.x = -Math.PI / 2; ips.position.y = 0.385; iphone.add(ips);
  const cableMat = std({ color: '#E6EAF0', roughness: 0.5, emissive: '#F3DC9A', emissiveIntensity: 0 });
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.2, 0.3, -1.2), new THREE.Vector3(0.5, 0.2, -0.4), new THREE.Vector3(3.0, 0.18, 3.6),
    new THREE.Vector3(2.0, 0.2, 8.8), new THREE.Vector3(-0.2, 0.2, 9.2), new THREE.Vector3(-0.4, 0.2, 8.45),
  ]);
  stage.add(mesh(new THREE.TubeGeometry(curve, 80, 0.13, 8), cableMat, true));

  // Android berdiri di dudukan
  const and = new THREE.Group(); and.position.set(12.4, 0, -1.6); and.rotation.y = -0.45; stage.add(and);
  const standMat = std({ color: '#AEB6C3', metalness: 0.6, roughness: 0.35 });
  and.add(at(mesh(new RoundedBoxGeometry(4.4, 0.5, 3.6, 3, 0.2), standMat), 0, 0.25, 0.4));
  const back = mesh(new RoundedBoxGeometry(3.4, 5.2, 0.35, 3, 0.15), standMat); back.position.set(0, 2.7, -0.7); back.rotation.x = -0.3; and.add(back);
  const phone = new THREE.Group(); phone.position.set(0, 0.85, 0.2); phone.rotation.x = -0.26; and.add(phone);
  phone.add(at(mesh(new RoundedBoxGeometry(3.8, 8.0, 0.42, 4, 0.2), std({ color: '#1A1E26', metalness: 0.5, roughness: 0.3 })), 0, 4.0, 0));
  const anScreen = canvasTex(256, 540, drawAndroid);
  const ans = new THREE.Mesh(keep(new THREE.PlaneGeometry(3.5, 7.7)), keep(new THREE.MeshBasicMaterial({ map: anScreen.tex, toneMapped: false })));
  ans.position.set(0, 4.0, 0.215); phone.add(ans);

  // Label jenis HP
  const tagIp = tagSprite('iPhone'); tagIp.position.set(-0.4, 1.4, 9.4); stage.add(tagIp);
  const tagAn = tagSprite('Android'); tagAn.position.set(12.4, 0.9, 1.9); stage.add(tagAn);

  // Berkahtron (gambar asli 2D): badan + lengan berputar di bahu, selalu menghadap kamera
  const loader = new THREE.TextureLoader();
  const loadTex = (u) => new Promise((ok, bad) => loader.load(u, (t) => { t.colorSpace = THREE.SRGBColorSpace; ok(keep(t)); }, undefined, bad));
  const [tBody, tArm] = await Promise.all([loadTex('assets/berkahtron-badan.webp'), loadTex('assets/berkahtron-lengan.webp')]);
  const BH = 8.6; const BW = BH * 359 / 439; const PX = (0.39 - 0.5) * BW; const PY = (0.5 - 0.574) * BH;
  const bt = new THREE.Group(); bt.position.set(5.6, 0, 0.8); stage.add(bt);
  const lean = new THREE.Group(); bt.add(lean);
  const spriteMat = (map) => keep(new THREE.MeshBasicMaterial({ map, transparent: true, alphaTest: 0.4, toneMapped: false, side: THREE.DoubleSide }));
  const depthMat = (map) => keep(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map, alphaTest: 0.4 }));
  const body = new THREE.Mesh(keep(new THREE.PlaneGeometry(BW, BH)), spriteMat(tBody)); body.position.y = BH / 2; body.castShadow = true; body.customDepthMaterial = depthMat(tBody); lean.add(body);
  const shoulder = new THREE.Group(); shoulder.position.set(PX, BH / 2 + PY, 0.02); lean.add(shoulder);
  const arm = new THREE.Mesh(keep(new THREE.PlaneGeometry(BW, BH)), spriteMat(tArm)); arm.position.set(-PX, -PY, 0); arm.castShadow = true; arm.customDepthMaterial = depthMat(tArm); shoulder.add(arm);

  // ===== Keadaan adegan pada waktu t (detik). t >= 4.4 = selesai.
  const ARM_END = 80 * Math.PI / 180; // lengan "silakan", searah jarum jam di layar = rotasi z positif
  let lastLap = '';
  function pose(t) {
    // lambaian 0,4–1,2 dtk, lalu mempersilakan 3,3–4,0 dtk
    const wave = t > 0.4 && t < 1.2 ? Math.sin(seg(t, 0.4, 1.2) * Math.PI * 4) * 0.28 * Math.sin(seg(t, 0.4, 1.2) * Math.PI) : 0;
    shoulder.rotation.z = -wave + ease(seg(t, 3.3, 4.0)) * ARM_END;
    lean.rotation.z = ease(seg(t, 3.3, 4.0)) * 0.07;
    // kabel menyala 0,5–3,3 dtk
    cableMat.emissiveIntensity = (seg(t, 0.5, 0.9) - seg(t, 3.0, 3.4)) * 1.6;
    // log laptop, progress 0,9–3,0 dtk, selesai 3,0 dtk
    const s = { lines: (t >= 0.9) + (t >= 1.4) + (t >= 1.9), progress: ease(seg(t, 0.9, 3.0)), done: t >= 3.0 };
    const keyS = s.lines + '|' + s.progress.toFixed(2) + '|' + s.done;
    if (keyS !== lastLap) { lastLap = keyS; lapScreen.redraw(s); }
    if ((t >= 3.0) !== ipDone) { ipDone = t >= 3.0; ipScreen.redraw(ipDone); }
  }
  let ipDone = true;

  // ===== Kamera, ukuran, dan putaran (drag/geser)
  let camDist = 52;
  let yaw = play ? 0.55 : 0; let pitch = 0; let vYaw = 0; let dragging = false; let touched = false;
  const YAW_MAX = 0.95; const PITCH_MIN = -0.18; const PITCH_MAX = 0.32;
  function place() {
    const r = camDist; const el = 0.52 + pitch;
    camera.position.set(Math.sin(yaw) * Math.cos(el) * r + CAM_TARGET.x, Math.sin(el) * r + CAM_TARGET.y, Math.cos(yaw) * Math.cos(el) * r + CAM_TARGET.z);
    camera.lookAt(CAM_TARGET);
    bt.rotation.y = yaw; // Berkahtron selalu menghadap kamera (billboard sumbu Y)
  }
  function resize() {
    const w = host.clientWidth; const h = host.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = 30; camera.updateProjectionMatrix();
    // Jarak kamera agar karpet (34 × 19) selalu mengisi bingkai, apa pun ukuran layarnya
    const tv = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    camDist = Math.max(12.5 / tv, 19.5 / (tv * camera.aspect));
  }

  let raf = 0; let t0 = performance.now(); let introDone = !play; let lastInput = 0;
  function frame(now) {
    raf = 0;
    if (!introDone) {
      const t = (now - t0) / 1000;
      pose(t); if (!touched) yaw = 0.55 * (1 - ease(seg(t, 0, 1.6))); // kamera berputar masuk (juga di HP lambat)
      if (t >= 4.4) { introDone = true; pose(99); host.dataset.state = 'done'; }
    }
    if (!dragging && Math.abs(vYaw) > 0.0005) { yaw = clamp(yaw + vYaw, -YAW_MAX, YAW_MAX); vYaw *= 0.92; }
    place(); renderer.render(scene, camera);
    if (!introDone || dragging || Math.abs(vYaw) > 0.0005 || now - lastInput < 300) request();
  }
  const request = () => { if (!raf && !host.hidden) raf = requestAnimationFrame(frame); };

  // Geser horizontal memutar adegan. Geser vertikal di HP tetap menggulir halaman (touch-action: pan-y).
  let px = 0; let py = 0; let lastX = 0; let pid = null;
  canvas.addEventListener('pointerdown', (e) => { pid = e.pointerId; dragging = true; px = lastX = e.clientX; py = e.clientY; vYaw = 0; host.classList.add('dragging'); host.dataset.touched = '1'; touched = true; });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging || e.pointerId !== pid) return;
    const dx = e.clientX - lastX; lastX = e.clientX;
    yaw = clamp(yaw - dx * 0.008, -YAW_MAX, YAW_MAX); vYaw = -dx * 0.008;
    if (e.pointerType === 'mouse') { pitch = clamp(pitch + (e.clientY - py) * 0.004, PITCH_MIN, PITCH_MAX); py = e.clientY; }
    lastInput = performance.now(); request();
  });
  const end = () => { dragging = false; pid = null; host.classList.remove('dragging'); lastInput = performance.now(); request(); };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end); canvas.addEventListener('pointerleave', (e) => e.pointerType === 'mouse' && end());

  const ro = new ResizeObserver(() => { resize(); request(); }); ro.observe(host);
  resize(); pose(play ? 0 : 99); if (!play) host.dataset.state = 'done';
  place(); renderer.render(scene, camera);
  host.classList.add('ready');
  t0 = performance.now(); request();

  // Untuk uji otomatis: sudut putar saat ini, dan lompat ke detik t animasi (browser uji tanpa GPU lambat)
  Object.defineProperty(host, 'benchYaw', { get: () => yaw, configurable: true });
  host.benchView = (v) => { yaw = clamp(v, -YAW_MAX, YAW_MAX); place(); renderer.render(scene, camera); };
  host.benchSeek = (t) => { introDone = true; pose(t); if (t < 1.6) yaw = 0.55 * (1 - ease(seg(t, 0, 1.6))); place(); renderer.render(scene, camera); };

  return function dispose() {
    if (raf) cancelAnimationFrame(raf);
    ro.disconnect();
    disposables.forEach((d) => d.dispose && d.dispose());
    scene.environment && scene.environment.dispose(); pmrem.dispose();
    renderer.dispose(); renderer.forceContextLoss && renderer.forceContextLoss();
    canvas.remove();
  };
}
