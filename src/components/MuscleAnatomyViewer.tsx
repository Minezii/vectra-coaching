import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import {
  ArrowsClockwise,
  Crosshair,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
} from '@phosphor-icons/react';

export interface MuscleAnatomyViewerProps {
  activeGroupId: string;
  activeSubGroupId: string;
  activeLabel: string;
  onSelectMuscle: (groupId: string, subGroupId: string) => void;
}

type BodyView = 'front' | 'back';

interface MuscleMatcher {
  subGroupId: string;
  groupId: string;
  label: string;
  test: (normName: string) => boolean;
}

const MUSCLE_MATCHERS: MuscleMatcher[] = [
  {
    subGroupId: 'biceps',
    groupId: 'arms',
    label: 'Бицепс',
    test: (n) => /biceps brachii/.test(n),
  },
  {
    subGroupId: 'triceps',
    groupId: 'arms',
    label: 'Трицепс',
    test: (n) => /triceps brachii/.test(n),
  },
  {
    subGroupId: 'brachialis',
    groupId: 'arms',
    label: 'Брахиалис',
    test: (n) => /\bbrachialis\b/.test(n),
  },
  {
    subGroupId: 'forearms-outer',
    groupId: 'arms',
    label: 'Внешнее предплечье',
    test: (n) =>
      /brachioradialis|extensor carpi|extensor digiti minimi|extensor pollicis|extensor digitorum(?! longus)/.test(
        n
      ),
  },
  {
    subGroupId: 'forearms-inner',
    groupId: 'arms',
    label: 'Внутреннее предплечье',
    test: (n) =>
      /flexor carpi|flexor digitorum superficialis|palmaris longus|pronator teres/.test(
        n
      ),
  },
  {
    subGroupId: 'lats-upper',
    groupId: 'back',
    label: 'Верх широчайших',
    test: (n) => /latissimus dorsi.*upper|\bteres major\b/.test(n),
  },
  {
    subGroupId: 'lats-lower',
    groupId: 'back',
    label: 'Низ широчайших',
    test: (n) => /latissimus dorsi.*lower/.test(n),
  },
  {
    subGroupId: 'traps-upper',
    groupId: 'back',
    label: 'Верх трапеции',
    test: (n) => /descending part.*trapezius/.test(n),
  },
  {
    subGroupId: 'mid-back',
    groupId: 'back',
    label: 'Середина спины и ромбовидные',
    test: (n) =>
      /(transverse|ascending) part.*trapezius|rhomboid|infraspinatus|teres minor/.test(
        n
      ),
  },
  {
    subGroupId: 'lower-back',
    groupId: 'back',
    label: 'Поясница (разгибатели)',
    test: (n) =>
      /thoracolumbar fascia|iliocostalis lumborum|longissimus thoracis|multifidus lumborum|quadratus lumborum/.test(
        n
      ),
  },
  {
    subGroupId: 'upper-chest',
    groupId: 'chest',
    label: 'Верх груди',
    test: (n) => /clavicular part.*pectoralis major/.test(n),
  },
  {
    subGroupId: 'mid-chest',
    groupId: 'chest',
    label: 'Середина груди',
    test: (n) => /sternocostal part.*pectoralis major.*upper/.test(n),
  },
  {
    subGroupId: 'lower-chest',
    groupId: 'chest',
    label: 'Низ груди',
    test: (n) =>
      /abdominal part.*pectoralis major|sternocostal part.*pectoralis major.*lower/.test(
        n
      ),
  },
  {
    subGroupId: 'front-delts',
    groupId: 'shoulders',
    label: 'Передняя дельта',
    test: (n) => /clavicular part.*deltoid/.test(n),
  },
  {
    subGroupId: 'side-delts',
    groupId: 'shoulders',
    label: 'Средняя дельта',
    test: (n) => /acromial part.*deltoid/.test(n),
  },
  {
    subGroupId: 'rear-delts',
    groupId: 'shoulders',
    label: 'Задняя дельта',
    test: (n) => /spinal part.*deltoid/.test(n),
  },
  {
    subGroupId: 'quads',
    groupId: 'legs',
    label: 'Квадрицепс',
    test: (n) => /rectus femoris|vastus (lateralis|medialis|intermedius)/.test(n),
  },
  {
    subGroupId: 'adductors',
    groupId: 'legs',
    label: 'Приводящие (внутренняя бедра)',
    test: (n) => /adductor (longus|magnus)|\bgracilis\b|\bsartorius\b/.test(n),
  },
  {
    subGroupId: 'glutes',
    groupId: 'legs',
    label: 'Ягодичные',
    test: (n) => /gluteus (maximus|medius)/.test(n),
  },
  {
    subGroupId: 'hamstrings',
    groupId: 'legs',
    label: 'Бицепс бедра',
    test: (n) => /biceps femoris|semitendinosus|semimembranosus/.test(n),
  },
  {
    subGroupId: 'calves',
    groupId: 'legs',
    label: 'Икры и камбаловидная',
    test: (n) => /gastrocnemius|\bsoleus\b/.test(n),
  },
  {
    subGroupId: 'abs-rectus',
    groupId: 'core',
    label: 'Прямая мышца (пресс)',
    test: (n) => /rectus abdominis|external oblique.*rectus-sheath/.test(n),
  },
  {
    subGroupId: 'obliques',
    groupId: 'core',
    label: 'Косые мышцы',
    test: (n) => /external oblique.*lateral-oblique/.test(n),
  },
  {
    subGroupId: 'serratus',
    groupId: 'core',
    label: 'Передняя зубчатая',
    test: (n) => /serratus anterior/.test(n),
  },
  {
    subGroupId: 'neck-scm',
    groupId: 'neck',
    label: 'Грудино-ключично-сосцевидная',
    test: (n) => /sternocleidomastoid/.test(n),
  },
];

