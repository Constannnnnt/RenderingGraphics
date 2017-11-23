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

// shadowMap variable
var SHADOW_MAP_WIDTH = 1024;
var SHADOW_MAP_HEIGHT = 1024;

// screen variable
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var NEAR = 1;
var FAR = 2000;

var explictFlatShade = false;
var explictSmoothShade = true;
var FlatShade = false;
var SmoothShde = false;

init();
animate();

function init() {
  // scene
  scene = new THREE.Scene();

  // canvas
  container = document.createElement('div');
  document.body.appendChild(container);
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, NEAR, FAR);
  camera.position.z = 250;
  scene.add(camera);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap; // PCF shadowMap now
  container.appendChild(renderer.domElement);

  // control
  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.addEventListener('change', render);
  controls.minDistance = 10;
  controls.maxDistance = 800;
  controls.enablePan = true;

  // mirror reflector
  var verticalMirror = new THREE.Reflector(400, 350, {
    clipBias: 0.001,
    textureWidth: SCREEN_WIDTH * window.devicePixelRatio,
    textureHeight: SCREEN_HEIGHT * window.devicePixelRatio,
    color: 0x889999,
    recursion: 1
  });
  verticalMirror.position.y = 50;
  verticalMirror.position.x = -20;
  verticalMirror.position.z = -128;
  // verticalMirror.rotateX(Math.PI / 2)
  scene.add(verticalMirror);

  // lights
  var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
  scene.add(ambientLight);

  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
  var target = new THREE.Object3D();
  target.position.copy(new THREE.Vector3(0, 0, -5));

  scene.add(directionalLight);
  scene.add(target);
  directionalLight.target = target;

  // spotlight
  var spotLight = new THREE.SpotLight(0xffff00, 1);
  spotLight.position.set(5, 95, 100);
  spotLight.angle = Math.PI / 8;
  spotLight.penumbra = 0.08;
  spotLight.decay = 2;
  spotLight.distance = 400;
  // spotLight.shadow.bias = 0.0001
  spotLight.castShadow = true;
  spotLight.shadowDarkness = 1;
  spotLight.shadowCameraVisible = true;
  spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
  spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
  spotLight.shadow.camera.near = 10;
  spotLight.shadow.camera.far = 180;
  scene.add(spotLight);

  // floor texture
  var loader = new THREE.TextureLoader();
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
    //  var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} )
    window.cube = new THREE.Mesh(geometry, material);
    cube.position.copy(new THREE.Vector3(-27, -94, 5));
    cube.castShadow = false;
    cube.receiveShadow = true;
    scene.add(cube);
  },
  // Function called when download progresses
  function (xhr) {
    // console.log((xhr.loaded / xhr.total * 100) + '% loaded')
  },
  // Function called when download errors
  function (xhr) {
    console.error('An error happened');
  });

  // model
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
      object.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
          node.castShadow = true;
          if (explictSmoothShade) {
            var geometry = new THREE.Geometry().fromBufferGeometry(node.geometry);
            geometry.computeFaceNormals();
            geometry.mergeVertices();
            geometry.computeVertexNormals(true);
            node.geometry = new THREE.BufferGeometry().fromGeometry(geometry);
            node.material = new THREE.MeshPhongMaterial({
              color: 'white',
              shading: THREE.SmoothShading
            });
          } else if (explictFlatShade) {
            var geometry = new THREE.Geometry().fromBufferGeometry(node.geometry);
            geometry.computeFaceNormals();
            geometry.mergeVertices();
            geometry.computeVertexNormals(true);
            node.geometry = new THREE.BufferGeometry().fromGeometry(geometry);
            node.material = new THREE.MeshPhongMaterial({
              color: 'white',
              shading: THREE.FlatShading
            });
          }
          if (SmoothShde) node.material.shading = THREE.SmoothShading;else if (FlatShade) mode.material.shading = THREE.FlatShading;
          node.receiveShadow = false;
          console.log(node);
        }
      });
      scene.add(object);

      spotLight.target = object;
      verticalMirror.target = object;

      controls.target.copy(object.position);
      controls.update();
    }, xhr => {
      // console.log(xhr)
    }, xhr => {
      console.log(xhr);
    });
  });

  var objLoader = new THREE.OBJLoader();
  objLoader.setPath('../models/stage/');
  objLoader.load('stage.obj', function (object) {
    object.position.y -= 123.8;
    object.scale.x = 20;
    object.scale.y = 20;
    object.scale.z = 20;
    object.traverse(function (node) {
      if (node instanceof THREE.Mesh) {
        node.castShadow = false;
        node.receiveShadow = true;
      }
    });
    scene.add(object);
    // console.log('stage loading')
  }, xhr => {
    // console.log(xhr)
  }, xhr => {
    console.log(xhr);
  });

  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  renderer.render(scene, camera);
}

/***/ })
/******/ ]);