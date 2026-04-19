/**
 * D⁴Dev — Skills Page Three.js Scene
 * Pulsing Icosahedron Sphere with wireframe
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';
import { makeResponsive, createMouseTracker, lerp, initNavbar, initMobileMenu, initAnimateOnScroll } from './utils.js';

const canvas = document.getElementById('skills-canvas');
if (canvas) {
    // ─── Renderer ────────────────────────────────────────────────
    const container = canvas.parentElement;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);

    // ─── Scene & Camera ─────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 4);

    const onResize = () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    // ─── Icosahedron ─────────────────────────────────────────────
    const icoGeo = new THREE.IcosahedronGeometry(1.5, 2);

    // Solid sphere (gradient effect via vertex colors)
    const positions = icoGeo.attributes.position;
    const colorsArr = new Float32Array(positions.count * 3);
    const cRose = new THREE.Color(0xE8467C);
    const cLav  = new THREE.Color(0x9B5DE5);

    for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i); // -1 to 1 range
        const t = (y + 1.5) / 3;    // normalize
        const c = cRose.clone().lerp(cLav, t);
        colorsArr[i * 3]     = c.r;
        colorsArr[i * 3 + 1] = c.g;
        colorsArr[i * 3 + 2] = c.b;
    }
    icoGeo.setAttribute('color', new THREE.BufferAttribute(colorsArr, 3));

    const icoMat = new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        metalness: 0.2,
        roughness: 0.15,
        transmission: 0.5,
        thickness: 0.8,
        transparent: true,
        opacity: 0.85,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        side: THREE.DoubleSide,
    });

    const sphere = new THREE.Mesh(icoGeo, icoMat);
    scene.add(sphere);

    // Wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({
        color: 0xF8B500,
        wireframe: true,
        transparent: true,
        opacity: 0.12,
    });
    const wireframe = new THREE.Mesh(icoGeo, wireMat);
    scene.add(wireframe);

    // Outer glow sphere (larger, transparent)
    const glowGeo = new THREE.IcosahedronGeometry(1.9, 1);
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0xE8467C,
        transparent: true,
        opacity: 0.03,
        side: THREE.BackSide,
    });
    const glowSphere = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glowSphere);

    // ─── Orbiting Particles ──────────────────────────────────────
    const orbitCount = 80;
    const orbitGeo   = new THREE.BufferGeometry();
    const orbitPos   = new Float32Array(orbitCount * 3);
    const orbitAngles = [];

    for (let i = 0; i < orbitCount; i++) {
        const angle  = Math.random() * Math.PI * 2;
        const phi    = Math.acos(Math.random() * 2 - 1);
        const radius = 1.9 + Math.random() * 0.5;
        orbitAngles.push({ angle, phi, radius, speed: 0.003 + Math.random() * 0.005 });
        orbitPos[i * 3]     = radius * Math.sin(phi) * Math.cos(angle);
        orbitPos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(angle);
        orbitPos[i * 3 + 2] = radius * Math.cos(phi);
    }
    orbitGeo.setAttribute('position', new THREE.BufferAttribute(orbitPos, 3));

    const orbitMat = new THREE.PointsMaterial({
        color: 0xF472A8,
        size: 0.04,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    const orbitParticles = new THREE.Points(orbitGeo, orbitMat);
    scene.add(orbitParticles);

    // ─── Lights ──────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const rosePt = new THREE.PointLight(0xE8467C, 3, 10);
    rosePt.position.set(2, 1, 2);
    scene.add(rosePt);
    const lavPt = new THREE.PointLight(0x9B5DE5, 3, 10);
    lavPt.position.set(-2, -1, -1);
    scene.add(lavPt);

    // ─── Mouse ─────────────────────────────────────────────────
    const mouse = createMouseTracker();
    const curRot = { x: 0, y: 0 };

    // ─── Animate ──────────────────────────────────────────────
    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        // Sphere pulsation
        const pulse = 1 + Math.sin(t * 1.5) * 0.04;
        sphere.scale.setScalar(pulse);
        glowSphere.scale.setScalar(pulse * 1.1);

        // Mouse parallax rotation
        curRot.x = lerp(curRot.x, mouse.y * 0.5, 0.04);
        curRot.y = lerp(curRot.y, mouse.x * 0.8, 0.04);
        sphere.rotation.x = curRot.x + t * 0.1;
        sphere.rotation.y = curRot.y + t * 0.15;
        wireframe.rotation.copy(sphere.rotation);
        glowSphere.rotation.y = t * 0.05;

        // Update orbiting particles
        for (let i = 0; i < orbitCount; i++) {
            orbitAngles[i].angle += orbitAngles[i].speed;
            const { angle, phi, radius } = orbitAngles[i];
            orbitPos[i * 3]     = radius * Math.sin(phi) * Math.cos(angle);
            orbitPos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(angle);
            orbitPos[i * 3 + 2] = radius * Math.cos(phi);
        }
        orbitGeo.attributes.position.needsUpdate = true;
        orbitParticles.rotation.y = t * 0.05;
        orbitParticles.rotation.x = Math.sin(t * 0.3) * 0.3;

        // Pulsing lights
        rosePt.intensity = 2.5 + Math.sin(t * 1.2) * 1;
        lavPt.intensity  = 2.5 + Math.cos(t * 0.8) * 1;

        renderer.render(scene, camera);
    }
    animate();
}

// ─── UI ────────────────────────────────────────────────────────
initNavbar();
initMobileMenu();
initAnimateOnScroll();

// Animate skill bars
document.querySelectorAll('.skill-fill').forEach(fill => {
    const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
            fill.style.width = fill.dataset.width || '80%';
            observer.disconnect();
        }
    }, { threshold: 0.5 });
    observer.observe(fill);
});
