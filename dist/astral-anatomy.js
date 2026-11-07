import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { isAstral, onAppearanceChange } from './anatomy-appearance.js';
import { ACTIVITY_COLORS, activityMix, neuronTypes } from './organ-activity.js?v=20261105-activity-organs';

// The approved illustrations are the material reference. All source meshes,
// transforms, hit targets and stage anchors stay resident for an exact undo.
const palette = {
  brain:      { shell: '#ffffff', signal: '#68d2df', accent: '#f0ab00' },
  lungs:      { shell: '#ffffff', signal: '#68d2df', accent: '#f0ab00' },
  liver:      { shell: '#ffffff', signal: '#f0ab00', accent: '#68d2df' },
  kidneys:    { shell: '#ffffff', signal: '#d0006f', accent: '#f2a9dc' },
  spleen:     { shell: '#ffffff', signal: '#d0006f', accent: '#f0ab00' },
  stomach:    { shell: '#ffffff', signal: '#68d2df', accent: '#f0ab00' },
  pancreas:   { shell: '#ffffff', signal: '#d0006f', accent: '#f0ab00' },
  intestines: { shell: '#ffffff', signal: '#c4d600', accent: '#f0ab00' },
  heart:      { shell: '#d0006f', signal: '#f0ab00', accent: '#d0006f' },
};
const clock = { value: 0 }, viewport = { value: 2160 };
const cleanups = [];
const noHit = () => {};
const normalVertex = `
varying vec3 vNormal; varying vec3 vView; varying vec3 vLocal;
void main() {
  vec4 p = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal); vView = -p.xyz; vLocal = position;
  gl_Position = projectionMatrix * p;
}`;

