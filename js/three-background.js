// 3D Background — Improved Cinematic Style
// Features: Colored particles with wave motion, rotating torus rings, mouse parallax, and auto-floating camera.

function initThreeBackground() {
    const container = document.getElementById('three-bg-container');
    if (!container) return;

    const scene = new THREE.Scene();
    // Deep fog — make it feel more expansive
    scene.fog = new THREE.FogExp2(0x080808, 0.018);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 18);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ── LIGHTS ─────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.6, 50);
    pointLight.position.set(12, 5, -5);
    scene.add(pointLight);

    // ── MOUSE TRACKING ─────────────────────────────────────────────
    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // ── IMPROVED PARTICLES ─────────────────────────────────────────
    const particleCount = 1500;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        // Position
        positions[i * 3]     = (Math.random() - 0.5) * 400;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 300;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

        // Colors — Monochrome (Grey to White)
        const intensity = 0.5 + Math.random() * 0.5;
        colors[i * 3]     = intensity; // R
        colors[i * 3 + 1] = intensity; // G
        colors[i * 3 + 2] = intensity; // B

        // Variable sizes
        sizes[i] = Math.random() * 2 + 0.5;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    // size attribute requires a custom shader or using sizeAttenuation: true for varied appearance
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 1.2,
        transparent: true,
        opacity: 0.4,
        vertexColors: true,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const particleMesh = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleMesh);

    // ── ROTATING RINGS ─────────────────────────────────────────────
    const ringGeometry = new THREE.TorusGeometry(8, 0.02, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.02,
        wireframe: true
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(18, 0, -35);
    scene.add(ring);

    const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(12, 0.015, 16, 100),
        new THREE.MeshBasicMaterial({
            color: 0xcccccc,
            transparent: true,
            opacity: 0.01,
            wireframe: true
        })
    );
    ring2.rotation.x = Math.PI / 3;
    ring2.position.set(22, 0, -40);
    scene.add(ring2);

    // ── FLOATING SHAPES ────────────────────────────────────────────
    const shapes = new THREE.Group();
    const shapeCount = 10;
    const shapeGeo = new THREE.BoxGeometry(1, 1, 1);
    const shapeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.03 });

    for (let i = 0; i < shapeCount; i++) {
        const mesh = new THREE.Mesh(shapeGeo, shapeMat);
        const radius = 15 + Math.random() * 10;
        const angle = Math.random() * Math.PI * 2;
        mesh.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 20, -15 - Math.random() * 10);
        mesh.rotation.set(Math.random(), Math.random(), Math.random());
        mesh.userData = { rotX: Math.random() * 0.005, rotY: Math.random() * 0.005 };
        shapes.add(mesh);
    }
    scene.add(shapes);

    // ── ICOSAHEDRON WIREFRAME — very subtle ───────────────────────
    const icoGeo = new THREE.IcosahedronGeometry(12, 1);
    const icoMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.03,
        blending: THREE.AdditiveBlending
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    icoMesh.position.set(20, 0, -30);
    icoMesh.scale.set(0.3, 0.3, 0.3);
    icoMesh.material.opacity = 0.02;
    scene.add(icoMesh);

    window._bgSphere = icoMesh;

    // ── RESIZE ─────────────────────────────────────────────────────
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ── ANIMATION LOOP ─────────────────────────────────────────────
    function animate() {
        requestAnimationFrame(animate);
        
        const time = Date.now() * 0.0001;
        const elapsed = Date.now() * 0.0003;

        // 1. Particle movement — wave motion
        const posArray = particleGeometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            // Gentle wave motion on Y axis
            posArray[i3 + 1] += Math.sin(time + posArray[i3] * 0.5) * 0.02;
            // Slow drift
            posArray[i3] += Math.sin(time * 0.3 + i * 0.1) * 0.01;
        }
        particleGeometry.attributes.position.needsUpdate = true;

        // 2. Rotate Rings
        ring.rotation.z += 0.0008;
        ring2.rotation.z -= 0.0005;
        ring2.rotation.y += 0.0003;

        // 3. Subtle Icosahedron Movement
        icoMesh.rotation.y += 0.0006;
        icoMesh.rotation.x += 0.0002;
        
        // 4. Shape Rotation
        shapes.children.forEach(s => {
            s.rotation.x += s.userData.rotX;
            s.rotation.y += s.userData.rotY;
        });

        // 5. Camera — gentle auto float + mouse parallax
        camera.position.y = Math.sin(elapsed * 0.5) * 0.8;
        camera.position.x = Math.cos(elapsed * 0.3) * 0.5;

        camera.position.x += (mouseX * 2 - camera.position.x) * 0.01;
        camera.position.y += (-mouseY * 1 - camera.position.y) * 0.01;
        
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }
    animate();
}

// Global function to transition background element positions per page
window.repositionSphere = function(pageName) {
    const mesh = window._bgSphere;
    if (!mesh || typeof gsap === 'undefined') return;

    const positions = {
        dashboard:  { x:  26,  y:  3,  z: -30, s: 0.75 },
        cases:      { x:  10,  y:  1,  z: -15, s: 0.55 },
        hearings:   { x:  12,  y: -1,  z: -18, s: 0.5 },
        verdicts:   { x: -12,  y:  2,  z: -16, s: 0.55 },
        judges:     { x:  10,  y: -2,  z: -14, s: 0.55 },
        lawyers:    { x: -10,  y:  1,  z: -15, s: 0.5 },
        parties:    { x:  10,  y:  2,  z: -18, s: 0.5 },
        courtrooms: { x: -10,  y: -1,  z: -14, s: 0.6 },
        evidence:   { x:  12,  y: -1,  z: -18, s: 0.5 }
    };
    const p = positions[pageName] || { x: 7, y: -1, z: -12, s: 0.5 };

    gsap.to(mesh.position, { x: p.x, y: p.y, z: p.z, duration: 1.5, ease: 'power2.inOut' });
    gsap.to(mesh.scale,    { x: p.s, y: p.s, z: p.s, duration: 1.5, ease: 'power2.inOut' });
};

window.initThreeBackground = initThreeBackground;
