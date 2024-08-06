// Configura a cena
const scene = new THREE.Scene();

// Configura a câmera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Configura o renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Cria o logo 3D
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const logo = new THREE.Mesh(geometry, material);
scene.add(logo);

// Estado para controlar se o mouse está pressionado
let isMousePressed = false;

// Armazena a rotação inicial do mouse
let initialMouseX = 0;
let initialMouseY = 0;

// Função de animação
function animate() {
    requestAnimationFrame(animate);
    
    if (!isMousePressed) {
        // Continua girando verticalmente quando não estiver clicado
        logo.rotation.y += 0.01;
    }
    
    renderer.render(scene, camera);
}

// Adiciona eventos de mouse
document.addEventListener('mousedown', (event) => {
    // Verifica se o clique é sobre o logo
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(logo);
    if (intersects.length > 0) {
        isMousePressed = true;
        // Armazena a posição inicial do mouse quando pressionado
        initialMouseX = event.clientX;
        initialMouseY = event.clientY;
    }
});

document.addEventListener('mouseup', () => {
    isMousePressed = false;
});

document.addEventListener('mousemove', (event) => {
    if (isMousePressed) {
        // Calcula a rotação com base na diferença do movimento do mouse
        logo.rotation.x += (event.clientY - initialMouseY) * 0.01;
        logo.rotation.y += (event.clientX - initialMouseX) * 0.01;
        
        // Atualiza a posição inicial do mouse
        initialMouseX = event.clientX;
        initialMouseY = event.clientY;
    }
});

// Inicia a animação
animate();

// Ajusta o tamanho do renderizador quando a janela é redimensionada
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