function glassMaterial(color, { bone = false, back = false, activity = null } = {}) {
  const material = new T.ShaderMaterial({
    uniforms: {
      tint: { value: new T.Color(color) }, alpha: { value: 1 },
      bone: { value: bone ? 1 : 0 }, back: { value: back ? 1 : 0 },
      manualTint: { value: new T.Color(ACTIVITY_COLORS.manual) },
      manualRatio: { value: activity ? activityMix(activity).manual : 0 },
    },
    vertexShader: activity ? normalVertex.replace('void main()', 'attribute float surfaceProgress; varying float vSurfaceProgress;\nvoid main()').replace('vLocal = position;', 'vLocal = position; vSurfaceProgress = surfaceProgress;') : normalVertex,
    fragmentShader: `
      uniform vec3 tint; uniform float alpha, bone, back;
      uniform vec3 manualTint; uniform float manualRatio;
      ${activity ? 'varying float vSurfaceProgress;' : ''}
      varying vec3 vNormal; varying vec3 vView; varying vec3 vLocal;
      void main() {
        vec3 n = normalize(vNormal), v = normalize(vView);
        float facing = abs(dot(n, v));
        float rim = pow(1.0 - facing, 2.4);
        vec3 l = normalize(vec3(-0.65, 0.9, 1.0));
        float key = pow(abs(dot(n, normalize(l + v))), 72.0);
        float strip = pow(abs(dot(n, normalize(vec3(0.9, 0.25, 0.8) + v))), 130.0);
        float broad = pow(1.0 - facing, 0.8);
        float texture = 0.5 + 0.5 * sin(vLocal.y * 110.0 + sin(vLocal.x * 75.0) * 1.6);
        vec3 pearl = mix(vec3(1.0, 0.84, 0.94), vec3(0.88, 1.0, 0.97), bone);
        ${activity ? `float blendWidth = min(0.055, min(manualRatio, 1.0 - manualRatio));
        float manual = manualRatio <= 0.0 ? 0.0 : manualRatio >= 1.0 ? 1.0 : 1.0 - smoothstep(manualRatio - blendWidth, manualRatio + blendWidth, vSurfaceProgress);
        vec3 shellTint = mix(tint, manualTint, manual);` : 'vec3 shellTint = tint;'}
        vec3 color = shellTint * (0.16 + broad * 0.78) + mix(shellTint, pearl, 0.48) * rim * 1.05;
        color += pearl * (key * 1.6 + strip * 1.05);
        float a = alpha * (0.09 + broad * 0.21 + rim * 0.42 + key * 0.4 + strip * 0.25);
        a *= mix(1.0, 0.45, back) * mix(1.0, 1.8, bone);
        color *= mix(1.85, 1.4, bone);
        color += shellTint * texture * 0.015;
        gl_FragColor = vec4(color, clamp(a, 0.0, 0.88));
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false, depthTest: !bone,
    side: back ? T.BackSide : T.FrontSide, toneMapped: false,
  });
  // scene.js owns skeleton fade opacity; retain that animation contract.
  Object.defineProperty(material, 'opacity', {
    get: () => material.uniforms.alpha.value,
    set: value => { material.uniforms.alpha.value = value; }, configurable: true,
  });
  return material;
}

function random(seed) {
  return () => { seed |= 0; seed = seed + 0x6d2b79f5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

// Area sampling keeps triangulation density from turning into visual density.
function sampleSurface(geometry, count, rand) {
  const positions = geometry.attributes.position, normals = geometry.attributes.normal;
  const indices = geometry.index, triangles = (indices?.count || positions.count) / 3;
  const weights = new Float64Array(triangles);
  const a = new T.Vector3(), b = new T.Vector3(), c = new T.Vector3();
  const ab = new T.Vector3(), ac = new T.Vector3();
  let area = 0;
  for (let i = 0; i < triangles; i++) {
    a.fromBufferAttribute(positions, indices ? indices.getX(i * 3) : i * 3);
    b.fromBufferAttribute(positions, indices ? indices.getX(i * 3 + 1) : i * 3 + 1);
    c.fromBufferAttribute(positions, indices ? indices.getX(i * 3 + 2) : i * 3 + 2);
    area += ab.subVectors(b, a).cross(ac.subVectors(c, a)).length() * 0.5;
    weights[i] = area;
  }
  const points = [], normal = new T.Vector3(), nb = new T.Vector3(), nc = new T.Vector3();
  for (let i = 0; i < count; i++) {
    const target = rand() * area; let lo = 0, hi = triangles - 1;
    while (lo < hi) { const mid = (lo + hi) >>> 1; if (weights[mid] < target) lo = mid + 1; else hi = mid; }
    const ids = [0, 1, 2].map(j => indices ? indices.getX(lo * 3 + j) : lo * 3 + j);
    const u = Math.sqrt(rand()), v = rand(), wa = 1 - u, wb = u * (1 - v), wc = u * v;
    a.fromBufferAttribute(positions, ids[0]); b.fromBufferAttribute(positions, ids[1]); c.fromBufferAttribute(positions, ids[2]);
    const p = a.clone().multiplyScalar(wa).addScaledVector(b, wb).addScaledVector(c, wc);
    normal.fromBufferAttribute(normals, ids[0]).multiplyScalar(wa);
    nb.fromBufferAttribute(normals, ids[1]); nc.fromBufferAttribute(normals, ids[2]);
    normal.addScaledVector(nb, wb).addScaledVector(nc, wc).normalize();
    p.addScaledVector(normal, -(0.004 + rand() * 0.014));
    points.push(p);
  }
  return points;
}

function branchMaterial(colors, activity = false) {
  return new T.ShaderMaterial({
    uniforms: { signalColor: { value: new T.Color(colors.signal) }, accent: { value: new T.Color(colors.accent) }, time: clock },
    vertexShader: `${activity ? 'attribute vec4 activityColor; varying vec4 vActivityColor;' : ''} varying vec2 vUv; varying vec3 vP; void main(){${activity ? 'vActivityColor=activityColor;' : ''}vUv=uv;vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `uniform vec3 signalColor,accent;uniform float time;varying vec2 vUv;varying vec3 vP;
      ${activity ? 'varying vec4 vActivityColor;' : ''}
      void main(){
        float pulse=pow(0.5+0.5*sin(vUv.x*7.0-time*1.8+vP.y*14.0),12.0);
        float colorMix=smoothstep(-0.2,0.2,sin(vP.x*9.0+vP.y*5.0));
        vec3 color=${activity ? 'vActivityColor.rgb' : 'mix(signalColor,accent,colorMix*0.65)'}*(2.3+pulse*1.6);
        color+=vec3(1.0,0.93,0.82)*pulse*0.65;
        ${activity ? 'if (vActivityColor.w > 0.5) color = vActivityColor.rgb * mix(0.65, 1.0, pulse);' : ''}
        gl_FragColor=vec4(color,0.94);
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false, depthTest: false, toneMapped: false,
    blending: T.AdditiveBlending,
  });
}

function pointsMaterial(colors, activity = false) {
  return new T.ShaderMaterial({
    uniforms: { tint: { value: new T.Color(colors.signal) }, time: clock, viewportHeight: viewport },
    vertexShader: `${activity ? 'attribute vec4 activityColor; varying vec4 vActivityColor;' : ''} attribute float intensity; uniform float viewportHeight;varying float vI;
      void main(){${activity ? 'vActivityColor=activityColor;' : ''}vI=intensity;vec4 p=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*p;
        float scale=length(modelViewMatrix[0].xyz);
        gl_PointSize=clamp(viewportHeight*projectionMatrix[1][1]*scale*0.014*intensity,3.0,28.0);
      }`,
    fragmentShader: `uniform vec3 tint;uniform float time;varying float vI;
      ${activity ? 'varying vec4 vActivityColor;' : ''}
      void main(){float d=length(gl_PointCoord-0.5)*2.0;if(d>1.0)discard;
        float core=exp(-d*d*28.0),glow=exp(-d*d*5.0)*0.52;
        float pulse=0.8+0.2*sin(time*1.4+vI*20.0);
        vec3 color=mix(${activity ? 'vActivityColor.rgb' : 'tint'}*1.7,vec3(1.0,0.95,0.9)*2.0,core);
        ${activity ? 'if (vActivityColor.w > 0.5) color = vActivityColor.rgb * mix(0.65, 1.0, core);' : ''}
        gl_FragColor=vec4(color, (core+glow)*pulse);
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false, depthTest: false, toneMapped: false,
    blending: T.AdditiveBlending,
  });
}

function centerOf(points) {
  return points.reduce((sum, p) => sum.add(p), new T.Vector3()).multiplyScalar(1 / points.length);
}

function addBranch(pieces, from, to, radius, rand) {
  const d = from.distanceTo(to);
  if (d < 0.002) return;
  const bend = new T.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(d * 0.2);
  const curve = new T.CatmullRomCurve3([from, from.clone().lerp(to, 0.36).add(bend), from.clone().lerp(to, 0.72).addScaledVector(bend, 0.4), to]);
  const tube = new T.TubeGeometry(curve, 6, radius, 4, false);
  const p = tube.attributes.position;
  for (let i = 0; i <= 6; i++) {
    const c = curve.getPointAt(i / 6), taper = 1 - i / 6 * 0.48;
    for (let j = 0; j <= 4; j++) {
      const index = i * 5 + j, v = new T.Vector3().fromBufferAttribute(p, index).sub(c).multiplyScalar(taper).add(c);
      p.setXYZ(index, v.x, v.y, v.z);
    }
  }
  pieces.push(tube);
}

// Hierarchical clusters make a branching arbor, rather than a wireframe mesh.
function growTree(points, from, pieces, nodes, rand, depth = 0) {
  const center = centerOf(points), next = from.clone().lerp(center, depth === 0 ? 0.35 : 0.72);
  addBranch(pieces, from, next, Math.max(0.00065, 0.0055 * Math.pow(0.70, depth)), rand);
  if (points.length <= 3 || depth > 8) {
    for (const p of points) { addBranch(pieces, next, p, 0.00075, rand); nodes.push(p); }
    return;
  }
  const size = new T.Box3().setFromPoints(points).getSize(new T.Vector3());
  const axis = size.x > size.y && size.x > size.z ? 'x' : size.y > size.z ? 'y' : 'z';
  points.sort((a, b) => a[axis] - b[axis]);
  const split = Math.floor(points.length / 2);
  growTree(points.slice(0, split), next, pieces, nodes, rand, depth + 1);
  growTree(points.slice(split), next, pieces, nodes, rand, depth + 1);
  if (depth < 4) nodes.push(next);
}

function makeInterior(geometries, id, seed, activity = null, surfaceProgress = null) {
  const group = new T.Group(); group.name = 'Astral scientific filaments';
  const rand = random(seed), pieces = [], nodes = [], colors = palette[id];
  const count = id === 'brain' || id === 'lungs' ? 520 : 320;
  for (const geometry of geometries) {
    const points = sampleSurface(geometry, Math.max(35, Math.floor(count / geometries.length)), rand);
    if (id === 'intestines') {
      // Local arbors stay within each coil; no veins across the empty center.
      const pool = points.slice();
      while (pool.length) {
        const anchor = pool.pop(), cluster = [anchor];
        for (let i = pool.length - 1; i >= 0; i--) if (pool[i].distanceTo(anchor) < 0.095) cluster.push(...pool.splice(i, 1));
        growTree(cluster, anchor, pieces, nodes, rand, 3);
      }
    } else {
      const bounds = new T.Box3().setFromPoints(points), size = bounds.getSize(new T.Vector3());
      const origin = bounds.getCenter(new T.Vector3());
      origin.y += size.y * (id === 'lungs' ? 0.36 : id === 'brain' ? -0.25 : 0.08);
      origin.z += size.z * 0.02;
      growTree(points, origin, pieces, nodes, rand);
    }
  }
  const types = activity ? neuronTypes(nodes.length, activity, seed) : [];
  const nodeColors = types.map(type => {
    const color = new T.Color(ACTIVITY_COLORS[type] || colors.signal);
    // RGB is the legend swatch. W marks Semi so the glow can pulse up to
    // that gold without clipping both red and green to full brightness.
    return new T.Vector4(color.r, color.g, color.b, type === 'semi' ? 1 : 0);
  });
  if (activity) {
    group.userData.activityMix = activityMix(activity);
    group.userData.neuronCounts = Object.fromEntries(Object.keys(ACTIVITY_COLORS).map(type => [type, types.filter(value => value === type).length]));
    for (const piece of pieces) {
      // Every terminal inherits its nearest neuron's category. Colouring adds
      // attributes only; the original branching geometry and animation remain.
      const endpoint = piece.parameters.path.getPoint(1);
      let nearest = 0, distance = Infinity;
      nodes.forEach((node, index) => { const d = node.distanceToSquared(endpoint); if (d < distance) { distance = d; nearest = index; } });
      const color = nodeColors[nearest], values = new Float32Array(piece.attributes.position.count * 4);
      for (let i = 0; i < piece.attributes.position.count; i++) color.toArray(values, i * 4);
      piece.setAttribute('activityColor', new T.BufferAttribute(values, 4));
    }
  }
  if (pieces.length) {
    const geometry = mergeGeometries(pieces, false); pieces.forEach(piece => piece.dispose());
    const branches = new T.Mesh(geometry, branchMaterial(colors, Boolean(activity)));
    branches.renderOrder = 6; branches.layers.enable(1); branches.raycast = noHit; group.add(branches);
  }
  const pointGeometry = new T.BufferGeometry();
  pointGeometry.setAttribute('position', new T.Float32BufferAttribute(nodes.flatMap(p => p.toArray()), 3));
  pointGeometry.setAttribute('intensity', new T.Float32BufferAttribute(nodes.map(() => 0.45 + rand() * 0.85), 1));
  if (activity) pointGeometry.setAttribute('activityColor', new T.Float32BufferAttribute(nodeColors.flatMap(color => color.toArray()), 4));
  const points = new T.Points(pointGeometry, pointsMaterial(colors, Boolean(activity)));
  points.renderOrder = 8; points.layers.enable(1); points.raycast = noHit; group.add(points);
  if (id === 'lungs') {
    // Small translucent sacs at the branching tips give the lungs their own structure.
    const spheres = new T.InstancedMesh(new T.SphereGeometry(1, 7, 5), glassMaterial(colors.shell, { activity }), nodes.length * 3);
    const progress = new Float32Array(nodes.length * 3);
    const matrix = new T.Matrix4(), q = new T.Quaternion(); let i = 0;
    for (const p of nodes) for (let j = 0; j < 3; j++) {
      const radius = 0.0035 + rand() * 0.005;
      const position = p.clone().add(new T.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(0.015));
      matrix.compose(position, q, new T.Vector3(radius, radius, radius)); spheres.setMatrixAt(i, matrix);
      progress[i++] = surfaceProgress?.(position.y) || 0;
    }
    // Custom shell vertex shader must account for instance transforms.
    if (activity) spheres.geometry.setAttribute('surfaceProgress', new T.InstancedBufferAttribute(progress, 1));
    spheres.material.vertexShader = spheres.material.vertexShader.replace('vec4 p = modelViewMatrix * vec4(position, 1.0);', 'vec4 p = modelViewMatrix * instanceMatrix * vec4(position, 1.0);');
    spheres.instanceMatrix.needsUpdate = true; spheres.renderOrder = 7; spheres.raycast = noHit; group.add(spheres);
  }
  return group;
}

function themeNetwork(network, id, activity = null) {
  const originals = [], cache = new Map();
  const neurons = network.children.filter(object => object.name.startsWith('Neuron '));
  const types = activity ? neuronTypes(neurons.length, activity) : [];
  const neuronIndex = object => {
    while (object.parent && object.parent !== network) object = object.parent;
    return neurons.indexOf(object);
  };
  const links = [];
  network.traverse(object => { if (object.isMesh && neuronIndex(object) < 0) links.push(object); });
  const linkTypes = activity ? neuronTypes(links.length, activity, 932) : [];
  network.traverse(object => {
    if (!object.isMesh) return;
    const original = object.material;
    const index = neuronIndex(object);
    const type = index < 0 ? linkTypes[links.indexOf(object)] : types[index];
    const color = ACTIVITY_COLORS[type] || palette[id].accent;
    if (!cache.has(original)) cache.set(original, new Map());
    const variants = cache.get(original);
    if (!variants.has(color)) {
      const material = original.clone();
      const intensity = type === 'semi' ? 1 : 4.8;
      if (material.color) material.color.set(color).multiplyScalar(intensity);
      if (material.uniforms?.glowColor) material.uniforms.glowColor.value.set(color).multiplyScalar(intensity);
      material.toneMapped = false;
      variants.set(color, material);
    }
    originals.push({ object, material: original, themed: variants.get(color), layers: object.layers.mask });
  });
  cleanups.push(onAppearanceChange(enabled => originals.forEach(entry => {
    entry.object.material = enabled ? entry.themed : entry.material;
    entry.object.layers.mask = entry.layers;
    if (enabled) entry.object.layers.enable(1);
  })));
}

// Area-weighted height makes 86% manual cover approximately 86% of the
// membrane, rather than 86% of an irregular organ's bounding box. The narrow
// transition remains anchored to the organ while it rotates.
function addSurfaceProgress(geometry) {
  geometry.computeBoundingBox();
  const positions = geometry.attributes.position, min = geometry.boundingBox.min.y;
  const height = geometry.boundingBox.max.y - min || 1, bins = new Float64Array(256);
  const a = new T.Vector3(), b = new T.Vector3(), c = new T.Vector3(), ab = new T.Vector3(), ac = new T.Vector3();
  let area = 0;
  for (let i = 0; i < positions.count; i += 3) {
    a.fromBufferAttribute(positions, i); b.fromBufferAttribute(positions, i + 1); c.fromBufferAttribute(positions, i + 2);
    const weight = ab.subVectors(b, a).cross(ac.subVectors(c, a)).length() * 0.5;
    const bin = Math.min(255, Math.max(0, Math.floor(((a.y + b.y + c.y) / 3 - min) / height * 256)));
    bins[bin] += weight; area += weight;
  }
  const cumulative = [0];
  for (const bin of bins) cumulative.push(cumulative.at(-1) + bin / (area || 1));
  const progressAt = y => {
    const scaled = T.MathUtils.clamp((y - min) / height, 0, 1) * 256;
    const bin = Math.min(255, Math.floor(scaled));
    return T.MathUtils.lerp(cumulative[bin], cumulative[bin + 1], scaled - bin);
  };
  const values = new Float32Array(positions.count);
  for (let i = 0; i < positions.count; i++) values[i] = progressAt(positions.getY(i));
  geometry.setAttribute('surfaceProgress', new T.BufferAttribute(values, 1));
  return progressAt;
}

export function mountAstralOrgan(organ, model, network, activity = null) {
  const modelId = organ.modelId || organ.id;
  organ.root.updateMatrixWorld(true);
  const inverse = organ.root.matrixWorld.clone().invert(), sources = [], regions = new Map();
  const networkObjects = new Set(); network.traverse(o => networkObjects.add(o));
  model.traverseVisible(mesh => {
    if (!mesh.isMesh || mesh.parent?.isMesh || networkObjects.has(mesh)) return;
    sources.push({ mesh, visible: mesh.visible });
    if (modelId === 'brain') {
      let owner = mesh;
      while (owner.parent && !owner.userData.bx_cat) owner = owner.parent;
      if (!['cortex', 'cerebellum', 'brainstem'].includes(owner.userData.bx_cat)) return;
    }
    const geometry = mesh.geometry.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inverse, mesh.matrixWorld));
    for (const name of Object.keys(geometry.attributes)) if (!['position', 'normal'].includes(name)) geometry.deleteAttribute(name);
    const plain = geometry.index ? geometry.toNonIndexed() : geometry;
    if (plain !== geometry) geometry.dispose();
    const key = mesh.userData.networkGroup || 'whole';
    if (!regions.has(key)) regions.set(key, []); regions.get(key).push(plain);
  });
  const regional = [...regions.values()].map(pieces => {
    const geometry = mergeGeometries(pieces, false); pieces.forEach(g => g.dispose()); return geometry;
  });
  const shellGeometry = mergeGeometries(regional, false), group = new T.Group();
  const surfaceProgress = activity ? addSurfaceProgress(shellGeometry) : null;
  group.name = 'Astral ' + organ.organ;
  group.userData.activityMix = activity ? activityMix(activity) : null;
  const shell = new T.Mesh(shellGeometry, glassMaterial(palette[modelId].shell, { activity }));
  shell.renderOrder = 10; shell.userData.organ = organ;
  const back = new T.Mesh(shellGeometry, glassMaterial(palette[modelId].shell, { back: true, activity }));
  back.renderOrder = 1; back.raycast = noHit;
  // Show the nearest membrane, not every overlapping fold of the cortex.
  const depth = new T.Mesh(shellGeometry, new T.MeshBasicMaterial({ colorWrite: false, depthWrite: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }));
  depth.renderOrder = 2; depth.raycast = noHit;
  group.add(back, depth, makeInterior(regional, modelId, 1307 + Object.keys(palette).indexOf(modelId) * 137, activity, surfaceProgress), shell);
  regional.forEach(g => g.dispose()); organ.root.add(group);
  themeNetwork(network, modelId, activity);
  cleanups.push(onAppearanceChange(enabled => {
    group.visible = enabled;
    sources.forEach(({ mesh, visible }) => { mesh.visible = enabled ? false : visible; });
  }));
}

