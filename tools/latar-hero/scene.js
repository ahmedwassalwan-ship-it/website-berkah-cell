import * as THREE from './vendor/three/three.module.min.js';
import { RoundedBoxGeometry } from './vendor/three/RoundedBoxGeometry.js';
import { RoomEnvironment } from './vendor/three/RoomEnvironment.js';
const FONT = '"Segoe UI", Roboto, Arial, sans-serif';
function tex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function drawLaptop(g, w, h) {
  const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#0C1424'); bg.addColorStop(1, '#0A1A33'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  const gold = g.createLinearGradient(0, 0, w, 0); gold.addColorStop(0, '#F3DC9A'); gold.addColorStop(.5, '#C9A54E'); gold.addColorStop(1, '#A07E2E');
  g.fillStyle = gold; rr(g, 28, 26, w - 56, 58, 9); g.fill();
  g.fillStyle = '#0A1A33'; g.font = `800 32px ${FONT}`; g.textBaseline = 'middle'; g.fillText('BERKAH CELL · Bypass Tool', 46, 56);
  g.font = `600 29px ${FONT}`;
  ['Perangkat terhubung: iPhone', 'Membaca perangkat…', 'Bypass iCloud…'].forEach((t, i) => { g.fillStyle = '#D8B566'; g.fillText('▸', 34, 128 + i * 48); g.fillStyle = '#CFE0FF'; g.fillText(t, 64, 128 + i * 48); });
  g.fillStyle = 'rgba(255,255,255,.14)'; rr(g, 34, 282, w - 68, 16, 8); g.fill(); g.fillStyle = gold; rr(g, 34, 282, (w - 68) * 0.78, 16, 8); g.fill();
  g.fillStyle = '#CFE0FF'; g.font = `700 26px ${FONT}`; g.fillText('78%', w - 100, 326);
  g.fillStyle = 'rgba(123,224,161,.9)'; g.font = `600 24px ${FONT}`; g.fillText('● Proses berjalan', 34, 326);
}
function drawKeys(g, w, h) { g.fillStyle = '#2A3342'; g.fillRect(0, 0, w, h); g.fillStyle = '#3B4558'; for (let r = 0; r < 5; r++) for (let c = 0; c < 13; c++) { rr(g, 8 + c * ((w - 16) / 13), 8 + r * ((h - 16) / 5), (w - 16) / 13 - 5, (h - 16) / 5 - 5, 4); g.fill(); } }
// Kaca belakang doff Deep Purple
function drawBack(g, w, h) { const bg = g.createLinearGradient(0, 0, w, h); bg.addColorStop(0, '#6A5D78'); bg.addColorStop(.55, '#4E4459'); bg.addColorStop(1, '#3A3243'); g.fillStyle = bg; g.fillRect(0, 0, w, h); const sh = g.createLinearGradient(0, 0, w * .8, h * .5); sh.addColorStop(0, 'rgba(255,255,255,.14)'); sh.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sh; g.fillRect(0, 0, w, h); }
export function render(canvas, opts) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(opts.w, opts.h, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(); const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.5;
  scene.add(new THREE.HemisphereLight('#AFC6F0', '#0A1A33', 0.5));
  const key = new THREE.DirectionalLight('#FFF1DC', 1.8); key.position.set(10, 18, 14); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 8;
  Object.assign(key.shadow.camera, { left: -25, right: 25, top: 20, bottom: -20 }); scene.add(key);
  const rim = new THREE.DirectionalLight('#D8B566', 2.2); rim.position.set(-16, 9, -12); scene.add(rim);
  const rim2 = new THREE.DirectionalLight('#9C86C9', 1.4); rim2.position.set(18, 6, -10); scene.add(rim2);
  scene.fog = new THREE.Fog('#0A1A33', 40, 85);
  const std = (o) => new THREE.MeshStandardMaterial(o); const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };
  const M = (g, m, cast = true, recv = false) => { const o = new THREE.Mesh(g, m); o.castShadow = cast; o.receiveShadow = recv; return o; };
  // meja gelap
  const desk = M(new THREE.PlaneGeometry(200, 120), new THREE.ShadowMaterial({ opacity: .45 }), false, true); // hanya bayangan, latar tetap transparan desk.rotation.x = -Math.PI / 2; scene.add(desk);
  // laptop
  const alu = std({ color: '#B9C0CB', metalness: .75, roughness: .3 });
  const lap = new THREE.Group(); lap.position.set(-6.5, 0, -3); lap.rotation.y = 0.32; scene.add(lap);
  lap.add(at(M(new RoundedBoxGeometry(16, .55, 11, 3, .25), alu), 0, .28, 0));
  const kb = M(new THREE.PlaneGeometry(14, 5.6), std({ map: tex(512, 220, drawKeys), roughness: .6 }), false); kb.rotation.x = -Math.PI / 2; kb.position.set(0, .565, -1.5); lap.add(kb);
  const hinge = new THREE.Group(); hinge.position.set(0, .55, -5.4); hinge.rotation.x = -0.2; lap.add(hinge);
  hinge.add(at(M(new RoundedBoxGeometry(16, 10.4, .38, 3, .18), alu), 0, 5.2, 0));
  hinge.add(at(M(new THREE.PlaneGeometry(15.6, 10.0), std({ color: '#10161F', roughness: .4 }), false), 0, 5.2, .195));
  hinge.add(at(new THREE.Mesh(new THREE.PlaneGeometry(14.6, 9.125), new THREE.MeshBasicMaterial({ map: tex(704, 440, drawLaptop), toneMapped: false })), 0, 5.25, .2));
  const glow = new THREE.PointLight('#7FA8FF', 40, 26, 2); glow.position.set(0, 5, 4); hinge.add(glow);
  // iPhone 14 Pro Max Deep Purple, berdiri miring memperlihatkan punggung + modul kamera (tanpa logo)
  const ip = new THREE.Group(); ip.position.set(opts.ipX ?? 7, 0, opts.ipZ ?? 2.5); ip.rotation.set(0, Math.PI + (opts.ipRot ?? 0.62), 0); ip.scale.setScalar(opts.ipScale ?? 0.66); scene.add(ip);
  const tilt = new THREE.Group(); tilt.rotation.x = 0.16; ip.add(tilt);
  const frame = new THREE.MeshPhysicalMaterial({ color: '#3E3548', metalness: .95, roughness: .18, clearcoat: 1 });
  tilt.add(at(M(new RoundedBoxGeometry(7.8, 16, .8, 6, .38), frame), 0, 8.1, 0));
  const back = M(new THREE.PlaneGeometry(7.5, 15.7), new THREE.MeshPhysicalMaterial({ map: tex(400, 820, drawBack), roughness: .55, clearcoat: .4, clearcoatRoughness: .5 }), false);
  back.rotation.y = Math.PI; back.position.set(0, 8.1, -.405); tilt.add(back);
  // layar depan gelap (tidak terlihat dari sudut ini, menutup sisi depan)
  const cam = new THREE.Group(); cam.position.set(1.65, 13.6, -.42); cam.rotation.y = Math.PI; tilt.add(cam);
  cam.add(at(M(new RoundedBoxGeometry(3.6, 3.6, .3, 4, .7), new THREE.MeshPhysicalMaterial({ color: '#57496A', roughness: .2, clearcoat: 1 })), 0, 0, .1));
  const ring = new THREE.MeshPhysicalMaterial({ color: '#463B52', metalness: .9, roughness: .15 });
  const lens = new THREE.MeshPhysicalMaterial({ color: '#04060A', roughness: .03, metalness: .2, clearcoat: 1, iridescence: .7 });
  [[-0.82, 0.82], [-0.82, -0.82], [0.85, 0]].forEach(([x, y]) => {
    const r1 = M(new THREE.CylinderGeometry(.82, .86, .5, 40), ring); r1.rotation.x = Math.PI / 2; r1.position.set(x, y, .45); cam.add(r1);
    const l1 = M(new THREE.CylinderGeometry(.6, .6, .1, 40), lens, false); l1.rotation.x = Math.PI / 2; l1.position.set(x, y, .72); cam.add(l1);
    const l2 = M(new THREE.CylinderGeometry(.22, .22, .02, 24), std({ color: '#1A2238', metalness: .5, roughness: .1 }), false); l2.rotation.x = Math.PI / 2; l2.position.set(x, y, .78); cam.add(l2);
  });
  const fl = M(new THREE.CylinderGeometry(.28, .28, .08, 24), std({ color: '#FFF3C9', emissive: '#FFE7A0', emissiveIntensity: .25 }), false); fl.rotation.x = Math.PI / 2; fl.position.set(.95, 1.15, .32); cam.add(fl);
  const ld = M(new THREE.CylinderGeometry(.25, .25, .08, 24), std({ color: '#0B0D12', roughness: .2 }), false); ld.rotation.x = Math.PI / 2; ld.position.set(.95, -1.15, .32); cam.add(ld);
  // kabel USB dari laptop ke port bawah iPhone
  const ipBase = new THREE.Vector3(); ip.updateMatrixWorld(true); ip.localToWorld(ipBase.set(0, 0.15, 0));
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(1.4, .25, -1.2), new THREE.Vector3(3.2, .2, 2.2), new THREE.Vector3(ipBase.x - 1.2, .2, ipBase.z + 2.6), new THREE.Vector3(ipBase.x, .25, ipBase.z + .2)]);
  scene.add(M(new THREE.TubeGeometry(curve, 80, .14, 10), new THREE.MeshPhysicalMaterial({ color: '#E8ECF2', roughness: .45, clearcoat: .6 })));
  // kamera
  const camera = new THREE.PerspectiveCamera(opts.fov || 32, opts.w / opts.h, .1, 300);
  camera.position.set(...opts.cam); camera.lookAt(...opts.target);
  if (opts.shift) camera.setViewOffset(opts.w, opts.h, -opts.shift[0] * opts.w, -opts.shift[1] * opts.h, opts.w, opts.h);
  renderer.render(scene, camera);
  return canvas.toDataURL('image/png');
}
