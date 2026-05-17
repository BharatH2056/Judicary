let courtroomScene, courtroomCamera, courtroomRenderer, courtroomControls;
let animationFrameId;
let animatedObjects = [];

window.initCourtroom3D = () => {
    // Populate courtroom selector
    const selector = document.getElementById('courtroom-selector');
    db.courtrooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room.id;
        option.textContent = `${room.name} (${room.type})`;
        selector.appendChild(option);
    });

    selector.addEventListener('change', (e) => {
        if (e.target.value) {
            loadCourtroom(e.target.value);
        } else {
            clearCourtroom();
        }
    });

    document.getElementById('btn-reset-camera').addEventListener('click', resetCamera);

    initThreeJS();
    
    // Automatically select the first courtroom if available
    if (db.courtrooms.length > 0) {
        selector.value = db.courtrooms[0].id;
        loadCourtroom(db.courtrooms[0].id);
    }
};

function initThreeJS() {
    const container = document.getElementById('courtroom-3d-container');
    if (!container) return;

    // Scene setup
    courtroomScene = new THREE.Scene();
    courtroomScene.background = new THREE.Color(0xf4f3ff); // light background from CSS
    
    // Camera setup
    courtroomCamera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    courtroomCamera.position.set(0, 15, 20);
    
    // Renderer setup
    courtroomRenderer = new THREE.WebGLRenderer({ antialias: true });
    courtroomRenderer.setSize(container.clientWidth, container.clientHeight);
    courtroomRenderer.shadowMap.enabled = true;
    container.appendChild(courtroomRenderer.domElement);
    
    // Controls setup
    if (typeof THREE.OrbitControls !== 'undefined') {
        courtroomControls = new THREE.OrbitControls(courtroomCamera, courtroomRenderer.domElement);
        courtroomControls.enableDamping = true;
        courtroomControls.dampingFactor = 0.05;
        courtroomControls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below ground
        courtroomControls.autoRotate = true; // Auto-rotate for immediate animation
        courtroomControls.autoRotateSpeed = 1.5;
    }
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    courtroomScene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    courtroomScene.add(dirLight);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(40, 40);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xe2e0f0, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    courtroomScene.add(floor);

    // Walls
    const wallGeo = new THREE.BoxGeometry(40, 10, 1);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x534ab7 }); // Primary purple
    
    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, 5, -20);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    courtroomScene.add(backWall);

    const sideWallGeo = new THREE.BoxGeometry(1, 10, 40);
    const leftWall = new THREE.Mesh(sideWallGeo, wallMat);
    leftWall.position.set(-20, 5, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    courtroomScene.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeo, wallMat);
    rightWall.position.set(20, 5, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    courtroomScene.add(rightWall);

    // Handle Window Resize
    window.addEventListener('resize', onWindowResize, false);
    
    // Start animation loop
    animate();
}

function onWindowResize() {
    const container = document.getElementById('courtroom-3d-container');
    if (!container || !courtroomCamera || !courtroomRenderer) return;
    
    courtroomCamera.aspect = container.clientWidth / container.clientHeight;
    courtroomCamera.updateProjectionMatrix();
    courtroomRenderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    animationFrameId = requestAnimationFrame(animate);
    
    if (courtroomControls) courtroomControls.update();
    
    const time = Date.now() * 0.001;
    
    // Process animations
    animatedObjects.forEach(obj => {
        if (obj.type === 'bounce') {
            obj.mesh.position.y = obj.basePos.y + Math.sin(time * obj.speed + obj.offset) * 0.5;
            obj.mesh.rotation.y += 0.02;
        } else if (obj.type === 'spin') {
            obj.mesh.rotation.x += 0.01;
            obj.mesh.rotation.y += 0.02;
        }
    });

    if (courtroomRenderer && courtroomScene && courtroomCamera) {
        courtroomRenderer.render(courtroomScene, courtroomCamera);
    }
}

// Cleanup when navigating away
const originalHandleRoute = window.handleRoute;
if (originalHandleRoute) {
    window.handleRoute = async (...args) => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        if (courtroomRenderer) {
            const container = document.getElementById('courtroom-3d-container');
            if (container && container.contains(courtroomRenderer.domElement)) {
                container.removeChild(courtroomRenderer.domElement);
            }
            courtroomRenderer.dispose();
            courtroomRenderer = null;
        }
        await originalHandleRoute(...args);
    };
}

let currentRoomGroup = null;

function clearCourtroom() {
    if (currentRoomGroup && courtroomScene) {
        courtroomScene.remove(currentRoomGroup);
        currentRoomGroup = null;
    }
}

