import * as THREE from 'three';
import { GUI } from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor("#eeece8");
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(-10, 10, 10).normalize();
scene.add(directionalLight);

const fillLight = new THREE.DirectionalLight(0x404040, 0.1);
fillLight.position.set(-10, -5, -5).normalize();
scene.add(fillLight);

const pointLight = new THREE.PointLight(0xffffff, 1.0, 50);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

let logoObject1;
let logoObject2;
let isDay = false;
let lastCheckedTime = 0;

const settings = {
  autoRotate: true,
  metalness: 1.0,
  roughness: 0.4,
  exposure: 1.0,
  resolution: '2k',
  type: 'HalfFloatType',
  aoMapIntensity: 1.0,
  envMapIntensity: 1.0,
  displacementScale: 2.436143,
  normalScale: 1.0,
  lightColor: 0xffffff,
  lightIntensity: 1.0,
  lightDistance: 50,
  lightAngle: Math.PI / 4,
  lightDecay: 1,
  lightPenumbra: 0
};

function loadLogos() {
  const textureLoader = new THREE.TextureLoader();
  const objLoader = new THREE.OBJLoader();

  const textureFileDay = "src/texturadia.jpg";
  const textureFileNight = "src/texturanoite.jpg";

  const objFile1 = isDay ? "src/logopreto.obj" : "src/logo.obj";
  const objFile2 = isDay
    ? "src/logosemnomepreta.obj"
    : "src/logosemnomebranca.obj";

  const texture = textureLoader.load(isDay ? textureFileDay : textureFileNight);

  if (logoObject1) {
    scene.remove(logoObject1);
    logoObject1 = null;
  }
  if (logoObject2) {
    scene.remove(logoObject2);
    logoObject2 = null;
  }

  objLoader.load(
    objFile1,
    function (object) {
      logoObject1 = object;
      updateObjectScale(logoObject1);
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            map: texture,
            metalness: settings.metalness,
            roughness: settings.roughness,
            aoMapIntensity: settings.aoMapIntensity,
            displacementScale: settings.displacementScale,
            normalScale: new THREE.Vector2(1, -1).multiplyScalar(settings.normalScale),
            envMapIntensity: settings.envMapIntensity
          });
        }
      });
      scene.add(logoObject1);
    },
    undefined,
    function (error) {
      console.error("Erro ao carregar o modelo OBJ:", error);
    }
  );

  objLoader.load(
    objFile2,
    function (object) {
      const boundingBox = new THREE.Box3().setFromObject(object);
      const center = boundingBox.getCenter(new THREE.Vector3());
      object.position.sub(center);

      logoObject2 = new THREE.Group();
      logoObject2.add(object);

      logoObject2.position.set(13, 5, -5);
      logoObject2.rotation.set(0, 0, 0);

      updateObjectScale(logoObject2);

      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            map: texture,
            metalness: settings.metalness,
            roughness: settings.roughness,
            aoMapIntensity: settings.aoMapIntensity,
            displacementScale: settings.displacementScale,
            normalScale: new THREE.Vector2(1, -1).multiplyScalar(settings.normalScale),
            envMapIntensity: settings.envMapIntensity
          });
        }
      });

      scene.add(logoObject2);
    },
    undefined,
    function (error) {
      console.error("Erro ao carregar o modelo OBJ:", error);
    }
  );
}

function adjustObjectScale() {
  const width = window.innerWidth;
  return width <= 768 ? 0.015 : 0.030;
}

function updateObjectScale(object) {
  if (object) {
    const newScale = adjustObjectScale();
    object.scale.set(newScale, newScale, newScale);
  }
}

function animate() {
  requestAnimationFrame(animate);

  if (settings.autoRotate) {
    if (logoObject1) logoObject1.rotation.y += 0.005;
    if (logoObject2) logoObject2.rotation.y += 0.005;
  }

  controls.update();
  renderer.render(scene, camera);
}

let isMousePressed = false;
let isMouseOverLogo = false;
let initialMouseX = 0;
let initialMouseY = 0;

document.addEventListener("mousedown", (event) => {
  handleInteractionStart(event.clientX, event.clientY);
});

document.addEventListener("mouseup", () => {
  isMousePressed = false;
  if (!isMouseOverLogo) {
    document.getElementById("cursor").classList.remove("active");
  }
});

document.addEventListener("mousemove", (event) => {
  handleInteractionMove(event.clientX, event.clientY);
});

document.addEventListener("touchstart", (event) => {
  const touch = event.touches[0];
  handleInteractionStart(touch.clientX, touch.clientY);
});

document.addEventListener("touchend", () => {
  isMousePressed = false;
  if (!isMouseOverLogo) {
    document.getElementById("cursor").classList.remove("active");
  }
});

document.addEventListener("touchmove", (event) => {
  const touch = event.touches[0];
  handleInteractionMove(touch.clientX, touch.clientY);
});

