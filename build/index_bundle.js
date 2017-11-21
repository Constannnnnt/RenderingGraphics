/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/build";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

/* global THREE */
var container, stats;
var camera, scene, renderer;
var mouseX = 0,
    mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

// var lightHelper
// var directionalLighthelper


init();
animate();
function init() {
  container = document.createElement('div');
  document.body.appendChild(container);
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.z = 250;

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // control
  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.addEventListener('change', render);
  controls.minDistance = 10;
  controls.maxDistance = 800;
  controls.enablePan = true;

  // scene
  scene = new THREE.Scene();
  var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
  scene.add(ambientLight);

  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
  var target = new THREE.Object3D();
  target.position.copy(new THREE.Vector3(0, 0, -5));

  scene.add(directionalLight);
  scene.add(target);
  directionalLight.target = target;
  // directionalLighthelper = new THREE.DirectionalLightHelper( directionalLight, 5 );

  // scene.add( directionalLighthelper )

  // spotlight
  var spotLight = new THREE.SpotLight(0xffff00, 1);
  spotLight.position.set(5, 95, 100);
  spotLight.angle = Math.PI / 8;
  spotLight.penumbra = 0.08;
  spotLight.decay = 2;
  spotLight.distance = 400;
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  spotLight.shadow.camera.near = 10;
  spotLight.shadow.camera.far = 200;
  scene.add(spotLight);

  // lightHelper = new THREE.SpotLightHelper( spotLight );
  // scene.add( lightHelper );

  scene.add(camera);

  var loader = new THREE.TextureLoader();

  // load a resource
  loader.load(
  // resource URL
  '../images/floor.jpg',
  // Function when resource is loaded
  function (texture) {
    // in this example we create the material when the texture is loaded
    var material = new THREE.MeshBasicMaterial({
      map: texture,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.5
    });
    var geometry = new THREE.BoxGeometry(387, 0.001, 266);
    //  var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    window.cube = new THREE.Mesh(geometry, material);
    cube.position.copy(new THREE.Vector3(-27, -94, 5));
    scene.add(cube);
  },
  // Function called when download progresses
  function (xhr) {
    console.log(xhr.loaded / xhr.total * 100 + '% loaded');
  },
  // Function called when download errors
  function (xhr) {
    console.error('An error happened');
  });

  // model
  var onProgress = function (xhr) {
    if (xhr.lengthComputable) {
      var percentComplete = xhr.loaded / xhr.total * 100;
      console.log(Math.round(percentComplete, 2) + '% downloaded');
    }
  };
  var onError = function (xhr) {};
  THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.setPath('../models/Miku/');
  mtlLoader.load('Miku.mtl', function (materials) {
    materials.preload();
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath('../models/Miku/');
    objLoader.load('Miku.obj', function (object) {
      object.position.y = -95;
      object.position.x = -25;
      scene.add(object);

      spotLight.target = object;

      controls.target.copy(object.position);
      controls.update();
    }, onProgress, onError);
  });

  var objLoader = new THREE.OBJLoader();
  objLoader.setPath('../models/stage/');
  objLoader.load('stage.obj', function (object) {
    object.position.y -= 123.8;
    object.scale.x = 20;
    object.scale.y = 20;
    object.scale.z = 20;
    scene.add(object);
    // console.log('stage loading')
  }, onProgress, onError);

  document.addEventListener('mousemove', onDocumentMouseMove, false);
  //
  window.addEventListener('resize', onWindowResize, false);
}
function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) / 2;
  mouseY = (event.clientY - windowHalfY) / 2;
}
//
function animate() {
  requestAnimationFrame(animate);
  render();
}
function render() {
  // lightHelper.update();
  // directionalLighthelper.update()
  renderer.render(scene, camera);
}

/***/ })
/******/ ]);