interface CameraPreset {
  view: BodyView;
  offset: [number, number, number];
  preferLeftSide?: boolean;
  fallbackTarget: [number, number, number];
}

const CAMERA_PRESETS: Record<string, CameraPreset> = {
  biceps: {
    view: 'front',
    offset: [0.34, 0.05, 0.62],
    preferLeftSide: true,
    fallbackTarget: [0.24, 1.22, 0.02],
  },
  triceps: {
    view: 'back',
    offset: [0.36, 0.05, -0.62],
    preferLeftSide: true,
    fallbackTarget: [0.24, 1.22, -0.02],
  },
  brachialis: {
    view: 'front',
    offset: [0.54, 0.04, 0.44],
    preferLeftSide: true,
    fallbackTarget: [0.25, 1.18, 0.0],
  },
  'forearms-outer': {
    view: 'back',
    offset: [0.46, 0.04, -0.48],
    preferLeftSide: true,
    fallbackTarget: [0.28, 0.96, -0.01],
  },
  'forearms-inner': {
    view: 'front',
    offset: [0.22, 0.04, 0.56],
    preferLeftSide: true,
    fallbackTarget: [0.28, 0.96, 0.02],
  },
  'lats-upper': {
    view: 'back',
    offset: [0.0, 0.12, -0.98],
    fallbackTarget: [0, 1.26, -0.06],
  },
  'lats-lower': {
    view: 'back',
    offset: [0.0, 0.04, -0.96],
    fallbackTarget: [0, 1.09, -0.06],
  },
  'traps-upper': {
    view: 'back',
    offset: [0.0, 0.14, -0.82],
    fallbackTarget: [0, 1.46, -0.06],
  },
  'mid-back': {
    view: 'back',
    offset: [0.0, 0.08, -0.92],
    fallbackTarget: [0, 1.33, -0.08],
  },
  'lower-back': {
    view: 'back',
    offset: [0.0, 0.06, -0.92],
    fallbackTarget: [0, 1.04, -0.07],
  },
  'upper-chest': {
    view: 'front',
    offset: [0.0, 0.08, 0.85],
    fallbackTarget: [0, 1.37, 0.08],
  },
  'mid-chest': {
    view: 'front',
    offset: [0.0, 0.05, 0.85],
    fallbackTarget: [0, 1.29, 0.09],
  },
  'lower-chest': {
    view: 'front',
    offset: [0.0, -0.02, 0.88],
    fallbackTarget: [0, 1.22, 0.08],
  },
  'front-delts': {
    view: 'front',
    offset: [0.24, 0.08, 0.88],
    fallbackTarget: [0, 1.38, 0.05],
  },
  'side-delts': {
    view: 'front',
    offset: [0.85, 0.08, 0.35],
    preferLeftSide: true,
    fallbackTarget: [0.21, 1.38, 0.01],
  },
  'rear-delts': {
    view: 'back',
    offset: [0.26, 0.1, -0.92],
    fallbackTarget: [0, 1.38, -0.06],
  },
  quads: {
    view: 'front',
    offset: [0.0, 0.12, 1.16],
    fallbackTarget: [0, 0.66, 0.05],
  },
  adductors: {
    view: 'front',
    offset: [0.0, 0.08, 1.05],
    fallbackTarget: [0, 0.69, 0.03],
  },
  glutes: {
    view: 'back',
    offset: [0.16, 0.1, -1.0],
    fallbackTarget: [0, 0.86, -0.06],
  },
  hamstrings: {
    view: 'back',
    offset: [0.14, 0.1, -1.06],
    fallbackTarget: [0, 0.61, -0.05],
  },
  calves: {
    view: 'back',
    offset: [0.16, 0.06, -0.95],
    fallbackTarget: [0, 0.32, -0.04],
  },
  'abs-rectus': {
    view: 'front',
    offset: [0.08, 0.05, 0.92],
    fallbackTarget: [0, 1.08, 0.09],
  },
  obliques: {
    view: 'front',
    offset: [0.46, 0.06, 0.78],
    preferLeftSide: true,
    fallbackTarget: [0.13, 1.06, 0.04],
  },
  serratus: {
    view: 'front',
    offset: [0.68, 0.06, 0.62],
    preferLeftSide: true,
    fallbackTarget: [0.13, 1.2, 0.03],
  },
  'neck-scm': {
    view: 'front',
    offset: [0.34, 0.04, 0.68],
    fallbackTarget: [0, 1.52, 0.03],
  },
};

