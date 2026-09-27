// Studio-Szene für Platzhalter-Produktbilder: Glasflakon mit Flüssigkeit auf Hohlkehle.
// Wird von scripts/render-bottles.ts in Headless-Chromium ausgeführt.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const PAPER = new THREE.Color("#efede7");

function makeRenderer(width, height) {
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, alpha: false });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  return renderer;
}

/** Hohlkehle: Boden geht in einer Viertelkreis-Kurve in die Rückwand über. */
function cyclorama(color, { width = 40, floorDepth = 14, radius = 6, wallHeight = 24 } = {}) {
  const segsU = 2;
  const profile = [];
  const floorSteps = 12;
  for (let i = 0; i <= floorSteps; i++) profile.push([floorDepth - (floorDepth * i) / floorSteps, 0]);
  const arcSteps = 32;
  for (let i = 1; i <= arcSteps; i++) {
    const a = (i / arcSteps) * (Math.PI / 2);
    profile.push([-Math.sin(a) * radius, radius - Math.cos(a) * radius]);
  }
  const wallSteps = 8;
  for (let i = 1; i <= wallSteps; i++) profile.push([-radius, radius + (wallHeight * i) / wallSteps]);

  const positions = [];
  const indices = [];
  for (let v = 0; v < profile.length; v++) {
    for (let u = 0; u <= segsU; u++) {
      const x = -width / 2 + (width * u) / segsU;
      positions.push(x, profile[v][1], profile[v][0]);
    }
  }
  const row = segsU + 1;
  for (let v = 0; v < profile.length - 1; v++) {
    for (let u = 0; u < segsU; u++) {
      const a = v * row + u;
      const b = a + 1;
      const c = a + row;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  return mesh;
}

/** Weicher Kontaktschatten als radiale Textur. */
function contactShadow(width, depth, opacity = 0.55) {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, `rgba(30,28,24,${opacity})`);
  g.addColorStop(0.45, `rgba(30,28,24,${opacity * 0.45})`);
  g.addColorStop(1, "rgba(30,28,24,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.003;
  return mesh;
}

/** Unbeleuchtete Rückwand mit weichem Lichtverlauf (Studio-Hintergrund). */
function backdrop(color, width = 60, height = 34) {
  const size = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const base = new THREE.Color(color);
  const light = base.clone().lerp(new THREE.Color("#ffffff"), 0.38);
  const dark = base.clone().multiplyScalar(0.8);
  const g = ctx.createRadialGradient(size * 0.36, size * 0.42, size * 0.02, size * 0.42, size * 0.46, size * 0.62);
  g.addColorStop(0, `#${light.getHexString()}`);
  g.addColorStop(0.55, `#${base.getHexString()}`);
  g.addColorStop(1, `#${dark.getHexString()}`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  return mesh;
}

/** Langer, weicher Schlagschatten in Lichtrichtung (Glas wirft keinen harten Schatten). */
function castShadowPlane(width, depth, opacity = 0.22) {
  const w = 512, h = 128;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, `rgba(40,34,26,${opacity})`);
  g.addColorStop(0.55, `rgba(40,34,26,${opacity * 0.35})`);
  g.addColorStop(1, "rgba(40,34,26,0)");
  ctx.fillStyle = g;
  ctx.filter = "blur(10px)";
  ctx.fillRect(10, 26, w - 20, h - 52);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), mat);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

function latheBody(profilePts, segments = 96) {
  return new THREE.LatheGeometry(profilePts.map(([x, y]) => new THREE.Vector2(x, y)), segments);
}

/** Flaschenkörper je Form. Liefert Außenhülle, Flüssigkeit und Maße. */
function bodyGeometries(shape) {
  switch (shape) {
    case "square":
      return { outer: new RoundedBoxGeometry(2.3, 2.3, 1.5, 6, 0.22), inner: new RoundedBoxGeometry(1.95, 1.62, 1.18, 6, 0.16), height: 2.3, width: 2.3, depth: 1.5, base: 0.28, fill: 0.82 };
    case "flask":
      return { outer: new RoundedBoxGeometry(2.2, 2.6, 1.0, 8, 0.48), inner: new RoundedBoxGeometry(1.86, 1.95, 0.72, 8, 0.34), height: 2.6, width: 2.2, depth: 1.0, base: 0.26, fill: 0.8 };
    case "stepped":
      return { outer: new RoundedBoxGeometry(1.9, 2.5, 1.9, 6, 0.08), inner: new RoundedBoxGeometry(1.56, 1.9, 1.56, 6, 0.06), height: 2.5, width: 1.9, depth: 1.9, base: 0.36, fill: 0.84 };
    case "cylinder": {
      const r = 0.9, h = 2.8;
      const outer = latheBody([[0, 0], [r - 0.05, 0], [r, 0.05], [r, h - 0.05], [r - 0.05, h], [0.3, h], [0, h]]);
      const inner = latheBody([[0, 0], [r - 0.16, 0], [r - 0.14, 0.03], [r - 0.14, h * 0.7], [0, h * 0.7]]);
      return { outer, inner, height: h, width: r * 2, depth: r * 2, base: 0.3, innerOffset: 0.16, fill: 1, lathe: true, liquidTop: 0.15 + h * 0.7 };
    }
    case "round": {
      const pts = [[0, 0]];
      const R = 1.25;
      for (let i = 0; i <= 24; i++) {
        const a = -Math.PI / 2 + (i / 24) * Math.PI;
        pts.push([Math.max(0.001, Math.cos(a) * R), R + Math.sin(a) * R]);
      }
      pts.push([0, 2 * R]);
      const outer = latheBody(pts.map(([x, y], i) => (i === 1 ? [0.55, 0] : [x, y])));
      const innerPts = [];
      const Ri = 1.05;
      const fillTop = 1.55; // Füllhöhe über dem Boden der Innenkugel
      for (let i = 0; i <= 40; i++) {
        const a = -Math.PI / 2 + (i / 40) * Math.PI;
        const y = Ri + Math.sin(a) * Ri;
        if (y > fillTop) break;
        innerPts.push([Math.max(0.001, Math.cos(a) * Ri), y]);
      }
      const lastY = innerPts[innerPts.length - 1][1];
      innerPts.push([0, lastY]);
      return { outer, inner: latheBody(innerPts), height: 2 * R, width: 2 * R, depth: 2 * R * 0.5, flatten: 0.5, base: 0.2, innerOffset: 0.2, fill: 1, lathe: true, liquidTop: lastY + 0.1 };
    }
    case "tall-rect":
    default:
      return { outer: new RoundedBoxGeometry(1.8, 3.0, 1.2, 6, 0.12), inner: new RoundedBoxGeometry(1.5, 2.25, 0.92, 6, 0.09), height: 3.0, width: 1.8, depth: 1.2, base: 0.34, fill: 0.84 };
  }
}

function capMaterial(style) {
  switch (style) {
    case "gold":
      return new THREE.MeshPhysicalMaterial({ color: "#c7a15a", metalness: 1, roughness: 0.24, clearcoat: 0.4 });
    case "silver":
      return new THREE.MeshPhysicalMaterial({ color: "#d4d7da", metalness: 1, roughness: 0.2, clearcoat: 0.3 });
    case "wood":
      return new THREE.MeshPhysicalMaterial({ color: "#7b5a3c", metalness: 0, roughness: 0.62, clearcoat: 0.15 });
    case "white":
      return new THREE.MeshPhysicalMaterial({ color: "#f2f0ea", metalness: 0, roughness: 0.38, clearcoat: 0.6 });
    case "glass":
      return new THREE.MeshPhysicalMaterial({ color: "#ffffff", transmission: 1, thickness: 0.8, roughness: 0.04, ior: 1.5, metalness: 0 });
    case "black":
    default:
      return new THREE.MeshPhysicalMaterial({ color: "#161616", metalness: 0.1, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12 });
  }
}

function buildBottle(spec) {
  const group = new THREE.Group();
  const g = bodyGeometries(spec.shape);
  const glassTint = new THREE.Color(spec.glass || "#f4f7f7");

  const glass = new THREE.MeshPhysicalMaterial({
    color: glassTint,
    metalness: 0,
    roughness: 0.02,
    transmission: 1,
    thickness: 1.6,
    ior: 1.52,
    dispersion: 0.15,
    specularIntensity: 1,
    envMapIntensity: 1.4,
    attenuationColor: new THREE.Color(glassTint).multiplyScalar(0.82),
    attenuationDistance: 2.4,
  });
  const outer = new THREE.Mesh(g.outer, glass);
  outer.castShadow = false;
  if (!g.lathe) outer.position.y = g.height / 2;
  if (g.flatten) outer.scale.z = g.flatten;
  group.add(outer);

  const liquidColor = new THREE.Color(spec.liquid);
  // Opak gerendert, damit das Glas die Flüssigkeit bricht (three.js zeigt Transmission hinter
  // Transmission nicht). Verlauf + leichter Eigenglanz wirken wie durchleuchtete Flüssigkeit.
  const liquid = new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    map: liquidTexture(liquidColor),
    emissive: liquidColor.clone().multiplyScalar(0.18),
    metalness: 0,
    roughness: 0.18,
    clearcoat: 0.6,
    clearcoatRoughness: 0.1,
  });
  const inner = new THREE.Mesh(g.inner, liquid);
  if (!g.lathe) {
    const innerH = g.inner.parameters.height;
    inner.position.y = g.base + innerH / 2;
  } else {
    inner.position.y = g.innerOffset ?? g.base * 0.5;
  }
  if (g.flatten) inner.scale.z = g.flatten;
  group.add(inner);

  // Steigrohr (halbtransparent, liegt im Glas)
  const tubeTop = g.height + 0.05;
  const tubeBottom = g.base + 0.08;
  const tube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, tubeTop - tubeBottom, 16),
    new THREE.MeshStandardMaterial({ color: "#f4f4f2", roughness: 0.3, transparent: true, opacity: 0.45 }),
  );
  tube.position.y = (tubeTop + tubeBottom) / 2;
  group.add(tube);

  // Hals + Kragen
  const collarMat = spec.cap === "gold" || spec.cap === "silver" ? capMaterial(spec.cap) : capMaterial("silver");
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.22, 48), collarMat);
  neck.position.y = g.height + 0.11;
  group.add(neck);

  // Kappe
  const capMat = capMaterial(spec.cap);
  let cap;
  if (spec.shape === "cylinder" || spec.shape === "round") {
    cap = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.95, 64), capMat);
    cap.position.y = g.height + 0.22 + 0.475;
  } else if (spec.shape === "stepped") {
    cap = new THREE.Mesh(new RoundedBoxGeometry(1.0, 0.9, 1.0, 4, 0.05), capMat);
    cap.position.y = g.height + 0.22 + 0.45;
  } else if (spec.shape === "flask") {
    cap = new THREE.Mesh(new THREE.SphereGeometry(0.5, 64, 48), capMat);
    cap.scale.set(1, 0.9, 1);
    cap.position.y = g.height + 0.22 + 0.42;
  } else {
    const w = Math.min(g.width * 0.62, 1.2);
    cap = new THREE.Mesh(new RoundedBoxGeometry(w, 0.8, Math.min(g.depth * 0.8, w), 4, 0.06), capMat);
    cap.position.y = g.height + 0.22 + 0.4;
  }
  cap.castShadow = true;
  group.add(cap);

  const totalHeight = cap.position.y + 0.5;
  return { group, totalHeight, width: g.width, depth: g.depth, bodyHeight: g.height };
}

