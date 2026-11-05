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
const { ACTIVITY_COLORS, activityMix, neuronTypes } = await import('../dist/organ-activity.js');
const { organModelFor } = await import('../dist/organs.js');
const fs = await import('node:fs/promises');

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

test('Every tower uses its As Is mix; neuron proportions are stable and within one neuron', async () => {
  const kpis = JSON.parse(await fs.readFile(new URL('../dist/data/kpi-summary.json', import.meta.url)));
  for (const {asIs} of Object.values(kpis)) {
    for (const count of [2, 320, 550]) {
      const types = neuronTypes(count, asIs), mix = activityMix(asIs);
      assert.deepEqual(types, neuronTypes(count, asIs));
      for (const type of Object.keys(ACTIVITY_COLORS)) {
        assert.ok(Math.abs(types.filter(value => value === type).length - mix[type] * count) < 1);
        if (!asIs[type]) assert.ok(!types.includes(type));
      }
    }
  }
  assert.deepEqual(neuronTypes(10, {manual: 10}), Array(10).fill('manual'));
  assert.deepEqual(neuronTypes(10, {auto: 10}), Array(10).fill('auto'));
  assert.deepEqual(neuronTypes(10, {}), Array(10).fill(null));
  assert.equal(organModelFor('intestines'), 'liver');
  assert.equal(organModelFor('liver'), 'intestines');
  assert.equal(organModelFor('kidneys'), 'kidneys');
});

test('Activity colours change membrane coverage and neuron colour without changing geometry', () => {
  const specimens = [{auto:0, semi:2, manual:12}, {auto:14, semi:0, manual:0}, {auto:0, semi:0, manual:14}].map(activity => {
    const root = new T.Group(), model = new T.Group(), network = new T.Group();
    // An uneven silhouette checks surface area rather than bounding-box height.
    const geometry = new T.SphereGeometry(.45, 48, 36);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) positions.setX(i, positions.getX(i) * (1.4 + positions.getY(i)));
    geometry.computeVertexNormals();
    model.add(new T.Mesh(geometry, new T.MeshBasicMaterial()));root.add(model, network);
    mountAstralOrgan({id:'kidneys', organ:'Kidneys', root}, model, network, activity);
    const group = root.getObjectByName('Astral Kidneys');
    return {group, shell:group.children.at(-1), interior:group.getObjectByName('Astral scientific filaments')};
  });
  const [manual, automated, allManual] = specimens;
  for (const specimen of specimens) {
    assert.deepEqual(specimen.shell.geometry.attributes.position.array, manual.shell.geometry.attributes.position.array);
    assert.deepEqual(specimen.interior.children[0].geometry.attributes.position.array, manual.interior.children[0].geometry.attributes.position.array);
    assert.deepEqual(specimen.interior.children[1].geometry.attributes.position.array, manual.interior.children[1].geometry.attributes.position.array);
  }
  assert.equal(manual.shell.material.uniforms.manualRatio.value, 12/14);
  assert.equal(automated.shell.material.uniforms.manualRatio.value, 0);
  assert.equal(allManual.shell.material.uniforms.manualRatio.value, 1);
  assert.equal(manual.shell.material.uniforms.tint.value.getHexString(), 'ffffff');
  assert.equal(manual.shell.material.uniforms.manualTint.value.getHexString(), '830051');
  const p=manual.shell.geometry.attributes.position, progress=manual.shell.geometry.attributes.surfaceProgress;
  let total=0, coverage=0;
  const a=new T.Vector3(), b=new T.Vector3(), c=new T.Vector3();
  for(let i=0;i<p.count;i+=3){
    a.fromBufferAttribute(p,i);b.fromBufferAttribute(p,i+1);c.fromBufferAttribute(p,i+2);
    const area=b.sub(a).cross(c.sub(a)).length()/2;
    const rank=(progress.getX(i)+progress.getX(i+1)+progress.getX(i+2))/3;
    total+=area;if(rank<12/14)coverage+=area;
  }
  assert.ok(Math.abs(coverage/total-12/14)<.02, '86% membrane coverage follows surface area');
  const colors=automated.interior.children[1].geometry.attributes.activityColor;
  const blue=new T.Color(ACTIVITY_COLORS.auto);
  for(let i=0;i<colors.count;i++)assert.ok(Math.abs(colors.getX(i)-blue.r)<1e-6 && Math.abs(colors.getY(i)-blue.g)<1e-6 && Math.abs(colors.getZ(i)-blue.b)<1e-6);
});