function isSkeletonOrNonMuscle(normName: string, ancestorNames: string[]): boolean {
  const joined = `${normName} ${ancestorNames.join(' ')}`;
  return /skeleton|bone|skull|cranium|mandible|rib|vertebra|sacrum|coccyx|pelvis|femur|tibia|fibula|humerus|radius|ulna|clavicle|scapula|sternum|patella|carpal|tarsal|phalang|metacarpal|metatarsal|cartilage|disc|tooth|teeth|eye|cornea|sclera/.test(
    joined
  );
}

/**
 * Splits a Three.js mesh into two sub-meshes based on a world-space triangle centroid predicate.
 */
function splitMeshByTrianglePredicate(
  mesh: THREE.Mesh,
  suffixA: string,
  suffixB: string,
  isPartA: (centroid: THREE.Vector3, worldBox: THREE.Box3) => boolean
) {
  const parent = mesh.parent;
  if (!parent) return;

  const geom = mesh.geometry;
  const posAttr = geom.getAttribute('position');
  if (!posAttr) return;

  const normAttr = geom.getAttribute('normal');
  const index = geom.getIndex();
  const triCount = index ? Math.floor(index.count / 3) : Math.floor(posAttr.count / 3);
  if (triCount === 0) return;

  mesh.updateWorldMatrix(true, false);
  const worldBox = new THREE.Box3().setFromObject(mesh);

  const posA: number[] = [];
  const normA: number[] = [];
  const posB: number[] = [];
  const normB: number[] = [];

  const v0 = new THREE.Vector3();
  const v1 = new THREE.Vector3();
  const v2 = new THREE.Vector3();
  const w0 = new THREE.Vector3();
  const w1 = new THREE.Vector3();
  const w2 = new THREE.Vector3();
  const centroid = new THREE.Vector3();

  for (let t = 0; t < triCount; t++) {
    const i0 = index ? index.getX(t * 3) : t * 3;
    const i1 = index ? index.getX(t * 3 + 1) : t * 3 + 1;
    const i2 = index ? index.getX(t * 3 + 2) : t * 3 + 2;

    v0.set(posAttr.getX(i0), posAttr.getY(i0), posAttr.getZ(i0));
    v1.set(posAttr.getX(i1), posAttr.getY(i1), posAttr.getZ(i1));
    v2.set(posAttr.getX(i2), posAttr.getY(i2), posAttr.getZ(i2));

    w0.copy(v0).applyMatrix4(mesh.matrixWorld);
    w1.copy(v1).applyMatrix4(mesh.matrixWorld);
    w2.copy(v2).applyMatrix4(mesh.matrixWorld);

    centroid.set(
      (w0.x + w1.x + w2.x) / 3,
      (w0.y + w1.y + w2.y) / 3,
      (w0.z + w1.z + w2.z) / 3
    );

    const useA = isPartA(centroid, worldBox);
    const targetPos = useA ? posA : posB;
    const targetNorm = useA ? normA : normB;

    targetPos.push(v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);

    if (normAttr) {
      targetNorm.push(
        normAttr.getX(i0),
        normAttr.getY(i0),
        normAttr.getZ(i0),
        normAttr.getX(i1),
        normAttr.getY(i1),
        normAttr.getZ(i1),
        normAttr.getX(i2),
        normAttr.getY(i2),
        normAttr.getZ(i2)
      );
    }
  }

  const buildHalf = (positions: number[], normals: number[], suffix: string) => {
    if (positions.length === 0) return;
    const halfGeom = new THREE.BufferGeometry();
    halfGeom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    if (normals.length === positions.length) {
      halfGeom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    } else {
      halfGeom.computeVertexNormals();
    }
    const halfMesh = new THREE.Mesh(halfGeom, mesh.material);
    halfMesh.name = `${mesh.name} ${suffix}`;
    halfMesh.position.copy(mesh.position);
    halfMesh.quaternion.copy(mesh.quaternion);
    halfMesh.scale.copy(mesh.scale);
    parent.add(halfMesh);
  };

  buildHalf(posA, normA, suffixA);
  buildHalf(posB, normB, suffixB);

  parent.remove(mesh);
  geom.dispose();
}