function studioLights(scene, { warm = false, keyFrom = [-6, 10, 7] } = {}) {
  if (warm) {
    // Lichtpool auf der Rückwand hinter der Szene (klassisches Stillleben-Licht).
    const pool = new THREE.SpotLight(0xfff0dc, 90, 40, 0.42, 1, 1.6);
    pool.position.set(-3, 9, 10);
    pool.target.position.set(1.2, 4.2, -6);
    scene.add(pool);
    scene.add(pool.target);
  }
  const hemi = new THREE.HemisphereLight(0xffffff, 0xe8e4dc, warm ? 0.32 : 0.7);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(warm ? 0xfff1df : 0xffffff, warm ? 2.6 : 1.7);
  key.position.set(...keyFrom);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -8;
  key.shadow.camera.right = 8;
  key.shadow.camera.top = 8;
  key.shadow.camera.bottom = -8;
  key.shadow.radius = warm ? 6 : 14;
  key.shadow.blurSamples = 20;
  key.shadow.bias = -0.0004;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 1.1);
  rim.position.set(7, 5, -6);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, warm ? 0.12 : 0.35);
  fill.position.set(6, 3, 8);
  scene.add(fill);
}

/**
 * Studio-Umgebung wie bei Glasfotografie: heller Raum, zwei hohe Striplights für Glanzkanten,
 * zwei schwarze Abschatter für dunkle, definierte Glaskonturen, Deckenlicht.
 */
