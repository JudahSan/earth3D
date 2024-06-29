// Import necessary modules from THREE.js
import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import getStarField from "./src/getStarField.js";
import { getFresnelMat } from "./src/getFresnelMat.js";

// Log the THREE.js revision
console.log(`THREE REVISION: %c${THREE.REVISION}`, "color: #FFFF00");

// Make THREE globally available
window.THREE = THREE;

// Set the height and width of the window
const h = window.innerHeight;
const w = window.innerWidth;

// Create a new scene
const scene = new THREE.Scene();

// Set up the camera with a field of view of 50, aspect ratio based on window dimensions, and near/far clipping planes
const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
camera.position.z = 5; // Position the camera

// Set up the renderer with antialiasing for better quality
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h); // Set the size of the renderer
document.body.appendChild(renderer.domElement); // Append the renderer to the DOM

// Create a group to hold the Earth and its components
const earthGroup = new THREE.Group();
earthGroup.rotation.z = (-23.4 * Math.PI) / 180; // Tilt the Earth by 23.4 degrees
scene.add(earthGroup); // Add the group to the scene

// Add orbit controls to allow user interaction
new OrbitControls(camera, renderer.domElement);

// Define the level of detail for the icosahedron geometry
const detail = 12;

// Load textures using the TextureLoader
const loader = new THREE.TextureLoader();

// Create the geometry for the Earth
const geometry = new THREE.IcosahedronGeometry(1, detail);

// Create the material for the Earth with the day map texture
const material = new THREE.MeshStandardMaterial({
  map: loader.load("./textures/8k_earth_daymap.jpg"),
});

// Create the Earth mesh and add it to the earthGroup
const earthMesh = new THREE.Mesh(geometry, material);
earthGroup.add(earthMesh);

// Create the material for the night lights with blending and opacity settings
const lightsMat = new THREE.MeshBasicMaterial({
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  map: loader.load("./textures/03_earthlights1k.jpg"),
});

// Create the night lights mesh and add it to the earthGroup
const lightsMesh = new THREE.Mesh(geometry, lightsMat);
earthGroup.add(lightsMesh);

// Create the material for the clouds with transparency and blending settings
const cloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load("./textures/04_earthcloudmap.jpg"),
  transparent: true,
  opacity: 0.2,
  blending: THREE.AdditiveBlending,
  alphaMap: loader.load("./textures/05_earthcloudmaptrans.jpg"),
});

// Create the cloud mesh, scale it slightly larger, and add it to the earthGroup
const cloudMesh = new THREE.Mesh(geometry, cloudsMat);
cloudMesh.scale.setScalar(1.003);
earthGroup.add(cloudMesh);

// Get the Fresnel material and create a mesh for the glow effect
const fresnelMat = getFresnelMat();
const glowMesh = new THREE.Mesh(geometry, fresnelMat);
glowMesh.scale.setScalar(1.01);
earthGroup.add(glowMesh);

// Add a star field to the scene
const stars = getStarField({ numStars: 1000 });
scene.add(stars);

// Create and position a directional light to simulate the Sun
const sunLight = new THREE.DirectionalLight(0xffffff);
sunLight.position.set(-2, -0.5, 1.5);
scene.add(sunLight);

// Function to animate the scene
function animate() {
  requestAnimationFrame(animate); // Request the next frame
  earthMesh.rotation.y += 0.002; // Rotate the Earth
  lightsMesh.rotation.y += 0.002; // Rotate the night lights
  cloudMesh.rotation.y += 0.00211; // Rotate the clouds
  glowMesh.rotation.y += 0.002; // Rotate the glow
  renderer.render(scene, camera); // Render the scene
}

animate(); // Start the animation loop

// Function to handle window resize events
function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight; // Update camera aspect ratio
  camera.updateProjectionMatrix(); // Update the camera projection matrix
  renderer.setSize(window.innerWidth, window.innerHeight); // Update renderer size
}
window.addEventListener("resize", handleWindowResize, false); // Add event listener for window resize