export function mountAstralSkeleton(bones, heart) {
  const swaps = bones.children.map(mesh => ({ mesh, original: mesh.material, astral: glassMaterial('#9db0ac', { bone: true }) }));
  swaps.push({ mesh: heart, original: heart.material, astral: glassMaterial(palette.heart.shell) });
  heart.geometry.computeBoundingBox();
  const scale = Math.max(...heart.geometry.boundingBox.getSize(new T.Vector3()).toArray());
  const normalized = heart.geometry.clone().scale(1 / scale, 1 / scale, 1 / scale);
  const interior = makeInterior([normalized], 'heart', 4127); normalized.dispose();
  interior.scale.setScalar(scale); heart.add(interior);
  cleanups.push(onAppearanceChange(enabled => {
    swaps.forEach(({ mesh, original, astral }) => { const opacity = mesh.material.opacity; mesh.material = enabled ? astral : original; mesh.material.opacity = opacity; });
    interior.visible = enabled;
  }));
}

export function mountAstralVessel(mesh, uniforms, id) {
  const original = mesh.material, layers = mesh.layers.mask;
  // Scale each tube around its own centerline; subtracting a fixed radius can
  // invert the narrow tips. Extra attributes leave the original shader intact.
  for (const [source, name] of [['position', 'pathCenter'], ['expandedPosition', 'expandedCenter']]) {
    const positions = mesh.geometry.attributes[source], centers = new Float32Array(positions.count * 3);
    for (let start = 0; start < positions.count; start += 6) {
      const center = new T.Vector3();
      for (let i = 0; i < 5; i++) center.add(new T.Vector3().fromBufferAttribute(positions, start + i));
      center.multiplyScalar(0.2);
      for (let i = 0; i < 6; i++) center.toArray(centers, (start + i) * 3);
    }
    mesh.geometry.setAttribute(name, new T.BufferAttribute(centers, 3));
  }
  const material = new T.ShaderMaterial({
    uniforms: { ...uniforms, uTime: clock, color: { value: new T.Color(palette[id].accent) }, second: { value: new T.Color(palette[id].signal) } },
    vertexShader: `attribute vec3 expandedPosition;attribute vec3 expandedNormal;attribute vec3 pathCenter;attribute vec3 expandedCenter;attribute float branchSeed;
      uniform float uSeparation;uniform vec3 uHoverOffset;varying float vPath;varying float vBranch;varying vec3 vN;varying vec3 vV;
      void main(){vec3 n=normalize(mix(normal,expandedNormal,uSeparation));
        vec3 p=mix(position,expandedPosition,uSeparation);
        vec3 center=mix(pathCenter,expandedCenter,uSeparation);
        p=mix(center,p,0.38);
        p+=uHoverOffset*smoothstep(0.45,1.0,uv.x);vPath=uv.x;vBranch=branchSeed;
        vec4 view=modelViewMatrix*vec4(p,1.0);vN=normalMatrix*n;vV=-view.xyz;
        gl_Position=projectionMatrix*view;}`,
    fragmentShader: `uniform vec3 color,second;uniform float uTime;varying float vPath,vBranch;varying vec3 vN,vV;
      void main(){float flow=pow(0.5+0.5*sin(vPath*30.0-uTime*2.5+vBranch*2.3),25.0);
        float core=pow(abs(dot(normalize(vN),normalize(vV))),3.0);
        vec3 tint=mix(color,second,0.5+0.5*sin(vBranch*5.0+vPath*3.0));
        gl_FragColor=vec4(tint*(1.8+flow*2.6)+vec3(1.0,0.85,0.7)*flow,(0.5+core*0.4+flow*0.1));
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false, depthTest: false, toneMapped: false, blending: T.AdditiveBlending,
  });
  const unsubscribe = onAppearanceChange(enabled => {
    mesh.material = enabled ? material : original; mesh.layers.mask = layers;
    if (enabled) mesh.layers.enable(1);
  });
  return () => { unsubscribe(); mesh.material = original; material.dispose(); };
}

// Only the signals enter this small glow buffer; glass and UI remain crisp.
// At 4K this adds three 1280-wide passes, not multiple full-resolution buffers.
export function createAstralRenderer(renderer) {
  const targets = [0, 1].map(() => new T.WebGLRenderTarget(1, 1, { depthBuffer: false }));
  const camera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1), scene = new T.Scene();
  const quad = new T.Mesh(new T.PlaneGeometry(2, 2)); scene.add(quad);
  const vertexShader = 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
  const blur = new T.ShaderMaterial({
    uniforms: { source: { value: null }, stepSize: { value: new T.Vector2() } }, vertexShader,
    fragmentShader: `uniform sampler2D source;uniform vec2 stepSize;varying vec2 vUv;
      void main(){vec4 sum=texture2D(source,vUv)*0.227027;
        sum+=(texture2D(source,vUv+stepSize*1.384615)+texture2D(source,vUv-stepSize*1.384615))*0.316216;
        sum+=(texture2D(source,vUv+stepSize*3.230769)+texture2D(source,vUv-stepSize*3.230769))*0.070270;
        gl_FragColor=sum;}`,
    depthWrite: false, depthTest: false, toneMapped: false,
  });
  const composite = new T.ShaderMaterial({
    uniforms: { source: { value: targets[0].texture } }, vertexShader,
    fragmentShader: `uniform sampler2D source;varying vec2 vUv;
      void main(){vec3 glow=texture2D(source,vUv).rgb*0.62;gl_FragColor=vec4(glow,max(max(glow.r,glow.g),glow.b));
        #include <colorspace_fragment>
      }`,
    transparent: true, blending: T.AdditiveBlending, depthWrite: false, depthTest: false, toneMapped: false,
  });
  let width = 0, height = 0;
  const size = new T.Vector2();
  return {
    render(world, view, time, reduced) {
      clock.value = reduced ? 0 : time;
      renderer.getDrawingBufferSize(size); viewport.value = size.y;
      if (!isAstral()) { renderer.render(world, view); return; }
      const newWidth = Math.min(1280, Math.round(size.x / 2)), newHeight = Math.round(newWidth * size.y / size.x);
      if (newWidth !== width || newHeight !== height) { width = newWidth; height = newHeight; targets.forEach(t => t.setSize(width, height)); }
      const mask = view.layers.mask, autoClear = renderer.autoClear;
      renderer.autoClear = true; renderer.setRenderTarget(targets[0]); view.layers.set(1);
      renderer.render(world, view); view.layers.mask = mask;
      quad.material = blur; blur.uniforms.source.value = targets[0].texture; blur.uniforms.stepSize.value.set(1.6 / width, 0);
      renderer.setRenderTarget(targets[1]); renderer.render(scene, camera);
      blur.uniforms.source.value = targets[1].texture; blur.uniforms.stepSize.value.set(0, 1.6 / height);
      renderer.setRenderTarget(targets[0]); renderer.render(scene, camera);
      renderer.setRenderTarget(null); renderer.render(world, view);
      renderer.autoClear = false; quad.material = composite; renderer.render(scene, camera);
      renderer.autoClear = autoClear;
    },
    dispose() { cleanups.splice(0).forEach(fn => fn()); targets.forEach(t => t.dispose()); quad.geometry.dispose(); blur.dispose(); composite.dispose(); },
  };
}
