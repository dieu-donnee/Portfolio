/**
 * D⁴Dev — About Page Three.js Scene
 * 1. Background hero particles (subtle) on #about-canvas
 * 2. Torus Knot glass material on #torus-canvas
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';
import { makeResponsive, createMouseTracker, lerp, rand, COLORS, initNavbar, initMobileMenu, initAnimateOnScroll } from './utils.js';

// ═══════════════════════════════════════════════════════════════
// 1. HERO BACKGROUND PARTICLES — #about-canvas
// ═══════════════════════════════════════════════════════════════
const heroBg = document.getElementById('about-canvas');
if (heroBg) {
    const bgRenderer = new THREE.WebGLRenderer({ canvas: heroBg, alpha: true, antialias: false });
    bgRenderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    bgRenderer.setSize(innerWidth, innerHeight);
    bgRenderer.setClearColor(0x000000, 0);

    const bgScene  = new THREE.Scene();
    const bgCamera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
    bgCamera.position.z = 5;

    window.addEventListener('resize', () => {
        bgRenderer.setSize(innerWidth, innerHeight);
        bgCamera.aspect = innerWidth / innerHeight;
        bgCamera.updateProjectionMatrix();
    });

    // Sparse floating particles
    const N = 2000;
    const bPositions = new Float32Array(N * 3);
    const bColors    = new Float32Array(N * 3);
    const palette = [new THREE.Color(COLORS.rose), new THREE.Color(COLORS.lavender), new THREE.Color(COLORS.white)];

    for (let i = 0; i < N; i++) {
        bPositions[i * 3]     = rand(-8, 8);
        bPositions[i * 3 + 1] = rand(-8, 8);
        bPositions[i * 3 + 2] = rand(-5, 2);
        const c = palette[Math.floor(rand(0, palette.length))];
        bColors[i * 3] = c.r; bColors[i * 3 + 1] = c.g; bColors[i * 3 + 2] = c.b;
    }
    const bGeo = new THREE.BufferGeometry();
    bGeo.setAttribute('position', new THREE.BufferAttribute(bPositions, 3));
    bGeo.setAttribute('color',    new THREE.BufferAttribute(bColors, 3));

    const bMat = new THREE.PointsMaterial({
        vertexColors: true, size: 0.04, transparent: true,
        opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    bgScene.add(new THREE.Points(bGeo, bMat));

    const bgMouse = createMouseTracker();
    const bgClock = new THREE.Clock();
    function bgAnimate() {
        requestAnimationFrame(bgAnimate);
        const t = bgClock.getElapsedTime();
        bgScene.children[0].rotation.y = t * 0.04 + bgMouse.x * 0.2;
        bgScene.children[0].rotation.x = t * 0.02 + bgMouse.y * 0.15;
        bgRenderer.render(bgScene, bgCamera);
    }
    bgAnimate();
}

// ═══════════════════════════════════════════════════════════════
// 2. TORUS KNOT GLASS — #torus-canvas
// ═══════════════════════════════════════════════════════════════
const torusCanvas = document.getElementById('torus-canvas');
if (torusCanvas) {
    const container = torusCanvas.parentElement;
    const renderer  = new THREE.WebGLRenderer({ canvas: torusCanvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 4.5;

    window.addEventListener('resize', () => {
        const w = container.clientWidth, h = container.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    });

    // Torus Knot — glass material
    const geo = new THREE.TorusKnotGeometry(1.2, 0.38, 160, 20, 2, 3);
    const mat = new THREE.MeshPhysicalMaterial({
        color: 0xE8467C, metalness: 0.05, roughness: 0.05,
        transmission: 0.85, thickness: 1.2, ior: 1.5,
        transparent: true, opacity: 0.92,
        clearcoat: 1, clearcoatRoughness: 0, side: THREE.DoubleSide,
    });
    const torus = new THREE.Mesh(geo, mat);
    scene.add(torus);

    // Wireframe overlay
    const wire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
        color: 0x9B5DE5, wireframe: true, transparent: true, opacity: 0.07,
    }));
    scene.add(wire);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const rosePt = new THREE.PointLight(0xE8467C, 3, 10); rosePt.position.set(3, 2, 2); scene.add(rosePt);
    const lavPt  = new THREE.PointLight(0x9B5DE5, 3, 10); lavPt.position.set(-3, -2, 2); scene.add(lavPt);
    const goldPt = new THREE.PointLight(0xF8B500, 1.5, 8); goldPt.position.set(0, 3, -2); scene.add(goldPt);

    const mouse = createMouseTracker();
    const curRot = { x: 0, y: 0 };
    const clock  = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();
        curRot.x = lerp(curRot.x, mouse.y * 0.5, 0.03);
        curRot.y = lerp(curRot.y, mouse.x * 0.8, 0.03);
        torus.rotation.x = curRot.x + t * 0.18;
        torus.rotation.y = curRot.y + t * 0.24;
        wire.rotation.copy(torus.rotation);
        rosePt.intensity = 2.5 + Math.sin(t * 1.2) * 0.8;
        lavPt.intensity  = 2.5 + Math.cos(t * 0.9) * 0.8;
        renderer.render(scene, camera);
    }
    animate();
}

// ═══════════════════════════════════════════════════════════════
// UI — Only called once
// ─── UI Initializers ──────────────────────────────────────────
initNavbar();
initMobileMenu();
initAnimateOnScroll();
