/* ===== DEV PORTFOLIO - 3D SCROLL-BASED PORTFOLIO ===== */

// ===== PRELOADER =====
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('preloader').classList.add('hidden');
        initAnimations();
    }, 300);
});

// ===== CUSTOM CURSOR =====
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
});

function animateCursor() {
    const ringX = parseFloat(cursorRing.style.left || 0);
    const ringY = parseFloat(cursorRing.style.top || 0);
    cursorRing.style.left = ringX + (mouseX - ringX) * 0.15 + 'px';
    cursorRing.style.top = ringY + (mouseY - ringY) * 0.15 + 'px';
    requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a, button, .project-card, .skill-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
});

// ===== THREE.JS 3D BACKGROUND =====
const canvas = document.getElementById('bg-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
camera.position.z = 30;

// Particles
const particleCount = 400;
const particleGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    const color = new THREE.Color();
    color.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.6);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
}
particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particleMaterial = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});
const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

// Floating Geometric Objects
const objects = [];
const geometries = [
    new THREE.IcosahedronGeometry(1.5, 0),
    new THREE.OctahedronGeometry(1.2, 0),
    new THREE.TorusGeometry(1, 0.4, 8, 16),
    new THREE.TetrahedronGeometry(1.3, 0),
    new THREE.TorusKnotGeometry(0.8, 0.3, 64, 8)
];

for (let i = 0; i < 8; i++) {
    const geo = geometries[i % geometries.length];
    const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.6 + Math.random() * 0.3, 0.7, 0.5),
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 20
    );
    mesh.userData = {
        rotSpeed: { x: Math.random() * 0.01, y: Math.random() * 0.01, z: Math.random() * 0.005 },
        floatSpeed: 0.3 + Math.random() * 0.5,
        floatOffset: Math.random() * Math.PI * 2,
        origY: mesh.position.y
    };
    scene.add(mesh);
    objects.push(mesh);
}

// Hero Section 3D Object
const heroScene = new THREE.Scene();
const heroCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
heroCamera.position.z = 5;
let heroRenderer = null;
const heroContainer = document.getElementById('hero3d');

if (heroContainer) {
    heroRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    heroRenderer.setSize(heroContainer.clientWidth, heroContainer.clientHeight);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    heroContainer.appendChild(heroRenderer.domElement);

    // Create a complex shape for hero
    const torusKnot = new THREE.Mesh(
        new THREE.TorusKnotGeometry(1.5, 0.5, 128, 32),
        new THREE.MeshNormalMaterial({ wireframe: false, flatShading: true })
    );
    heroScene.add(torusKnot);

    // Add wireframe overlay
    const wireframe = new THREE.Mesh(
        new THREE.TorusKnotGeometry(1.52, 0.52, 128, 32),
        new THREE.MeshBasicMaterial({ color: 0x667eea, wireframe: true, transparent: true, opacity: 0.2 })
    );
    heroScene.add(wireframe);

    // Orbiting rings
    for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(2.5 + i * 0.3, 0.02, 8, 64),
            new THREE.MeshBasicMaterial({ color: 0x667eea, transparent: true, opacity: 0.4 - i * 0.1 })
        );
        ring.rotation.x = Math.PI / 3 + i * 0.3;
        ring.rotation.y = i * 0.5;
        heroScene.add(ring);
    }
}

// Mouse interaction
let targetRotX = 0, targetRotY = 0;
document.addEventListener('mousemove', (e) => {
    targetRotX = (e.clientY / window.innerHeight - 0.5) * 0.5;
    targetRotY = (e.clientX / window.innerWidth - 0.5) * 0.5;
});

// Scroll position
let scrollY = 0;
window.addEventListener('scroll', () => { scrollY = window.scrollY; });

// Animation loop
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Rotate particles based on scroll
    particles.rotation.y = elapsed * 0.05 + scrollY * 0.0003;
    particles.rotation.x = elapsed * 0.03 + scrollY * 0.0001;

    // Animate floating objects
    objects.forEach(obj => {
        obj.rotation.x += obj.userData.rotSpeed.x;
        obj.rotation.y += obj.userData.rotSpeed.y;
        obj.rotation.z += obj.userData.rotSpeed.z;
        obj.position.y = obj.userData.origY + Math.sin(elapsed * obj.userData.floatSpeed + obj.userData.floatOffset) * 2;
    });

    // Camera follows mouse
    camera.rotation.x += (targetRotX * 0.2 - camera.rotation.x) * 0.05;
    camera.rotation.y += (targetRotY * 0.2 - camera.rotation.y) * 0.05;

    renderer.render(scene, camera);

    // Hero 3D
    if (heroRenderer) {
        heroScene.children.forEach((child, i) => {
            child.rotation.x += 0.005;
            child.rotation.y += 0.008;
            if (i > 2) { // rings
                child.rotation.z += 0.003 * (i - 2);
            }
        });
        heroRenderer.render(heroScene, heroCamera);
    }
}
animate();

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (heroRenderer && heroContainer) {
        heroRenderer.setSize(heroContainer.clientWidth, heroContainer.clientHeight);
    }
});