function studioEnvironment() {
  const env = new THREE.Scene();
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(30, 20, 30),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0.78, 0.77, 0.75), side: THREE.BackSide }),
  );
  room.position.y = 8;
  env.add(room);
  const panel = (w, h, intensity, x, y, z, ry = 0, dark = false) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: dark ? new THREE.Color(0.02, 0.02, 0.02) : new THREE.Color().setScalar(intensity), side: THREE.DoubleSide }),
    );
    m.position.set(x, y, z);
    m.rotation.y = ry;
    env.add(m);
  };
  panel(2.2, 14, 9, -5.5, 5, 3.5, Math.PI / 3);
  panel(2.2, 14, 7, 5.5, 5, 3.5, -Math.PI / 3);
  panel(3.5, 14, 0, -9, 5, -1, Math.PI / 2, true);
  panel(3.5, 14, 0, 9, 5, -1, -Math.PI / 2, true);
  const top = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(4) }));
  top.rotation.x = Math.PI / 2;
  top.position.y = 9.5;
  env.add(top);
  return env;
}

function environment(renderer, scene) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studioEnvironment(), 0.02).texture;
  scene.environmentIntensity = 1.0;
}

function liquidTexture(color) {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 256;
  const ctx = c.getContext("2d");
  const base = new THREE.Color(color);
  const light = base.clone().lerp(new THREE.Color("#ffffff"), 0.42);
  const deep = base.clone().multiplyScalar(0.78);
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, `#${light.getHexString()}`);
  g.addColorStop(0.45, `#${base.getHexString()}`);
  g.addColorStop(1, `#${deep.getHexString()}`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = true;
  return tex;
}

