/**
 * D⁴Dev — Hero Three.js Scene
 * 5 000 particles that breathe & react to mouse
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';
import { makeResponsive, createMouseTracker, lerp, rand, COLORS, initNavbar, initMobileMenu, initAnimateOnScroll } from './utils.js';

// ─── Init Renderer ─────────────────────────────────────────────
const canvas = document.getElementById('hero-canvas');
if (canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    renderer.setClearColor(0x000000, 0);

    // ─── Scene & Camera ────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
    camera.position.set(0, 0, 5);

    // ─── Particles ─────────────────────────────────────────────────
    const COUNT   = 5000;
    const positions = new Float32Array(COUNT * 3);
    const colors    = new Float32Array(COUNT * 3);
    const sizes     = new Float32Array(COUNT);
    const velocities = [];

    const colorsArr = [
        new THREE.Color(COLORS.rose),
        new THREE.Color(COLORS.lavender),
        new THREE.Color(COLORS.roseLight),
        new THREE.Color(COLORS.white),
    ];

    for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3;
        // spread in a sphere
        const theta = rand(0, Math.PI * 2);
        const phi   = Math.acos(rand(-1, 1));
        const r     = rand(1.5, 6);

        positions[i3]     = r * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = r * Math.cos(phi);

        const c = colorsArr[Math.floor(rand(0, colorsArr.length))];
        colors[i3]     = c.r;
        colors[i3 + 1] = c.g;
        colors[i3 + 2] = c.b;

        sizes[i] = rand(1, 3.5);
        velocities.push({
            x: rand(-0.002, 0.002),
            y: rand(-0.002, 0.002),
            z: rand(-0.002, 0.002),
        });
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `
            attribute float size;
            varying vec3 vColor;
            uniform float uTime;
            void main() {
                vColor = color;
                vec3 pos = position;
                // gentle breathing
                float wave = sin(uTime * 0.8 + length(pos) * 0.5) * 0.04;
                pos += normalize(pos) * wave;
                vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (220.0 / -mvPos.z);
                gl_Position  = projectionMatrix * mvPos;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            void main() {
                float d = length(gl_PointCoord - 0.5) * 2.0;
                if (d > 1.0) discard;
                float alpha = 1.0 - smoothstep(0.4, 1.0, d);
                gl_FragColor = vec4(vColor, alpha * 0.85);
            }
        `,
        uniforms: { uTime: { value: 0 } },
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // ─── Mouse Interaction ─────────────────────────────────────────
    const mouse = createMouseTracker();
    const targetRot = { x: 0, y: 0 };
    const currentRot = { x: 0, y: 0 };

    // ─── Light Ring (optional soft ambient) ────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // ─── Resize ────────────────────────────────────────────────────
    makeResponsive(renderer, camera);

    // ─── Animate ───────────────────────────────────────────────────
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        mat.uniforms.uTime.value = t;

        // Drift particles slowly
        for (let i = 0; i < COUNT; i++) {
            const i3 = i * 3;
            positions[i3]     += velocities[i].x;
            positions[i3 + 1] += velocities[i].y;
            positions[i3 + 2] += velocities[i].z;

            // Boundary wrap
            if (Math.abs(positions[i3])     > 7) velocities[i].x *= -1;
            if (Math.abs(positions[i3 + 1]) > 7) velocities[i].y *= -1;
            if (Math.abs(positions[i3 + 2]) > 7) velocities[i].z *= -1;
        }
        geo.attributes.position.needsUpdate = true;

        // Mouse-driven rotation
        targetRot.x = mouse.y * 0.4;
        targetRot.y = mouse.x * 0.6;
        currentRot.x = lerp(currentRot.x, targetRot.x, 0.04);
        currentRot.y = lerp(currentRot.y, targetRot.y, 0.04);

        points.rotation.x = currentRot.x + t * 0.04;
        points.rotation.y = currentRot.y + t * 0.06;

        renderer.render(scene, camera);
    }
    animate();
}


// ─── UI Initializers ──────────────────────────────────────────
initNavbar();
initMobileMenu();
initAnimateOnScroll();