// ===== SCROLL PROGRESS =====
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    document.getElementById('scrollProgress').style.width = progress + '%';
});

// ===== NAVBAR SCROLL =====
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
});

// Active nav link
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 200;
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        const link = document.querySelector(`.nav-link[href="#${id}"]`);
        if (link) {
            link.classList.toggle('active', scrollPos >= top && scrollPos < top + height);
        }
    });
});

// ===== TYPEWRITER =====
const typewriterEl = document.getElementById('typewriter');
const words = ['Websites.', 'Mobile Apps.', 'Full-Stack Apps.', 'Admin Panels.', 'Solutions.'];
let wordIndex = 0, charIndex = 0, isDeleting = false;

function typeWrite() {
    const current = words[wordIndex];
    if (isDeleting) {
        typewriterEl.textContent = current.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typewriterEl.textContent = current.substring(0, charIndex + 1);
        charIndex++;
    }

    let speed = isDeleting ? 50 : 100;
    if (!isDeleting && charIndex === current.length) {
        speed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        speed = 500;
    }
    setTimeout(typeWrite, speed);
}
typeWrite();

// ===== SCROLL ANIMATIONS (GSAP + ScrollTrigger) =====
function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Scroll-triggered reveals
    document.querySelectorAll('[data-scroll]').forEach(el => {
        ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            onEnter: () => el.classList.add('visible'),
            once: true
        });
    });

    // Skill bars
    document.querySelectorAll('.skill-fill').forEach(bar => {
        ScrollTrigger.create({
            trigger: bar,
            start: 'top 90%',
            onEnter: () => { bar.style.width = bar.dataset.width + '%'; },
            once: true
        });
    });

    // Counter animation
    document.querySelectorAll('.stat-number').forEach(counter => {
        ScrollTrigger.create({
            trigger: counter,
            start: 'top 90%',
            onEnter: () => animateCounter(counter),
            once: true
        });
    });

    // Parallax sections
    gsap.utils.toArray('.section-dark').forEach(section => {
        gsap.fromTo(section, { backgroundPositionY: '-20%' }, {
            backgroundPositionY: '20%',
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true }
        });
    });

    // Hero parallax
    gsap.to('.hero-content', {
        y: 80, opacity: 1,
        scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: true }
    });
}

function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = Math.floor(current);
    }, 30);
}

// ===== TILT EFFECT =====
document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / centerY * -8;
        const rotateY = (x - centerX) / centerX * 8;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// ===== PROJECT FILTERS =====
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        document.querySelectorAll('.project-grid > div[data-category]').forEach(project => {
            if (filter === 'all' || project.dataset.category === filter) {
                project.style.display = '';
                gsap.from(project, { opacity: 0, y: 30, duration: 0.5 });
            } else {
                project.style.display = 'none';
            }
        });
    });
});

// ===== CONTACT FORM =====
document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.innerHTML = '<i class="fas fa-check me-2"></i>Message Sent!';
    btn.style.background = 'linear-gradient(135deg, #4ade80, #22c55e)';
    setTimeout(() => {
        btn.innerHTML = 'Send Message <i class="fas fa-paper-plane ms-2"></i>';
        btn.style.background = '';
        e.target.reset();
    }, 3000);
});

// ===== SMOOTH SCROLL FOR NAV =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Close mobile nav
            const collapse = document.getElementById('navMenu');
            if (collapse.classList.contains('show')) {
                new bootstrap.Collapse(collapse).hide();
            }
        }
    });
});

// ===== SCROLL INDICATOR HIDE =====
window.addEventListener('scroll', () => {
    const indicator = document.getElementById('scrollIndicator');
    if (indicator) {
        indicator.style.opacity = window.scrollY > 100 ? '0' : '1';
    }
});