function handleInteractionStart(clientX, clientY) {
  const mouse = new THREE.Vector2();
  mouse.x = (clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(clientY / window.innerHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0) {
    isMousePressed = true;
    isMouseOverLogo = true;
    initialMouseX = clientX;
    initialMouseY = clientY;
    document.getElementById("cursor").classList.add("active");
  } else {
    window.location.href = "info.html";
  }
}

function handleInteractionMove(clientX, clientY) {
  const cursor = document.getElementById("cursor");
  cursor.style.left = clientX + "px";
  cursor.style.top = clientY + "px";

  if (isMousePressed && logoObject1) {
    const deltaX = clientX - initialMouseX;
    const deltaY = clientY - initialMouseY;

    logoObject1.rotation.x += deltaY * 0.01;
    logoObject1.rotation.y += deltaX * 0.01;

    initialMouseX = clientX;
    initialMouseY = clientY;
  }
}

function checkCursorOverLogo(event) {
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);
  const cursor = document.getElementById("cursor");
  if (intersects.length > 0) {
    cursor.style.backgroundColor = "red";
    isMouseOverLogo = true;
  } else {
    cursor.style.backgroundColor = isMousePressed ? "red" : "red";
    isMouseOverLogo = false;
  }
}

document.addEventListener("mousemove", checkCursorOverLogo);
document.addEventListener("touchmove", (event) => {
  const touch = event.touches[0];
  checkCursorOverLogo(touch);
});

animate();

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  updateObjectScale(logoObject1);
  updateObjectScale(logoObject2);
});

function updateTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();

  document.getElementById(
    "current-time"
  ).textContent = `${hours}:${minutes} · ${day}/${month}/${year}`;

  const currentTime = now.getTime();
  if (currentTime - lastCheckedTime >= 6 * 60 * 60 * 1000) {
    lastCheckedTime = currentTime;

    isDay = hours >= 6 && hours < 18;

    if (isDay) {
      document.body.style.backgroundColor = "#eeece8";
      document.body.style.color = "#000000";
      renderer.setClearColor("#eeece8");
      document.getElementById("cursor").style.backgroundColor = "#4a4a4a";
    } else {
      document.body.style.backgroundColor = "#000000";
      document.body.style.color = "#ffffff";
      renderer.setClearColor("#000000");
      document.getElementById("cursor").style.backgroundColor = "#ffffff";
    }

    loadLogos();
  }
}

setInterval(updateTime, 1000);
updateTime();

function initGui() {
  const gui = new GUI();

  gui.add(settings, 'autoRotate');
  gui.add(settings, 'metalness', 0, 1).onChange(value => {
    updateMaterialProperties('metalness', value);
  });

  gui.add(settings, 'roughness', 0, 1).onChange(value => {
    updateMaterialProperties('roughness', value);
  });

  gui.add(settings, 'aoMapIntensity', 0, 1).onChange(value => {
    updateMaterialProperties('aoMapIntensity', value);
  });

  gui.add(settings, 'envMapIntensity', 0, 3).onChange(value => {
    updateMaterialProperties('envMapIntensity', value);
  });

  gui.add(settings, 'displacementScale', 0, 3).onChange(value => {
    updateMaterialProperties('displacementScale', value);
  });

  gui.add(settings, 'normalScale', -1, 1).onChange(value => {
    updateMaterialProperties('normalScale', value);
  });

  gui.addColor(settings, 'lightColor').onChange(value => {
    pointLight.color.set(value);
  });

  gui.add(settings, 'lightIntensity', 0, 2).onChange(value => {
    pointLight.intensity = value;
  });

  gui.add(settings, 'lightDistance', 0, 100).onChange(value => {
    pointLight.distance = value;
  });

  gui.add(settings, 'lightAngle', 0, Math.PI / 2).onChange(value => {
    pointLight.angle = value;
  });

  gui.add(settings, 'lightDecay', 0, 2).onChange(value => {
    pointLight.decay = value;
  });

  gui.add(settings, 'lightPenumbra', 0, 1).onChange(value => {
    pointLight.penumbra = value;
  });

  gui.add(settings, 'exposure', 0, 2).onChange(value => {
    renderer.toneMappingExposure = value;
  });

  gui.add(settings, 'resolution', ['2k', '4k']).onChange(value => {
    loadEnvironment(value, settings.type);
  });

  gui.add(settings, 'type', ['HalfFloatType', 'FloatType']).onChange(value => {
    loadEnvironment(settings.resolution, value);
  });

  gui.open();
}

function updateMaterialProperties(property, value) {
  if (logoObject1) {
    logoObject1.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.material[property] = value;
      }
    });
  }

  if (logoObject2) {
    logoObject2.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.material[property] = value;
      }
    });
  }
}

function loadEnvironment(resolution, type) {
  const loader = new THREE.TextureLoader();
  loader.setDataType(THREE[type]);

  loader.load(`textures/equirectangular/spruit_sunrise_${resolution}.hdr.jpg`, function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.needsUpdate = true;

    scene.background = texture;
    scene.environment = texture;
  });
}

initGui();
