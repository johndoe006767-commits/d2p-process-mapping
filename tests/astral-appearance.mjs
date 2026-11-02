// Run with: node --test tests/astral-appearance.mjs
import { registerHooks } from 'node:module';
import { test } from 'node:test';
import assert from 'node:assert/strict';

registerHooks({ resolve(specifier, context, next) {
  if (specifier === 'three') return next(new URL('../dist/vendor/three.module.js', import.meta.url).href, context);
  if (specifier.startsWith('three/addons/')) return next(new URL('../dist/vendor/addons/' + specifier.slice(13), import.meta.url).href, context);
  return next(specifier, context);
} });

const T = await import('three');
const { setAstral } = await import('../dist/anatomy-appearance.js');
const { mountAstralOrgan, mountAstralSkeleton, mountAstralVessel } = await import('../dist/astral-anatomy.js');
const { buildVesselNetwork } = await import('../dist/vessels.js');

test('Material restoration retains geometry, transforms, anchors and original material references', () => {
  const root = new T.Group(), model = new T.Group(), content = new T.Group(), network = new T.Group();
  const source = new T.Mesh(new T.SphereGeometry(0.45, 16, 12), new T.MeshBasicMaterial({ color: '#f0ab00' }));
  const node = new T.Mesh(new T.SphereGeometry(0.01), new T.MeshBasicMaterial({ color: '#00fff2' }));
  node.position.set(0.3, 0.1, 0.2); network.add(node); content.add(source); model.add(content, network); root.add(model);
  root.position.set(0.3, 0.8, 0.2); root.scale.setScalar(0.23); root.rotation.y = 0.7;
  const originalPositions = source.geometry.attributes.position.array.slice(), originalNodeMaterial = node.material;
  const originalSourceMaterial = source.material, originalRootMatrix = root.updateMatrixWorld(true) || root.matrixWorld.clone();
  const nodePosition = node.getWorldPosition(new T.Vector3()).clone();
  const organ = { id: 'liver', organ: 'Liver', root };
  mountAstralOrgan(organ, model, network);
  assert.equal(source.visible, false);
  assert.notEqual(node.material, originalNodeMaterial);
  for (let i = 0; i < 5; i++) {
    setAstral(false);
    assert.equal(source.visible, true);
    assert.equal(source.material, originalSourceMaterial);
    assert.equal(node.material, originalNodeMaterial);
    assert.deepEqual(source.geometry.attributes.position.array, originalPositions);
    assert.ok(root.matrixWorld.equals(originalRootMatrix));
    assert.ok(node.getWorldPosition(new T.Vector3()).equals(nodePosition));
    assert.equal(root.children.find(o => o.name === 'Astral Liver').visible, false);
    setAstral(true);
  }
});

test('Skeleton and heart material restoration retains opacity and heartbeat transforms', () => {
  const bones = new T.Group(), bone = new T.Mesh(new T.BoxGeometry(), new T.MeshBasicMaterial({ opacity: 0.6 }));
  const heart = new T.Mesh(new T.SphereGeometry(0.08), new T.MeshBasicMaterial({ color: '#d0006f' }));
  bones.add(bone); heart.scale.setScalar(1.12);
  const originals = [bone.material, heart.material]; mountAstralSkeleton(bones, heart);
  bone.material.opacity = 0.34;
  assert.equal(bone.material.uniforms.alpha.value, 0.34);
  setAstral(false);
  assert.equal(bone.material, originals[0]); assert.equal(heart.material, originals[1]);
  assert.equal(bone.material.opacity, 0.34); assert.equal(heart.scale.x, 1.12);
  setAstral(true);
});

test('Vessel appearance preserves endpoint geometry and live layout uniforms; cleanup unsubscribes', () => {
  const geometry = buildVesselNetwork(new T.Vector3(), new T.Vector3(0.2, 0.1, 0), new T.Vector3(0.8, 0.6, 0), 1, 1, 9);
  const positions = geometry.attributes.position.array.slice(), expanded = geometry.attributes.expandedPosition.array.slice();
  const original = new T.MeshPhysicalMaterial(), mesh = new T.Mesh(geometry, original);
  const uniforms = { uSeparation: { value: 0.5 }, uTime: { value: 2 }, uHoverOffset: { value: new T.Vector3() } };
  const cleanup = mountAstralVessel(mesh, uniforms, 'lungs');
  assert.equal(mesh.material.uniforms.uSeparation, uniforms.uSeparation);
  setAstral(false); assert.equal(mesh.material, original);
  assert.deepEqual(geometry.attributes.position.array, positions); assert.deepEqual(geometry.attributes.expandedPosition.array, expanded);
  assert.ok([...geometry.attributes.pathCenter.array].every(Number.isFinite));
  cleanup(); setAstral(true); assert.equal(mesh.material, original);
});