function stoneTexture(color) {
  const size = 512;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  const img = ctx.getImageData(0, 0, size, size);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (rnd() - 0.5) * 14;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  // feine Travertin-Poren
  for (let i = 0; i < 380; i++) {
    ctx.fillStyle = `rgba(90,80,65,${0.05 + rnd() * 0.08})`;
    ctx.beginPath();
    ctx.ellipse(rnd() * size, rnd() * size, 1 + rnd() * 6, 0.6 + rnd() * 1.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function stone(width, height, depth, color = "#cfc7b9") {
  const mesh = new THREE.Mesh(
    new RoundedBoxGeometry(width, height, depth, 4, 0.03),
    new THREE.MeshStandardMaterial({ color: "#ffffff", map: stoneTexture(color), roughness: 0.9, metalness: 0 }),
  );
  mesh.position.y = height / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Rendert eine Szene und gibt ein PNG als Data-URL zurück. */
window.renderScene = async function renderScene(spec) {
  const width = spec.width ?? 1600;
  const height = spec.height ?? 2000;
  const renderer = makeRenderer(width, height);
  const scene = new THREE.Scene();

  // Freisteller: gleicher Flakon einmal vor Weiß, einmal vor Schwarz (spec.matte). Aus der Differenz
  // berechnet render-bottles.ts echte Transparenz, auch durch das Glas und den Kontaktschatten.
  if (spec.view === "cutout") {
    scene.background = new THREE.Color(spec.matte);
    environment(renderer, scene);
    studioLights(scene, { warm: true, keyFrom: spec.keyFrom ?? [-7, 8, 6] });
    const b = buildBottle(spec.bottle);
    b.group.rotation.y = spec.rotY ?? -0.28;
    scene.add(b.group);
    const cs = contactShadow(b.width * 2.2, b.depth * 2.6, 0.5);
    scene.add(cs);
    const center = b.totalHeight / 2;
    const camera = new THREE.PerspectiveCamera(spec.fov ?? 22, width / height, 0.1, 200);
    const dist = (spec.distance ?? 2.7) * b.totalHeight + 2.4;
    camera.position.set(0, center + 0.6, dist);
    camera.lookAt(0, center - 0.12, 0);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    renderer.render(scene, camera);
    const url = renderer.domElement.toDataURL("image/png");
    renderer.dispose();
    renderer.domElement.remove();
    return url;
  }

  const ground = spec.view === "lifestyle" || spec.view === "hero" ? new THREE.Color(spec.ground ?? "#d3ccc0") : PAPER;
  scene.background = ground.clone();
  environment(renderer, scene);
  studioLights(scene, { warm: spec.view === "lifestyle" || spec.view === "hero", keyFrom: spec.keyFrom ?? (spec.view === "lifestyle" || spec.view === "hero" ? [-9, 7, 4] : [-6, 10, 7]) });
  scene.add(cyclorama(ground));
  const warmView = spec.view === "lifestyle" || spec.view === "hero";
  if (warmView) {
    const wall = backdrop(ground);
    wall.position.set(0, 9, -5.2);
    scene.add(wall);
  }

  const camera = new THREE.PerspectiveCamera(spec.fov ?? 24, width / height, 0.1, 200);

  if (spec.view === "hero" || spec.view === "world") {
    const bottles = spec.bottles.map((b) => ({ ...buildBottle(b), place: b.place }));
    const plinth = spec.view === "hero" ? stone(10.5, 0.9, 4.2, "#8a8174") : null;
    const lift = plinth ? 0.9 : 0;
    if (plinth) scene.add(plinth);
    for (const b of bottles) {
      b.group.position.set(b.place[0], lift, b.place[1]);
      b.group.rotation.y = b.place[2] ?? 0;
      scene.add(b.group);
      const cs = contactShadow(b.width * 1.9, b.depth * 2.2, 0.6);
      cs.position.set(b.place[0], lift + 0.004, b.place[1]);
      scene.add(cs);
      const long = castShadowPlane(b.totalHeight * 1.6, b.width * 1.1, 0.34);
      long.position.set(b.place[0] + b.totalHeight * 0.8 - 0.2, lift + 0.006, b.place[1] - 0.15);
      long.rotation.z = -0.08;
      scene.add(long);
    }
    camera.position.set(...(spec.cameraPos ?? [0, 3.6, 22]));
    camera.lookAt(...(spec.lookAt ?? [0, 2.6, 0]));
  } else {
    const b = buildBottle(spec.bottle);
    let lift = 0;
    if (spec.view === "lifestyle") {
      const s = stone(4.6, 0.7, 3.2, "#8c8376");
      scene.add(s);
      lift = 0.7;
      const long = castShadowPlane(4.6, 1.5, 0.34);
      long.position.set(2.1, lift + 0.006, -0.1);
      long.rotation.z = -0.08;
      scene.add(long);
    }
    b.group.position.y = lift;
    b.group.rotation.y = spec.view === "side" ? -0.62 : spec.view === "lifestyle" ? -0.3 : spec.view === "detail" ? -0.35 : 0;
    scene.add(b.group);
    const cs = contactShadow(b.width * 1.8, b.depth * 2.1, 0.62);
    cs.position.y = lift + 0.004;
    scene.add(cs);

    const center = lift + b.totalHeight / 2;
    if (spec.view === "detail") {
      camera.fov = 16;
      camera.position.set(1.2, b.bodyHeight + lift + 1.4, 9);
      camera.lookAt(0, b.bodyHeight + lift + 0.35, 0);
    } else if (spec.view === "lifestyle") {
      camera.position.set(0.8, center + 1.4, 17);
      camera.lookAt(0.3, center - 0.1, 0);
    } else {
      const dist = 2.55 * b.totalHeight + 2.4;
      camera.position.set(0, center + 0.9, dist);
      camera.lookAt(0, center - 0.05, 0);
    }
  }
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
  // Zweiter Frame: Transmission-Buffer stabil.
  renderer.render(scene, camera);
  const url = renderer.domElement.toDataURL("image/png");
  renderer.dispose();
  renderer.domElement.remove();
  return url;
};

window.__ready = true;