/**
 * Splits a Three.js mesh at a normalized Y fraction (0..1 of world height)
 * into upper and lower sub-meshes so latissimus dorsi and pectoralis major can be targeted separately.
 */
function splitMeshByWorldY(mesh: THREE.Mesh, splitFraction: number) {
  splitMeshByTrianglePredicate(mesh, 'upper', 'lower', (centroid, worldBox) => {
    const splitY = worldBox.min.y + (worldBox.max.y - worldBox.min.y) * splitFraction;
    return centroid.y >= splitY;
  });
}

/**
 * Splits external oblique along the linea semilunaris into the central anterior rectus sheath
 * (covering the 6-pack) and the lateral oblique flanks.
 */
function splitExternalObliqueByRectusWidth(mesh: THREE.Mesh, rectusHalfWidth: number) {
  splitMeshByTrianglePredicate(
    mesh,
    'rectus-sheath',
    'lateral-oblique',
    (centroid) => Math.abs(centroid.x) <= rectusHalfWidth * 1.02 && centroid.z > 0
  );
}

interface MeshMeta {
  mesh: THREE.Mesh;
  normName: string;
  subGroupId: string | null;
  groupId: string | null;
  label: string | null;
  isBone: boolean;
  center: THREE.Vector3;
}

export function MuscleAnatomyViewer({
  activeSubGroupId,
  activeLabel,
  onSelectMuscle,
}: MuscleAnatomyViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const preset = CAMERA_PRESETS[activeSubGroupId] ?? CAMERA_PRESETS.biceps;
  const [view, setView] = useState<BodyView>(preset.view);
  const [isZoomed, setIsZoomed] = useState<boolean>(true);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const activeSubRef = useRef<string>(activeSubGroupId);
  const viewRef = useRef<BodyView>(preset.view);
  const zoomedRef = useRef<boolean>(true);
  const onSelectRef = useRef(onSelectMuscle);

  const flyToRef = useRef<((subId: string, v: BodyView, zoomed: boolean) => void) | null>(
    null
  );
  const refreshMaterialsRef = useRef<((hoveredMesh: THREE.Mesh | null) => void) | null>(
    null
  );

  useEffect(() => {
    onSelectRef.current = onSelectMuscle;
  }, [onSelectMuscle]);

  useEffect(() => {
    activeSubRef.current = activeSubGroupId;
    const nextPreset = CAMERA_PRESETS[activeSubGroupId] ?? CAMERA_PRESETS.biceps;
    viewRef.current = nextPreset.view;
    zoomedRef.current = true;
    setView(nextPreset.view);
    setIsZoomed(true);

    refreshMaterialsRef.current?.(null);
    flyToRef.current?.(activeSubGroupId, nextPreset.view, true);
  }, [activeSubGroupId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let rafId = 0;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setLoadError('WebGL недоступен в текущем браузере.');
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'none';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const width = Math.max(container.clientWidth, 300);
    const height = Math.max(container.clientHeight, 400);
    renderer.setSize(width, height, false);

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.05, 50);
    camera.position.set(0.35, 1.35, 2.5);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 0.42;
    controls.maxDistance = 4.2;
    controls.maxPolarAngle = Math.PI * 0.92;
    controls.minPolarAngle = Math.PI * 0.12;
    controls.target.set(0, 1.0, 0);
    controls.update();

    // Studio Dark-Navy Lighting Rig
    const hemiLight = new THREE.HemisphereLight('#cbd5e1', '#0f172a', 1.05);
    scene.add(hemiLight);

    const frontKey = new THREE.DirectionalLight('#f8fafc', 1.35);
    frontKey.position.set(1.6, 2.3, 2.6);
    scene.add(frontKey);

    const frontFill = new THREE.DirectionalLight('#93c5fd', 0.55);
    frontFill.position.set(-2.2, 1.2, 1.8);
    scene.add(frontFill);

    const backRim = new THREE.DirectionalLight('#60a5fa', 1.3);
    backRim.position.set(-0.6, 2.1, -2.6);
    scene.add(backRim);

    const backFill = new THREE.DirectionalLight('#e2e8f0', 0.8);
    backFill.position.set(1.4, 1.5, -2.2);
    scene.add(backFill);

    // Subtle dark platform ring under feet
    const ringGeo = new THREE.RingGeometry(0.42, 0.44, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: '#3b82f6',
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const floorRing = new THREE.Mesh(ringGeo, ringMat);
    floorRing.rotation.x = -Math.PI / 2;
    floorRing.position.y = 0.002;
    scene.add(floorRing);

    // Shared sculptural materials
    const baseMuscleMat = new THREE.MeshStandardMaterial({
      color: '#25344d',
      roughness: 0.56,
      metalness: 0.08,
    });

    const boneMat = new THREE.MeshStandardMaterial({
      color: '#3a4962',
      roughness: 0.72,
      metalness: 0.05,
    });

    const hoverMuscleMat = new THREE.MeshStandardMaterial({
      color: '#3b82f6',
      emissive: '#1d4ed8',
      emissiveIntensity: 0.35,
      roughness: 0.42,
      metalness: 0.08,
    });

    const activeMuscleMat = new THREE.MeshStandardMaterial({
      color: '#ef4444',
      emissive: '#b91c1c',
      emissiveIntensity: 0.58,
      roughness: 0.34,
      metalness: 0.06,
    });

    const meshList: MeshMeta[] = [];
    const meshMap = new Map<THREE.Mesh, MeshMeta>();
    let modelHeight = 1.72;
    let hoveredMesh: THREE.Mesh | null = null;

    let isAutoFlying = false;
    const desiredCamPos = new THREE.Vector3(0.34, 1.28, 0.64);
    const desiredTarget = new THREE.Vector3(0.24, 1.22, 0.02);

    const stopAutoFly = () => {
      isAutoFlying = false;
    };
    controls.addEventListener('start', stopAutoFly);

    const applyMaterials = (nextHovered: THREE.Mesh | null) => {
      hoveredMesh = nextHovered;
      const activeSub = activeSubRef.current;
      const hoveredMeta = nextHovered ? meshMap.get(nextHovered) : null;
      const hoveredSub = hoveredMeta?.subGroupId ?? null;

      for (const meta of meshList) {
        if (meta.subGroupId && meta.subGroupId === activeSub) {
          meta.mesh.material = activeMuscleMat;
        } else if (meta.subGroupId && hoveredSub && meta.subGroupId === hoveredSub) {
          meta.mesh.material = hoverMuscleMat;
        } else if (meta.isBone) {
          meta.mesh.material = boneMat;
        } else {
          meta.mesh.material = baseMuscleMat;
        }
      }
    };
    refreshMaterialsRef.current = applyMaterials;

    const computeFlyTo = (subId: string, targetView: BodyView, zoomed: boolean) => {
      const cfg = CAMERA_PRESETS[subId] ?? CAMERA_PRESETS.biceps;

      if (!zoomed) {
        desiredTarget.set(0, modelHeight * 0.52, 0);
        desiredCamPos.set(0, modelHeight * 0.56, targetView === 'front' ? 2.65 : -2.65);
        isAutoFlying = true;
        return;
      }

      const matched = meshList.filter((m) => m.subGroupId === subId);
      const center = new THREE.Vector3(...cfg.fallbackTarget);

      if (matched.length > 0) {
        let candidates = matched;
        if (cfg.preferLeftSide) {
          const leftSide = matched.filter(
            (m) => m.normName.includes('left') || m.center.x > 0.04
          );
          if (leftSide.length > 0) candidates = leftSide;
        }

        const sum = new THREE.Vector3();
        for (const c of candidates) {
          sum.add(c.center);
        }
        center.copy(sum.divideScalar(candidates.length));
      }

      const [ox, oy, oz] = cfg.offset;
      const zSign = targetView === 'front' ? Math.abs(oz) : -Math.abs(oz);
      desiredTarget.copy(center);
      desiredCamPos.set(center.x + ox, center.y + oy, center.z + zSign);
      isAutoFlying = true;
    };
    flyToRef.current = computeFlyTo;

    // Load real 3D Écorché GLB
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    loader.load(
      '/models/ecorche.meshopt.glb',
      (gltf) => {
        if (disposed) return;

        const root = gltf.scene;
        const box = new THREE.Box3().setFromObject(root);
        const boxCenter = box.getCenter(new THREE.Vector3());
        modelHeight = Math.max(0.5, box.max.y - box.min.y);

        root.position.set(-boxCenter.x, -box.min.y, -boxCenter.z);
        scene.add(root);
        root.updateMatrixWorld(true);

        // Split latissimus dorsi, sternocostal pectoralis major, and external oblique before indexing
        const latMeshes: THREE.Mesh[] = [];
        const pecMeshes: THREE.Mesh[] = [];
        const obliqueMeshes: THREE.Mesh[] = [];
        let rectusHalfWidth = 0;

        root.traverse((obj) => {
          const m = obj as THREE.Mesh;
          if (!m.isMesh) return;
          const norm = (m.name || '').toLowerCase().replace(/_/g, ' ');
          if (/latissimus dorsi/.test(norm)) {
            latMeshes.push(m);
          } else if (/sternocostal part.*pectoralis major/.test(norm)) {
            pecMeshes.push(m);
          } else if (/external oblique/.test(norm)) {
            obliqueMeshes.push(m);
          } else if (/rectus abdominis/.test(norm)) {
            const b = new THREE.Box3().setFromObject(m);
            rectusHalfWidth = Math.max(rectusHalfWidth, Math.abs(b.min.x), Math.abs(b.max.x));
          }
        });
        if (rectusHalfWidth === 0) {
          rectusHalfWidth = 0.076;
        }
        for (const latMesh of latMeshes) {
          splitMeshByWorldY(latMesh, 0.56);
        }
        for (const pecMesh of pecMeshes) {
          splitMeshByWorldY(pecMesh, 0.42);
        }
        for (const obliqueMesh of obliqueMeshes) {
          splitExternalObliqueByRectusWidth(obliqueMesh, rectusHalfWidth);
        }
        root.updateMatrixWorld(true);

        root.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (!mesh.isMesh) return;

          const ancestors: string[] = [];
          let parent = mesh.parent;
          while (parent && parent !== root) {
            if (parent.name) ancestors.push(parent.name.toLowerCase());
            parent = parent.parent;
          }

          const rawName = mesh.name || ancestors[0] || '';
          const normName = rawName.toLowerCase().replace(/_/g, ' ');
          const matched = MUSCLE_MATCHERS.find((m) => m.test(normName));
          const isBone = !matched && isSkeletonOrNonMuscle(normName, ancestors);

          const meshBox = new THREE.Box3().setFromObject(mesh);
          const center = meshBox.getCenter(new THREE.Vector3());

          const meta: MeshMeta = {
            mesh,
            normName,
            subGroupId: matched?.subGroupId ?? null,
            groupId: matched?.groupId ?? null,
            label: matched?.label ?? null,
            isBone,
            center,
          };

          meshList.push(meta);
          meshMap.set(mesh, meta);
        });

        applyMaterials(null);
        computeFlyTo(activeSubRef.current, viewRef.current, zoomedRef.current);
        setIsLoaded(true);
      },
      (progress) => {
        if (disposed) return;
        if (progress.total > 0) {
          setLoadProgress(Math.min(99, Math.round((progress.loaded / progress.total) * 100)));
        }
      },
      () => {
        if (disposed) return;
        setLoadError('Не удалось загрузить 3D-модель анатомии.');
      }
    );

    // Interactive Raycasting for Hover & Click-to-Select
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    let downX = 0;
    let downY = 0;

    const getHitMeta = (clientX: number, clientY: number): MeshMeta | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(
        meshList.map((m) => m.mesh),
        false
      );
      for (const hit of hits) {
        const meta = meshMap.get(hit.object as THREE.Mesh);
        if (meta && meta.subGroupId) return meta;
        if (meta) return null;
      }
      return null;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.buttons !== 0) return;
      const meta = getHitMeta(e.clientX, e.clientY);
      const nextMesh = meta?.mesh ?? null;
      if (nextMesh !== hoveredMesh) {
        applyMaterials(nextMesh);
      }
      renderer.domElement.style.cursor = meta ? 'pointer' : 'grab';
      setHoveredLabel(meta?.label ?? null);
    };

    const handlePointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const handlePointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (dist > 6) return;
      const meta = getHitMeta(e.clientX, e.clientY);
      if (meta && meta.groupId && meta.subGroupId) {
        onSelectRef.current(meta.groupId, meta.subGroupId);
      }
    };

    const handlePointerLeave = () => {
      if (hoveredMesh) {
        applyMaterials(null);
      }
      setHoveredLabel(null);
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointermove', handlePointerMove);
    domEl.addEventListener('pointerdown', handlePointerDown);
    domEl.addEventListener('pointerup', handlePointerUp);
    domEl.addEventListener('pointerleave', handlePointerLeave);

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.max(240, Math.floor(entry.contentRect.width));
      const h = Math.max(320, Math.floor(entry.contentRect.height));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    });
    resizeObserver.observe(container);

    let lastTime = performance.now();
    const animate = (now: number) => {
      if (disposed) return;
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (isAutoFlying) {
        const factor = 1 - Math.exp(-6.5 * dt);
        camera.position.lerp(desiredCamPos, factor);
        controls.target.lerp(desiredTarget, factor);

        if (
          camera.position.distanceToSquared(desiredCamPos) < 0.0002 &&
          controls.target.distanceToSquared(desiredTarget) < 0.0002
        ) {
          camera.position.copy(desiredCamPos);
          controls.target.copy(desiredTarget);
          isAutoFlying = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(animate);
    };
    rafId = window.requestAnimationFrame(animate);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', stopAutoFly);
      domEl.removeEventListener('pointermove', handlePointerMove);
      domEl.removeEventListener('pointerdown', handlePointerDown);
      domEl.removeEventListener('pointerup', handlePointerUp);
      domEl.removeEventListener('pointerleave', handlePointerLeave);

      controls.dispose();
      baseMuscleMat.dispose();
      boneMat.dispose();
      hoverMuscleMat.dispose();
      activeMuscleMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();

      scene.traverse((obj) => {
        const m = obj as THREE.Mesh;
        if (m.isMesh && m.geometry) {
          m.geometry.dispose();
        }
      });

      renderer.dispose();
      if (domEl.parentNode === container) {
        container.removeChild(domEl);
      }
    };
  }, []);

  const handleSetView = (nextView: BodyView) => {
    setView(nextView);
    viewRef.current = nextView;
    flyToRef.current?.(activeSubRef.current, nextView, zoomedRef.current);
  };

  const handleToggleZoom = () => {
    const nextZoom = !isZoomed;
    setIsZoomed(nextZoom);
    zoomedRef.current = nextZoom;
    flyToRef.current?.(activeSubRef.current, viewRef.current, nextZoom);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0A1120] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      {/* Top Camera HUD Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#05080E]/85 px-4 py-3">
        <div className="flex items-center gap-2">
          <Crosshair size={15} weight="regular" className="text-[#EF4444]" aria-hidden="true" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#F1F5F9]">
            3D • {view === 'front' ? 'Вид спереди' : 'Вид сзади'}
          </span>
          <span className="rounded border border-white/10 bg-[#0A1120] px-1.5 py-0.5 font-mono text-[10px] text-[#93C5FD]">
            {isZoomed ? 'ФОКУС' : 'ВЕСЬ РОСТ'}
          </span>
        </div>

        {/* Manual Orbit & Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <div
            role="group"
            aria-label="Сторона тела"
            className="inline-flex rounded-lg border border-white/10 bg-[#0A1120] p-0.5"
          >
            <button
              type="button"
              onClick={() => handleSetView('front')}
              aria-pressed={view === 'front'}
              className={`rounded-md px-2 py-1 font-mono text-[11px] font-semibold transition-colors ${
                view === 'front'
                  ? 'bg-[#182742] text-white'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Спереди
            </button>
            <button
              type="button"
              onClick={() => handleSetView('back')}
              aria-pressed={view === 'back'}
              className={`rounded-md px-2 py-1 font-mono text-[11px] font-semibold transition-colors ${
                view === 'back'
                  ? 'bg-[#182742] text-white'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Сзади
            </button>
          </div>

          <button
            type="button"
            onClick={handleToggleZoom}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#0A1120] px-2.5 py-1.5 font-mono text-[11px] font-semibold text-[#CBD5E1] transition-colors hover:border-[#3B82F6] hover:text-white"
            aria-label={isZoomed ? 'Показать весь рост' : 'Приблизить к мышце'}
          >
            {isZoomed ? (
              <>
                <MagnifyingGlassMinus size={14} weight="regular" aria-hidden="true" />
                <span className="hidden sm:inline">Весь рост</span>
              </>
            ) : (
              <>
                <MagnifyingGlassPlus size={14} weight="regular" aria-hidden="true" />
                <span className="hidden sm:inline">Фокус</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Stage */}
      <div className="relative h-[440px] w-full overflow-hidden bg-[#05080E] bg-blueprint-grid sm:h-[520px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(59,130,246,0.12),transparent_65%)]"
        />

        <div
          ref={containerRef}
          className="relative z-10 h-full w-full"
          aria-label={`Интерактивная 3D-модель мышц человека, активная зона: ${activeLabel}`}
        />

        {/* Loading Overlay */}
        {!isLoaded && !loadError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#05080E]/85 px-6 text-center backdrop-blur-sm">
            <div className="h-2 w-48 overflow-hidden rounded-full bg-[#111C30]">
              <div
                className="h-full bg-[#3B82F6] transition-all duration-200"
                style={{ width: `${Math.max(10, loadProgress)}%` }}
              />
            </div>
            <div className="mt-3 font-mono text-xs text-[#93C5FD] tabular-nums">
              Загрузка 3D-анатомии... {loadProgress > 0 ? `${loadProgress}%` : ''}
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {loadError && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#05080E]/90 px-6 text-center text-sm text-rose-300">
            {loadError}
          </div>
        )}

        {/* Bottom HUD Pill */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 rounded-lg border border-red-500/45 bg-[#05080E]/90 px-3 py-1.5 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[#EF4444]" aria-hidden="true" />
            <span className="text-xs font-semibold text-[#F1F5F9]">
              {hoveredLabel ?? activeLabel}
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleSetView(view === 'front' ? 'back' : 'front')}
            className="pointer-events-auto inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#05080E]/90 px-2.5 py-1.5 font-mono text-[11px] text-[#94A3B8] backdrop-blur-md transition-colors hover:border-[#3B82F6] hover:text-white"
            aria-label="Развернуть 3D-модель"
          >
            <ArrowsClockwise size={13} weight="regular" aria-hidden="true" />
            <span>Повернуть</span>
          </button>
        </div>
      </div>

      {/* Attribution & Hint Footer */}
      <div className="border-t border-white/10 bg-[#05080E]/85 px-4 py-2.5 text-center font-mono text-[10px] text-[#94A3B8]">
        3D-анатомия: Écorché (BodyParts3D / Z-Anatomy, CC BY-SA 4.0) • Вращайте мышью 360° и кликайте по мышцам
      </div>
    </div>
  );
}