function loadCourtroom(roomId) {
    clearCourtroom();
    animatedObjects = []; // Reset animations
    
    const room = db.courtrooms.find(r => r.id === roomId);
    if (!room) return;
    
    currentRoomGroup = new THREE.Group();
    
    // Wood material
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
    
    // Judge's Bench (Elevated)
    const benchGeo = new THREE.BoxGeometry(8, 3, 2);
    const bench = new THREE.Mesh(benchGeo, woodMat);
    bench.position.set(0, 1.5, -15);
    bench.castShadow = true;
    bench.receiveShadow = true;
    currentRoomGroup.add(bench);
    
    // Witness Stand
    const witnessGeo = new THREE.BoxGeometry(3, 2.5, 2);
    const witnessStand = new THREE.Mesh(witnessGeo, woodMat);
    witnessStand.position.set(6, 1.25, -15);
    witnessStand.castShadow = true;
    witnessStand.receiveShadow = true;
    currentRoomGroup.add(witnessStand);
    
    // Prosecution Table (Right)
    const tableGeo = new THREE.BoxGeometry(5, 1.5, 3);
    const prosTable = new THREE.Mesh(tableGeo, woodMat);
    prosTable.position.set(5, 0.75, -5);
    prosTable.castShadow = true;
    prosTable.receiveShadow = true;
    currentRoomGroup.add(prosTable);
    
    // Defense Table (Left)
    const defTable = new THREE.Mesh(tableGeo, woodMat);
    defTable.position.set(-5, 0.75, -5);
    defTable.castShadow = true;
    defTable.receiveShadow = true;
    currentRoomGroup.add(defTable);
    
    // Gallery Benches
    const capacity = room.capacity || 50;
    const rows = Math.ceil(capacity / 10);
    
    for (let r = 0; r < rows; r++) {
        // Left bench
        const gBenchGeo = new THREE.BoxGeometry(8, 1, 1.5);
        const gBenchLeft = new THREE.Mesh(gBenchGeo, woodMat);
        gBenchLeft.position.set(-6, 0.5, 5 + r * 3);
        gBenchLeft.castShadow = true;
        gBenchLeft.receiveShadow = true;
        currentRoomGroup.add(gBenchLeft);
        
        // Right bench
        const gBenchRight = new THREE.Mesh(gBenchGeo, woodMat);
        gBenchRight.position.set(6, 0.5, 5 + r * 3);
        gBenchRight.castShadow = true;
        gBenchRight.receiveShadow = true;
        currentRoomGroup.add(gBenchRight);
    }
    
    // Determine if there are active hearings in this courtroom today
    const today = new Date().toISOString().split('T')[0];
    const todayHearings = db.hearings.filter(h => h.courtroomId === roomId && h.date === today);
    
    // Add simple avatars/indicators if there are hearings
    if (todayHearings.length > 0) {
        // Person material
        const judgeMat = new THREE.MeshStandardMaterial({ color: 0x1d9e75 }); // Success teal
        const personGeo = new THREE.CylinderGeometry(0.5, 0.5, 2, 16);
        
        // Judge
        const judge = new THREE.Mesh(personGeo, judgeMat);
        judge.position.set(0, 4, -15);
        judge.castShadow = true;
        currentRoomGroup.add(judge);
        
        // Add judge to animated objects (bouncing and rotating)
        animatedObjects.push({
            mesh: judge,
            type: 'bounce',
            basePos: judge.position.clone(),
            speed: 3,
            offset: 0
        });
        
        // Add text sprite showing hearing count
        addTextSprite(`Active Hearings: ${todayHearings.length}`, new THREE.Vector3(0, 7, -15), currentRoomGroup);
    }

    // Add some floating "Evidence" cubes to make the animation very obvious
    const evidenceMat = new THREE.MeshStandardMaterial({ color: 0xef9f27 }); // Warning amber
    for (let i = 0; i < 5; i++) {
        const evGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const evMesh = new THREE.Mesh(evGeo, evidenceMat);
        evMesh.position.set(
            (Math.random() - 0.5) * 15,
            2 + Math.random() * 3,
            (Math.random() - 0.5) * 15
        );
        evMesh.castShadow = true;
        currentRoomGroup.add(evMesh);
        
        // Spin the evidence cubes
        animatedObjects.push({
            mesh: evMesh,
            type: 'spin'
        });
        
        // Also bounce them slightly
        animatedObjects.push({
            mesh: evMesh,
            type: 'bounce',
            basePos: evMesh.position.clone(),
            speed: 1 + Math.random(),
            offset: Math.random() * Math.PI * 2
        });
    }
    
    courtroomScene.add(currentRoomGroup);
    resetCamera();
}

function resetCamera() {
    if (courtroomCamera && courtroomControls) {
        // Animate camera reset smoothly
        const startPos = courtroomCamera.position.clone();
        const endPos = new THREE.Vector3(0, 15, 20);
        
        let progress = 0;
        const animateCamera = () => {
            progress += 0.05;
            if (progress <= 1) {
                courtroomCamera.position.lerpVectors(startPos, endPos, progress);
                courtroomControls.target.set(0, 0, 0);
                requestAnimationFrame(animateCamera);
            }
        };
        animateCamera();
    }
}

function addTextSprite(message, position, group) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;
    
    context.fillStyle = 'rgba(0,0,0,0)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.font = 'bold 32px Inter, sans-serif';
    context.fillStyle = '#e24b4a'; // Danger red
    context.textAlign = 'center';
    context.fillText(message, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    
    sprite.position.copy(position);
    sprite.scale.set(10, 2.5, 1);
    
    group.add(sprite);
}
