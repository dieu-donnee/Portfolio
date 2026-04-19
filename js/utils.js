/**
 * D⁴Dev Portfolio — Three.js Utilities
 * Shared helpers for all 3D scenes
 */

// ─── Responsive Renderer ───────────────────────────────────────
export function makeResponsive(renderer, camera) {
    const onResize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);
    return onResize;
}

// ─── Mouse Tracker ─────────────────────────────────────────────
export function createMouseTracker() {
    const mouse = { x: 0, y: 0, px: 0, py: 0 };
    window.addEventListener('mousemove', (e) => {
        mouse.px = mouse.x;
        mouse.py = mouse.y;
        mouse.x = (e.clientX / window.innerWidth)  * 2 - 1;
        mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    });
    return mouse;
}

// ─── Brand Colors as Three.js hex ──────────────────────────────
export const COLORS = {
    rose:     0xE8467C,
    roseLight:0xF472A8,
    lavender: 0x9B5DE5,
    gold:     0xF8B500,
    white:    0xF0EDF8,
    dark:     0x0A0A0F,
};

// ─── Easing ────────────────────────────────────────────────────
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

// ─── Random in range ───────────────────────────────────────────
export function rand(min, max) {
    return Math.random() * (max - min) + min;
}


// ─── Navbar scroll effect ──────────────────────────────────────
export function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ─── Mobile Menu ────────────────────────────────────────────────
export function initMobileMenu() {
    const hamburger = document.querySelector('.nav-hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (!hamburger || !mobileMenu) return;
    hamburger.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
        hamburger.classList.toggle('active');
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            hamburger.classList.remove('active');
        });
    });
}

// ─── Scroll Animations ──────────────────────────────────────────
export function initAnimateOnScroll() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}
