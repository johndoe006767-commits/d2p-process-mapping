import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

export const organs = [
  { id: 'brain', label: 'Brain', color: '#e4eaf5', neurons: '#ff164f' },
  { id: 'liver', label: 'Liver', color: '#f0ab00', neurons: '#00fff2', files: ['7197'] },
  { id: 'lungs', label: 'Lungs', color: '#8bd3e6', neurons: '#ff7b00', files: ['7333', '7337', '7383', '7370', '7371'], networkGroups: ['right', 'right', 'right', 'left', 'left'] },
  { id: 'kidneys', label: 'Kidneys', color: '#8a3b8f', neurons: '#b6ff00', files: ['7204', '7205'], networkGroups: ['right', 'left'] },
  { id: 'spleen', label: 'Spleen', color: '#bd577f', neurons: '#fff200', files: ['7196'] },
  { id: 'intestines', label: 'Intestines', color: '#c4d600', neurons: '#d000ff', files: ['7206', '7207', '7208', '14543nsn', '14544', '14542'] },
  { id: 'pancreas', label: 'Pancreas', color: '#f0ab00', neurons: '#ff008c', files: ['7198'] },
  { id: 'stomach', label: 'Stomach', color: '#8bd3e6', neurons: '#ff00b7', files: ['7148'] },
];

export async function loadOrganGeometry(config) {
  const loader = new STLLoader();
  const geometry = await Promise.all(config.files.map(id => loader.loadAsync(`./assets/organs/FMA${id}.stl`)));
  const root = new THREE.Group();
  const content = new THREE.Group();
  root.add(content);
  const meshes = geometry.map((raw, index) => {
    // Preserve the atlas's geometry and relative placement. Smooth shared
    // normals rather than retaining STL's flat per-triangle shading.
    raw.deleteAttribute('normal');
    const smooth = mergeVertices(raw, 0.0001);
    raw.dispose();
    smooth.computeVertexNormals();
    smooth.rotateX(-Math.PI / 2); // BodyParts3D is Z-up, Three.js is Y-up.
    const mesh = new THREE.Mesh(smooth);
    mesh.userData.networkGroup = config.networkGroups?.[index] || 'whole';
    content.add(mesh);
    return mesh;
  });
  content.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(content);
  content.position.sub(bounds.getCenter(new THREE.Vector3()));
  root.scale.setScalar(3.55 / Math.max(...bounds.getSize(new THREE.Vector3()).toArray()));
  root.name = config.label;
  return { root, meshes };
}
