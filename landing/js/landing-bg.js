/**
 * JudicaMS Cinematic Landing Background
 * Three.js Implementation
 */

let scene, camera, renderer, particles, scales;

function initBackground() {
    // 1. Scene Setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080808, 0.002);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('landing-canvas-container').appendChild(renderer.domElement);

    // 2. Create Particles (1200 stars)
    const particleCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 20;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
        size: 0.02,
        color: 0xffffff,
        transparent: true,
        opacity: 0.5
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 3. Create "Scales of Justice" Wireframe (Simplified placeholder)
    // Using a group of objects to represent a stylized scale
    scales = new THREE.Group();

    // The horizontal beam
    const beamGeom = new THREE.BoxGeometry(4, 0.05, 0.05);
    const wireMaterial = new THREE.MeshBasicMaterial({ color: 0x333333, wireframe: true });
    const beam = new THREE.Mesh(beamGeom, wireMaterial);
    scales.add(beam);

    // The vertical pillar
    const pillarGeom = new THREE.BoxGeometry(0.05, 3, 0.05);
    const pillar = new THREE.Mesh(pillarGeom, wireMaterial);
    pillar.position.y = -1.5;
    scales.add(pillar);

    // The two plates (represented by wireframe spheres or cones)
    const plateGeom = new THREE.ConeGeometry(0.5, 0.5, 4, 1, true);
    
    const plateLeft = new THREE.Mesh(plateGeom, wireMaterial);
    plateLeft.position.set(-2, -0.5, 0);
    plateLeft.rotation.x = Math.PI;
    scales.add(plateLeft);

    const plateRight = new THREE.Mesh(plateGeom, wireMaterial);
    plateRight.position.set(2, -0.5, 0);
    plateRight.rotation.x = Math.PI;
    scales.add(plateRight);

    scene.add(scales);
    scales.position.y = 0.5;

    // 4. Animation Loop
    animate();

    // 5. Handle Resize
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Subtle movement
    particles.rotation.y += 0.0005;
    scales.rotation.y += 0.002;
    
    // Slight sway for the scales
    scales.rotation.z = Math.sin(Date.now() * 0.001) * 0.05;

    renderer.render(scene, camera);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initBackground);
