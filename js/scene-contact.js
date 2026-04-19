/**
 * D⁴Dev — Contact Page Three.js Scene
 * Gentle undulating wave plane
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';
import { initNavbar, initMobileMenu } from './utils.js';

const canvas = document.getElementById('contact-canvas');
if (canvas) {
    // ─── Renderer ────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setSize(innerWidth, innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 100);
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);

    window.addEventListener('resize', () => {
        renderer.setSize(innerWidth, innerHeight);
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
    });

    // ─── Wave Plane ──────────────────────────────────────────────
    const W = 40, H = 40, SEG = 60;
    const planeGeo = new THREE.PlaneGeometry(W, H, SEG, SEG);
    planeGeo.rotateX(-Math.PI / 2.5);

    // Gradient colors per vertex
    const planePos = planeGeo.attributes.position;
    const planeColors = new Float32Array(planePos.count * 3);
    const cRose = new THREE.Color(0xE8467C);
    const cLav  = new THREE.Color(0x9B5DE5);

    for (let i = 0; i < planePos.count; i++) {
        const u = (planePos.getX(i) / W) + 0.5;
        const c = cRose.clone().lerp(cLav, u);
        planeColors[i * 3]     = c.r;
        planeColors[i * 3 + 1] = c.g;
        planeColors[i * 3 + 2] = c.b;
    }
    planeGeo.setAttribute('color', new THREE.BufferAttribute(planeColors, 3));

    // Store original Y positions for wave animation
    const origY = new Float32Array(planePos.count);
    for (let i = 0; i < planePos.count; i++) {
        origY[i] = planePos.getY(i);
    }

    const planeMat = new THREE.MeshBasicMaterial({
        vertexColors: true,
        wireframe: true,
        transparent: true,
        opacity: 0.18,
    });

    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.position.y = -1;
    scene.add(plane);

    // Solid wave (subtle)
    const solidMat = new THREE.MeshBasicMaterial({
        color: 0xE8467C,
        transparent: true,
        opacity: 0.04,
        side: THREE.DoubleSide,
    });
    const solidPlane = new THREE.Mesh(planeGeo.clone(), solidMat);
    solidPlane.position.y = -1;
    scene.add(solidPlane);

    // ─── Floating particles ───────────────────────────────────────
    const pCount = 300;
    const pGeo   = new THREE.BufferGeometry();
    const pPos   = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
        pPos[i * 3]     = (Math.random() - 0.5) * 20;
        pPos[i * 3 + 1] = Math.random() * 6 - 1;
        pPos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xF472A8,
        size: 0.06,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    scene.add(new THREE.Points(pGeo, pMat));

    // ─── Animate ─────────────────────────────────────────────────
    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        // Wave animation
        for (let i = 0; i < planePos.count; i++) {
            const x = planeGeo.attributes.position.getX(i);
            const z = planeGeo.attributes.position.getZ(i);
            const wave = Math.sin(x * 0.5 + t * 0.8) * 0.35
                       + Math.sin(z * 0.4 + t * 0.6) * 0.25
                       + Math.cos((x + z) * 0.3 + t * 0.5) * 0.2;
            planeGeo.attributes.position.setY(i, origY[i] + wave);
        }
        planeGeo.attributes.position.needsUpdate = true;
        planeGeo.computeVertexNormals();

        // Gentle camera sway
        camera.position.x = Math.sin(t * 0.2) * 0.5;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }
    animate();
}

// ─── UI ─────────────────────────────────────────────────────────
initNavbar();
initMobileMenu();

// Contact form submit
const form = document.getElementById('contactForm');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submitBtn');
        const originalBtnText = submitBtn.innerText;
        
        // Basic validation
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        submitBtn.innerText = 'Envoi en cours...';
        submitBtn.disabled = true;

        try {
            const data = new FormData(form);
            const response = await fetch(form.action, {
                method: form.method,
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const successMsg = document.getElementById('formSuccess');
                if (successMsg) {
                    form.style.display = 'none';
                    successMsg.classList.add('show');
                }
            } else {
                alert("Oups! Il y a eu un problème lors de l'envoi de votre message.");
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            alert("Erreur de réseau. Veuillez réessayer.");
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}
