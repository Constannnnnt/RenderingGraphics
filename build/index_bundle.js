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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ParticleEngine; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return Tween; });
/* unused harmony export Particle */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return Type; });
/**
* @author Lee Stemkoski   http://www.adelphi.edu/~stemkoski/
*/

/// /// /// /// /
// SHADERS //
/// /// /// /// /

// attribute: data that may be different for each particle (such as size and color)
//      can only be used in vertex shader
// varying: used to communicate data from vertex shader to fragment shader
// uniform: data that is the same for each particle (such as texture)

var particleVertexShader = `
attribute vec3  customColor;
attribute float customOpacity;
attribute float customSize;
attribute float customAngle;
attribute float customVisible; // float used as boolean (0 = false, 1 = true)
varying vec4  vColor;
varying float vAngle;

void main()
{
  if ( customVisible > 0.5 ) { // true
    vColor = vec4( customColor, customOpacity ); // set color associated to vertex use later in fragment shader.
  } else { // false
    vColor = vec4(0.0, 0.0, 0.0, 0.0); // make particle invisible.
  }
  vAngle = customAngle;

  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_PointSize = customSize * ( ( 2000.0 ) / (length(cameraPosition.xyz - mvPosition.xyz) + 1000.0) ); // scale particles as objects in 3D space
  gl_Position = projectionMatrix * mvPosition;
}
`;
var particleFragmentShader = `
uniform sampler2D texture;
varying vec4 vColor;
varying float vAngle;
void main()
{
  gl_FragColor = vColor;

  float c = cos(vAngle);
  float s = sin(vAngle);
  vec2 rotatedUV = vec2(
    c * (gl_PointCoord.x - 0.5) + s * (gl_PointCoord.y - 0.5) + 0.5,
    c * (gl_PointCoord.y - 0.5) - s * (gl_PointCoord.x - 0.5) + 0.5
  );  // rotate UV coordinates to rotate texture
  vec4 rotatedTexture = texture2D( texture,  rotatedUV );
  gl_FragColor = gl_FragColor * rotatedTexture;    // sets an otherwise white particle texture to desired color
}
`;
/// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /

/// /// /// /// /// //
// TWEEN CLASS //
/// /// /// /// /// //

var Tween = function (timeArray, valueArray) {
  this.times = timeArray || [];
  this.values = valueArray || [];
};

Tween.prototype.constructor = Tween;

Tween.prototype.lerp = function (t) {
  var i = 0;
  var n = this.times.length;
  while (i < n && t > this.times[i]) {
    i++;
  }
  if (i === 0) return this.values[0];
  if (i === n) return this.values[n - 1];
  var p = (t - this.times[i - 1]) / (this.times[i] - this.times[i - 1]);
  if (this.values[0] instanceof THREE.Vector3) {
    return this.values[i - 1].clone().lerp(this.values[i], p);
  } else {
    // its a float
    return this.values[i - 1] + p * (this.values[i] - this.values[i - 1]);
  }
};

Tween.prototype.clone = function () {
  let ntimes = this.times.slice();
  let nvalues = this.values.slice();
  return new this.constructor(ntimes, nvalues);
};

/// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /

/// /// /// /// /// /// //
// PARTICLE CLASS //
/// /// /// /// /// /// //

var Particle = function () {
  this.position = new THREE.Vector3();
  this.velocity = new THREE.Vector3(); // units per second
  this.acceleration = new THREE.Vector3();

  this.angle = 0;
  this.angleVelocity = 0; // degrees per second
  this.angleAcceleration = 0; // degrees per second, per second

  this.size = 16.0;

  this.color = new THREE.Color();
  this.opacity = 1.0;

  this.age = 0;
  this.alive = 0; // use float instead of boolean for shader purposes
};

Particle.prototype.constructor = Particle;

Particle.prototype.update = function (dt) {
  this.position.add(this.velocity.clone().multiplyScalar(dt));
  this.velocity.add(this.acceleration.clone().multiplyScalar(dt));

  // convert from degrees to radians: 0.01745329251 = Math.PI/180
  this.angle += this.angleVelocity * 0.01745329251 * dt;
  this.angleVelocity += this.angleAcceleration * 0.01745329251 * dt;

  this.age += dt;

  // if the tween for a given attribute is nonempty,
  //  then use it to update the attribute's value

  if (this.sizeTween.times.length > 0) {
    this.size = this.sizeTween.lerp(this.age);
  }

  if (this.colorTween.times.length > 0) {
    var colorHSL = this.colorTween.lerp(this.age);
    this.color = new THREE.Color().setHSL(colorHSL.x, colorHSL.y, colorHSL.z);
  }

  if (this.opacityTween.times.length > 0) {
    this.opacity = this.opacityTween.lerp(this.age);
  }
};

/// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /

/// /// /// /// /// /// /// /// ///
// PARTICLE ENGINE CLASS //
/// /// /// /// /// /// /// /// ///

var Type = Object.freeze({ 'CUBE': 1, 'SPHERE': 2 });

var ParticleEngine = function () {
  /// /// /// /// /// /// /// /// /
  // PARTICLE PROPERTIES //
  /// /// /// /// /// /// /// /// /

  this.positionStyle = Type.CUBE;
  this.positionBase = new THREE.Vector3();
  // cube shape data
  this.positionSpread = new THREE.Vector3();
  // sphere shape data
  this.positionRadius = 0; // distance from base at which particles start

  this.velocityStyle = Type.CUBE;
  // cube movement data
  this.velocityBase = new THREE.Vector3();
  this.velocitySpread = new THREE.Vector3();
  // sphere movement data
  //   direction vector calculated using initial position
  this.speedBase = 0;
  this.speedSpread = 0;

  this.accelerationBase = new THREE.Vector3();
  this.accelerationSpread = new THREE.Vector3();

  this.angleBase = 0;
  this.angleSpread = 0;
  this.angleVelocityBase = 0;
  this.angleVelocitySpread = 0;
  this.angleAccelerationBase = 0;
  this.angleAccelerationSpread = 0;

  this.sizeBase = 0.0;
  this.sizeSpread = 0.0;
  this.sizeTween = new Tween();

  // store colors in HSL format in a THREE.THREE.Vector3 object
  // http://en.wikipedia.org/wiki/HSL_and_HSV
  this.colorBase = new THREE.Vector3(0.0, 1.0, 0.5);
  this.colorSpread = new THREE.Vector3(0.0, 0.0, 0.0);
  this.colorTween = new Tween();

  this.opacityBase = 1.0;
  this.opacitySpread = 0.0;
  this.opacityTween = new Tween();

  this.blendStyle = THREE.NormalBlending; // false

  this.particleArray = [];
  this.particlesPerSecond = 100;
  this.particleDeathAge = 1.0;

  /// /// /// /// /// /// /// ///
  // EMITTER PROPERTIES //
  /// /// /// /// /// /// /// ///

  this.emitterAge = 0.0;
  this.emitterAlive = true;
  this.emitterDeathAge = 60; // time (seconds) at which to stop creating particles.

  // How many particles could be active at any time?
  this.particleCount = this.particlesPerSecond * Math.min(this.particleDeathAge, this.emitterDeathAge);

  /// /// /// /// //
  // THREE.JS //
  /// /// /// /// //

  this.particleGeometry = new THREE.BufferGeometry();
  this.particleTexture = null;
  this.particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      texture: { type: 't', value: this.particleTexture }
    },
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
    transparent: true,
    alphaTest: 0.5,
    // if having transparency issues, try including: alphaTest: 0.5
    blending: THREE.NormalBlending,
    depthTest: true
  });
  this.particleMesh = new THREE.Mesh();

  this.lastIndex = -1;
};

ParticleEngine.prototype.constructor = ParticleEngine;

ParticleEngine.prototype.setValues = function (parameters) {
  if (parameters === undefined) return;

  // clear any previous tweens that might exist
  this.sizeTween = new Tween();
  this.colorTween = new Tween();
  this.opacityTween = new Tween();

  for (var key in parameters) {
    this[key] = parameters[key];
  }

  // calculate/set derived particle engine values
  this.particleArray = [];
  this.emitterAge = 0.0;
  this.emitterAlive = true;
  this.particleCount = this.particlesPerSecond * Math.min(this.particleDeathAge, this.emitterDeathAge);

  this.particleGeometry = new THREE.BufferGeometry();
  this.particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      texture: { type: 't', value: parameters.particleTexture }
    },
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
    transparent: true,
    alphaTest: 0.5,
    // if having transparency issues, try including: alphaTest: 0.5,
    blending: THREE.NormalBlending,
    depthTest: true
  });
  this.particleMesh = new THREE.Points();
};

// helper functions for randomization
ParticleEngine.prototype.randomValue = function (base, spread) {
  return base + spread * (Math.random() - 0.5);
};
ParticleEngine.prototype.randomVector3 = function (base, spread) {
  var rand3 = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
  return new THREE.Vector3().addVectors(base, new THREE.Vector3().multiplyVectors(spread, rand3));
};

ParticleEngine.prototype.createParticle = function () {
  var particle = new Particle();

  particle.sizeTween = this.sizeTween;
  particle.colorTween = this.colorTween;
  particle.opacityTween = this.opacityTween;

  if (this.positionStyle === Type.CUBE) {
    particle.position = this.randomVector3(this.positionBase, this.positionSpread);
  }
  if (this.positionStyle === Type.SPHERE) {
    var z = 2 * Math.random() - 1;
    var t = 6.2832 * Math.random();
    var r = Math.sqrt(1 - z * z);
    var vec3 = new THREE.Vector3(r * Math.cos(t), r * Math.sin(t), z);
    particle.position = new THREE.Vector3().addVectors(this.positionBase, vec3.multiplyScalar(this.positionRadius));
  }

  if (this.velocityStyle === Type.CUBE) {
    particle.velocity = this.randomVector3(this.velocityBase, this.velocitySpread);
  }
  if (this.velocityStyle === Type.SPHERE) {
    var direction = new THREE.Vector3().subVectors(particle.position, this.positionBase);
    var speed = this.randomValue(this.speedBase, this.speedSpread);
    particle.velocity = direction.normalize().multiplyScalar(speed);
  }

  particle.acceleration = this.randomVector3(this.accelerationBase, this.accelerationSpread);

  particle.angle = this.randomValue(this.angleBase, this.angleSpread);
  particle.angleVelocity = this.randomValue(this.angleVelocityBase, this.angleVelocitySpread);
  particle.angleAcceleration = this.randomValue(this.angleAccelerationBase, this.angleAccelerationSpread);

  particle.size = this.randomValue(this.sizeBase, this.sizeSpread);

  var color = this.randomVector3(this.colorBase, this.colorSpread);
  particle.color = new THREE.Color().setHSL(color.x, color.y, color.z);

  particle.opacity = this.randomValue(this.opacityBase, this.opacitySpread);

  particle.age = 0;
  particle.alive = 0; // particles initialize as inactive
  // console.log('[ParticleEngine] createParticle', particle)
  return particle;
};

ParticleEngine.prototype.initialize = function () {
  // link particle data with geometry/material data
  let geovertices = [];
  let geocustomvisible = [];
  let geocustomcolor = [];
  let geocustomopacity = [];
  let geocustomsize = [];
  let geocustomangle = [];
  for (var i = 0; i < this.particleCount; i++) {
    // remove duplicate code somehow, here and in update function below.
    this.particleArray[i] = this.createParticle();
    geovertices = geovertices.concat([this.particleArray[i].position.x, this.particleArray[i].position.y, this.particleArray[i].position.z]);
    geocustomvisible.push(this.particleArray[i].alive);
    geocustomcolor = geocustomcolor.concat([this.particleArray[i].color.r, this.particleArray[i].color.g, this.particleArray[i].color.b]);
    geocustomopacity.push(this.particleArray[i].opacity);
    geocustomsize.push(this.particleArray[i].size);
    geocustomangle.push(this.particleArray[i].angle);
  }
  this.particleGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(geovertices), 3));
  this.particleGeometry.addAttribute('customVisible', new THREE.BufferAttribute(new Float32Array(geocustomvisible), 1));
  this.particleGeometry.addAttribute('customColor', new THREE.BufferAttribute(new Float32Array(geocustomcolor), 3));
  this.particleGeometry.addAttribute('customOpacity', new THREE.BufferAttribute(new Float32Array(geocustomopacity), 1));
  this.particleGeometry.addAttribute('customSize', new THREE.BufferAttribute(new Float32Array(geocustomsize), 1));
  this.particleGeometry.addAttribute('customAngle', new THREE.BufferAttribute(new Float32Array(geocustomangle), 1));

  this.particleMaterial.blending = this.blendStyle;
  this.particleMaterial.depthWrite = false;
  // if (this.blendStyle !== NormalBlending) {
  //   this.particleMaterial.depthWrite = false
  // }

  this.particleMesh = new THREE.Points(this.particleGeometry, this.particleMaterial);
  this.particleMesh.dynamic = true;
  this.particleMesh.sortParticles = true;
  // scene.add(this.particleMesh)
};

ParticleEngine.prototype.update = function (dt) {
  // determine indices of particles to activate
  if (this.lastIndex === -1) this.lastIndex = Math.floor(this.particlesPerSecond * (this.emitterAge + 0));
  if (this.lastIndex < this.particleCount) {
    var endIndex = Math.floor(this.particlesPerSecond * (this.emitterAge + dt));
    if (endIndex > this.particleCount) endIndex = this.particleCount;
    for (let i = this.lastIndex; i < endIndex; ++i) {
      this.particleArray[i].alive = 1.0;
    }
    this.lastIndex = endIndex;
  }

  var recycleIndices = [];

  // update particle data
  for (var i = 0; i < this.particleCount; i++) {
    if (this.particleArray[i].alive === 1.0) {
      this.particleArray[i].update(dt);

      // check if particle should expire
      // could also use: death by size<0 or alpha<0.
      if (this.particleArray[i].age > this.particleDeathAge) {
        this.particleArray[i].alive = 0.0;
        recycleIndices.push(i);
      }
      // update particle properties in shader
      this.particleGeometry.attributes.position.array[i * 3] = this.particleArray[i].position.x;
      this.particleGeometry.attributes.position.array[i * 3 + 1] = this.particleArray[i].position.y;
      this.particleGeometry.attributes.position.array[i * 3 + 2] = this.particleArray[i].position.z;

      this.particleGeometry.attributes.customVisible.array[i] = this.particleArray[i].alive;
      this.particleGeometry.attributes.customColor.array[i * 3] = this.particleArray[i].color.r;
      this.particleGeometry.attributes.customColor.array[i * 3 + 1] = this.particleArray[i].color.g;
      this.particleGeometry.attributes.customColor.array[i * 3 + 2] = this.particleArray[i].color.b;
      this.particleGeometry.attributes.customOpacity.array[i] = this.particleArray[i].opacity;
      this.particleGeometry.attributes.customSize.array[i] = this.particleArray[i].size;
      this.particleGeometry.attributes.customAngle.array[i] = this.particleArray[i].angle;
    }
  }

  this.particleGeometry.attributes.position.needsUpdate = true;
  this.particleGeometry.attributes.customVisible.needsUpdate = true;
  this.particleGeometry.attributes.customColor.needsUpdate = true;
  this.particleGeometry.attributes.customOpacity.needsUpdate = true;
  this.particleGeometry.attributes.customSize.needsUpdate = true;
  this.particleGeometry.attributes.customAngle.needsUpdate = true;

  // check if particle emitter is still running
  if (!this.emitterAlive) return;

  // if any particles have died while the emitter is still running, we imediately recycle them
  for (var j = 0; j < recycleIndices.length; j++) {
    let i = recycleIndices[j];
    this.particleArray[i] = this.createParticle();
    this.particleArray[i].alive = 1.0; // activate right away
    this.particleArray[i].update(dt);
    this.particleGeometry.attributes.position.array[i * 3] = this.particleArray[i].position.x;
    this.particleGeometry.attributes.position.array[i * 3 + 1] = this.particleArray[i].position.y;
    this.particleGeometry.attributes.position.array[i * 3 + 2] = this.particleArray[i].position.z;

    this.particleGeometry.attributes.customVisible.array[i] = this.particleArray[i].alive;
    this.particleGeometry.attributes.customColor.array[i * 3] = this.particleArray[i].color.r;
    this.particleGeometry.attributes.customColor.array[i * 3 + 1] = this.particleArray[i].color.g;
    this.particleGeometry.attributes.customColor.array[i * 3 + 2] = this.particleArray[i].color.b;
    this.particleGeometry.attributes.customOpacity.array[i] = this.particleArray[i].opacity;
    this.particleGeometry.attributes.customSize.array[i] = this.particleArray[i].size;
    this.particleGeometry.attributes.customAngle.array[i] = this.particleArray[i].angle;
  }

  this.particleGeometry.attributes.position.needsUpdate = true;
  this.particleGeometry.attributes.customVisible.needsUpdate = true;
  this.particleGeometry.attributes.customColor.needsUpdate = true;
  this.particleGeometry.attributes.customOpacity.needsUpdate = true;
  this.particleGeometry.attributes.customSize.needsUpdate = true;
  this.particleGeometry.attributes.customAngle.needsUpdate = true;

  // stop emitter?
  this.emitterAge += dt;
  if (this.emitterAge > this.emitterDeathAge) this.emitterAlive = false;
};

ParticleEngine.prototype.destroy = function () {}
// scene.remove(this.particleMesh)

/// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /

;

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shaders_phong_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__shaders_depth_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__shaders_Matcap_js__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ParticleEngine_ParticleEngine_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ParticleEngine_ParticleEngineExamples_js__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_util__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_util___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_util__);
// import * as THREE from 'three'







var container, stats;
var camera, scene, renderer;
var controls, ambientLight, directionalLight, spotLight, pointLight, planeuniform, spotLight2, verticalMirror;
var miku, stage, floor;
var depthTarget,
    postCamera,
    postScene,
    renderDepthFlag = false,
    depthuniform;
var useGPUPicker = false,
    debugGPUPicker = false;
var textureUniform,
    animationSpeed = 10;

var animationArray = [];

window.pickableObjectList = [];
window.particleEngine = null;
var spotlightHelper2, spotLightHelper, pointLightHelper;

// shadowMap variable
var SHADOW_MAP_WIDTH = 1024;
var SHADOW_MAP_HEIGHT = 1024;

// screen variable
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var NEAR = 1;
var FAR = 1000;

init();
animate();

function init() {
  // scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);

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
  renderer.shadowMap.needsUpdate = true;
  renderer.shadowMap.type = THREE.PCFShadowMap; // PCF shadowMap now
  container.appendChild(renderer.domElement);

  // control
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.addEventListener('change', render);
  controls.minDistance = 10;
  controls.maxDistance = 800;
  controls.enablePan = true;
  controls.update();

  // lights
  ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
  scene.add(ambientLight);

  // directional light
  directionalLight = new THREE.DirectionalLight(0x0000cc, 0.4);
  directionalLight.position.copy(new THREE.Vector3(0, 300, 300));
  var target = new THREE.Object3D();
  target.position.copy(new THREE.Vector3(0, 0, -5));

  scene.add(directionalLight);
  scene.add(target);
  directionalLight.target = target;

  // point light
  pointLight = new THREE.PointLight(0xff0000, 0.4, 500);
  pointLight.position.set(-25, 0, -10);
  pointLight.castShadow = true;
  scene.add(pointLight);
  var sphereSize = 1;

  pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
  pointLightHelper.visible = false;

  scene.add(pointLightHelper);

  // spotlight
  spotLight = new THREE.SpotLight(0xffff00, 1);
  spotLight.position.set(5, 95, 100);
  spotLight.angle = Math.PI / 8;
  spotLight.penumbra = 0.08;
  spotLight.decay = 2;
  spotLight.distance = 400;
  // spotLight.shadow.bias = 0.0001
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
  spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
  spotLight.shadow.camera.near = 10;
  spotLight.shadow.camera.far = 180;
  scene.add(spotLight);

  // floor texture
  let textureLoader = new THREE.TextureLoader();
  textureLoader.load('../images/floor.jpg', function (texture) {
    var material = new THREE.MeshBasicMaterial({
      map: texture,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.3
    });
    var geometry = new THREE.BoxGeometry(387, 0.0001, 266);
    //  var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} )
    floor = new THREE.Mesh(geometry, material);
    floor.position.copy(new THREE.Vector3(-27, -94, 5));
    floor.castShadow = false;
    floor.receiveShadow = true;
    scene.add(floor);
    pickableObjectList.push({ object: floor });
  }, function (xhr) {
    // console.log((xhr.loaded / xhr.total * 100) + '% loaded')
  }, function (xhr) {
    console.error('An error happened');
  });

  // Miku model
  THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());
  let mtlLoader = new THREE.MTLLoader();
  mtlLoader.setPath('../models/Miku/');
  mtlLoader.load('Miku.mtl', function (materials) {
    materials.preload();
    let objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath('../models/Miku/');
    objLoader.load('Miku.obj', function (object) {
      object.position.y = -95;
      object.position.x = -25;
      object.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
          node.castShadow = true;
          node.receiveShadow = false;
        }
      });
      miku = object;
      miku.name = 'miku';
      scene.add(object);

      // verticalMirror.target = object
      spotLight.target = object;
      object.updateMatrixWorld();

      controls.target.copy(object.position);
      controls.update();

      // stage model
      let objLoader = new THREE.OBJLoader();
      objLoader.setPath('../models/stage/');
      objLoader.load('stage.obj', function (object) {
        object.position.y -= 123.8;
        object.scale.x = 20;
        object.scale.y = 20;
        object.scale.z = 20;
        object.traverse(function (node) {
          if (node instanceof THREE.Mesh) {
            node.receiveShadow = true;
            node.castShadow = true;
          }
        });
        stage = object;
        scene.add(object);

        pickableObjectList.push({ object: miku }, { object: stage });
        initGUI();
      }, xhr => {
        // console.log(xhr)
      }, xhr => {
        console.log(xhr);
      });
    }, xhr => {
      // console.log(xhr)
    }, xhr => {
      console.log(xhr);
    });
  });

  spotLightHelper = new THREE.SpotLightHelper(spotLight);
  spotLightHelper.visible = false;
  scene.add(spotLightHelper);

  let huajiTexture = textureLoader.load("../images/huaji.png");
  let backboardTex = textureLoader.load("../images/backboard.jpg");

  let shader = THREE.ShaderLib["phong"];
  textureUniform = THREE.UniformsUtils.clone(shader.uniforms);
  textureUniform["map"].value = huajiTexture;
  textureUniform["showMapTexture"] = {
    'type': 'b',
    'value': true
  };
  textureUniform["time"] = {
    'type': 'f',
    'value': 0.5
  };
  textureUniform["texScrolling"] = {
    'type': 'b',
    'value': true
  };
  let scrollingTextureShading = new THREE.ShaderMaterial({
    fragmentShader: __WEBPACK_IMPORTED_MODULE_0__shaders_phong_js__["a" /* default */].frag,
    vertexShader: __WEBPACK_IMPORTED_MODULE_0__shaders_phong_js__["a" /* default */].vert,
    uniforms: textureUniform,
    lights: true
  });

  let huajiArray = new THREE.Group();
  let box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), scrollingTextureShading);
  huajiArray.add(box);
  box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), scrollingTextureShading);
  box.position.set(0, 10, 0);
  huajiArray.add(box);
  box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), scrollingTextureShading);
  box.position.set(0, -10, 0);
  huajiArray.add(box);
  box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), scrollingTextureShading);
  box.position.set(0, -20, 0);
  huajiArray.add(box);
  box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), scrollingTextureShading);
  box.position.set(0, -30, 0);
  huajiArray.add(box);
  box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), scrollingTextureShading);
  box.position.set(0, -40, 0);
  huajiArray.add(box);
  box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), scrollingTextureShading);
  box.position.set(0, -50, 0);
  huajiArray.add(box);
  huajiArray.position.set(140, -40, -90);
  huajiArray.updateMatrixWorld();
  scene.add(huajiArray);
  pickableObjectList.push({ object: huajiArray });
  huajiArray = huajiArray.clone();
  huajiArray.position.set(-190, -40, -90);
  scene.add(huajiArray);
  pickableObjectList.push({ object: huajiArray });
  huajiArray = huajiArray.clone();
  huajiArray.position.set(-190, -40, 105);
  scene.add(huajiArray);
  pickableObjectList.push({ object: huajiArray });
  huajiArray = huajiArray.clone();
  huajiArray.position.set(140, -40, 105);
  scene.add(huajiArray);
  pickableObjectList.push({ object: huajiArray });
  window.huajiArray = huajiArray;
  particleSystem('clouds');

  // projective texture mapping
  spotLight2 = new THREE.SpotLight(0xffff00, 0.3);
  spotLight2.position.set(-70, 95, 100);
  spotLight2.angle = Math.PI / 8;
  spotLight2.penumbra = 0.08;
  spotLight2.decay = 2;
  spotLight2.distance = 400;
  spotLight2.castShadow = true;
  spotLight2.shadow.mapSize.width = SHADOW_MAP_WIDTH;
  spotLight2.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
  spotLight2.shadow.camera.near = 10;
  spotLight2.shadow.camera.far = 180;

  planeuniform = THREE.UniformsUtils.clone(shader.uniforms);
  planeuniform["diffuse"] = {
    type: 'c',
    value: new THREE.Color(0xffffff)
  };
  planeuniform["showMapTexture"] = {
    type: 'b',
    value: true
  };
  planeuniform["blendingParam"] = {
    type: 'f',
    value: 0.5
  };
  planeuniform["map"] = {
    value: backboardTex
  };
  planeuniform["mapProj"] = {
    "type": "t",
    "value": huajiTexture
  };
  planeuniform["textureMatrixProj"] = {
    "type": "m4",
    "value": new THREE.Matrix4()
  };
  planeuniform["spotLightPosition"] = {
    value: spotLight2.position
  };
  planeuniform['spotLightColor'] = {
    value: new THREE.Color(0xffffff)
  };
  planeuniform['texScrolling'] = {
    value: false
  };
  let planegeo = new THREE.PlaneBufferGeometry(390, 200);
  let planemtl = new THREE.ShaderMaterial({
    fragmentShader: __WEBPACK_IMPORTED_MODULE_0__shaders_phong_js__["a" /* default */].frag,
    vertexShader: __WEBPACK_IMPORTED_MODULE_0__shaders_phong_js__["a" /* default */].vert,
    uniforms: planeuniform,
    lights: true
  });
  let plane = new THREE.Mesh(planegeo, planemtl);
  plane.position.set(-30, 0, -130);
  scene.add(plane);

  let targetObject = new THREE.Object3D();
  targetObject.position.set(0, -20, -120);
  spotLight2.target = targetObject;
  targetObject.updateMatrixWorld();
  scene.add(spotLight2);
  scene.add(targetObject);

  spotlightHelper2 = new THREE.SpotLightHelper(spotLight2);
  spotlightHelper2.visible = false;
  scene.add(spotlightHelper2);
  plane.material.uniforms.textureMatrixProj.value = makeProjectiveMatrixForLight(spotLight2);

  initDepth();
  initMatcap();

  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener('mouseup', pick, false);

  //mirror reflector
  verticalMirror = new THREE.Reflector(400, 350, {
    clipBias: 0.002,
    textureWidth: SCREEN_WIDTH * window.devicePixelRatio,
    textureHeight: SCREEN_HEIGHT * window.devicePixelRatio,
    color: 0x889999,
    recursion: 1
  });
  verticalMirror.position.y = 50;
  verticalMirror.position.x = -260;
  verticalMirror.position.z = -70;
  verticalMirror.rotateY(Math.PI / 2);
  verticalMirror.visible = false;
  // verticalMirror.lookAtPosition.add(-camera.matrixWorld.position)
  scene.add(verticalMirror);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

var lastTime = null;

function animate(time) {
  if (!lastTime) {
    lastTime = time;
  }
  textureUniform.time.value = time / 10000 * animationSpeed;
  requestAnimationFrame(animate);
  let delta = (time - lastTime) / 400;
  animationArray.map((a, i) => {
    if (a.duration > 0) {
      a.direction.normalize();
      a.target.position.x += delta * animationSpeed * a.direction.x;
      a.target.position.y += delta * animationSpeed * a.direction.y;
      a.target.position.z += delta * animationSpeed * a.direction.z;
      a.duration -= delta;

      spotLightHelper.update();
    }
  });
  if (particleEngine) {
    particleEngine.update(delta);
  }
  lastTime = time;
  render();
  if (renderDepthFlag) {
    renderer.render(postScene, postCamera);
  }
}

function render() {
  if (renderDepthFlag) {
    renderer.render(scene, camera, depthTarget);
  } else {
    renderer.render(scene, camera);
  }
}

function makeProjectiveMatrixForLight(l) {
  var lightCamera = new THREE.PerspectiveCamera(l.angle * 180 / Math.PI, 1.0, 1, 1000);
  var lightMatrix = new THREE.Matrix4();
  var targetPosition = new THREE.Vector3();

  lightCamera.position.setFromMatrixPosition(l.matrixWorld);
  targetPosition.setFromMatrixPosition(l.target.matrixWorld);
  lightCamera.lookAt(targetPosition);
  lightCamera.updateMatrixWorld();

  lightCamera.matrixWorldInverse.getInverse(lightCamera.matrixWorld);

  lightMatrix.set(0.5, 0.0, 0.0, 0.5, 0.0, 0.5, 0.0, 0.5, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0, 1.0);

  lightMatrix.multiply(lightCamera.projectionMatrix);
  lightMatrix.multiply(lightCamera.matrixWorldInverse);

  return lightMatrix;
}

function initGUI() {
  let gui = new dat.GUI({
    width: '300px'
  });

  let basicConf = {
    'animation speed': animationSpeed
  };
  gui.add(basicConf, 'animation speed').min(1.0).max(80.0).step(1.0).onChange(v => {
    animationSpeed = v;
  });

  let folder = gui.addFolder("Miku");
  let shadingConf = {
    'Shading': 'Smooth Shading'
  };
  folder.add(shadingConf, 'Shading', ['Smooth Shading', 'Flat Shading']).onChange(value => {
    miku.traverse(node => {
      if (node instanceof THREE.Mesh) {
        if (value == 'Flat Shading') {
          if (node.material instanceof THREE.MeshPhongMaterial) {
            node.material.flatShading = true;
            node.material.needsUpdate = true;
          } else {
            for (let k in node.material) {
              node.material[k].flatShading = true;
              node.material[k].needsUpdate = true;
            }
          }
        } else {
          if (node.material instanceof THREE.MeshPhongMaterial) {
            node.material.flatShading = false;
            node.material.needsUpdate = true;
          } else {
            for (let k in node.material) {
              node.material[k].flatShading = false;
              node.material[k].needsUpdate = true;
            }
          }
        }
      }
    });
  });

  folder = gui.addFolder("Directional Light");
  let directionalLightConf = {
    visible: directionalLight.visible,
    color: directionalLight.color.getStyle()
  };
  folder.add(directionalLightConf, 'visible').onChange(() => {
    directionalLight.visible = directionalLightConf['visible'];
  });
  folder.addColor(directionalLightConf, 'color').onChange(value => {
    directionalLight.color.setStyle(value);
  });
  // folder.open()

  folder = gui.addFolder("Point Light");
  let pointLightConf = {
    visible: pointLight.visible,
    color: pointLight.color.getStyle(),
    castShadow: pointLight.castShadow
  };
  folder.add(pointLightConf, 'visible').onChange(() => {
    pointLight.visible = pointLightConf['visible'];
  });
  folder.addColor(pointLightConf, 'color').onChange(value => {
    pointLight.color.setStyle(value);
  });
  folder.add(pointLightConf, 'castShadow').onChange(() => {
    pointLight.castShadow = pointLightConf['castShadow'];
  });
  // folder.open()

  folder = gui.addFolder("Spot Light");
  let spotLightConf = {
    visible: spotLight.visible,
    color: spotLight.color.getStyle(),
    castShadow: spotLight.castShadow
  };
  folder.add(spotLightConf, 'visible').onChange(() => {
    spotLight.visible = spotLightConf['visible'];
  });
  folder.addColor(spotLightConf, 'color').onChange(value => {
    spotLight.color.setStyle(value);
  });
  folder.add(spotLightConf, 'castShadow').onChange(() => {
    spotLight.castShadow = spotLightConf['castShadow'];
  });

  /*
  Type: Value
  BasicShadowMap: 0
  PCFShadowMap: 1
  PCFSoftShadowMap: 2
  */
  folder = gui.addFolder("ShadowMap");
  let ShadowMapConf = {
    ShadowMapType: renderer.shadowMap.type
  };
  folder.add(ShadowMapConf, 'ShadowMapType').min(0).max(2).step(1).onChange(value => {
    renderer.shadowMap.type = value;
    renderer.clearTarget(spotLight.shadow.map);
    miku.traverse(node => {
      if (node instanceof THREE.Mesh) {
        if (node.material instanceof THREE.MeshPhongMaterial) {
          node.material.needsUpdate = true;
        } else {
          for (let k in node.material) {
            node.material[k].needsUpdate = true;
          }
        }
      } else {
        if (node.material instanceof THREE.MeshPhongMaterial) {
          node.material.needsUpdate = true;
        } else {
          for (let k in node.material) {
            node.material[k].needsUpdate = true;
          }
        }
      }
    });
    stage.traverse(node => {
      if (node instanceof THREE.Mesh) {
        if (node.material instanceof THREE.MeshPhongMaterial) {
          node.material.needsUpdate = true;
        } else {
          for (let k in node.material) {
            node.material[k].needsUpdate = true;
          }
        }
      } else {
        if (node.material instanceof THREE.MeshPhongMaterial) {
          node.material.needsUpdate = true;
        } else {
          for (let k in node.material) {
            node.material[k].needsUpdate = true;
          }
        }
      }
    });
  });

  folder = gui.addFolder("Mirror");
  let MirrorConf = {
    mirror: verticalMirror.visible
  };
  folder.add(MirrorConf, 'mirror').onChange(value => {
    verticalMirror.visible = value;
    pointLight.visible = !value;
    spotLight.visible = !value;
    directionalLight.visible = !value;
  });

  folder = gui.addFolder("Helper");
  let HelperConf = {
    spotLightHelper1: spotLightHelper.visible,
    spotLightHelper2: spotlightHelper2.visible,
    pointLightHelper: pointLightHelper.visible
  };
  folder.add(HelperConf, 'spotLightHelper1').onChange(value => {
    spotLightHelper.visible = value;
  });
  folder.add(HelperConf, 'spotLightHelper2').onChange(value => {
    spotlightHelper2.visible = value;
  });
  folder.add(HelperConf, 'pointLightHelper').onChange(value => {
    pointLightHelper.visible = value;
  });
  // folder.open()

  folder = gui.addFolder("Projective texturing");
  let projectiveConf = {
    showMapTexture: planeuniform.showMapTexture.value,
    blendingParam: planeuniform.blendingParam.value
  };
  folder.add(projectiveConf, 'showMapTexture').onChange(v => {
    planeuniform.showMapTexture.value = v;
  });
  folder.add(projectiveConf, 'blendingParam').min(0.0).max(1.0).step(0.1).onChange(v => {
    planeuniform.blendingParam.value = v;
  });

  folder = gui.addFolder("Depth Buffer");
  let depthConf = {
    'render depth': renderDepthFlag,
    'camera near': depthuniform.cameraNear.value,
    'camera far': depthuniform.cameraFar.value
  };
  folder.add(depthConf, 'render depth').onChange(v => {
    renderDepthFlag = v;
    if (v === false) {
      camera.near = NEAR;
      camera.far = FAR;
      camera.updateProjectionMatrix();
    }
  });
  folder.add(depthConf, 'camera near').min(1).max(100).step(1.0).onChange(v => {
    camera.near = v;
    camera.updateProjectionMatrix();
  });
  folder.add(depthConf, 'camera far').min(500).max(FAR).step(1.0).onChange(v => {
    camera.far = v;
    camera.updateProjectionMatrix();
  });

  folder = gui.addFolder("GPU Picker");
  let gpuPickerConf = {
    'enable': useGPUPicker,
    'debug': debugGPUPicker
  };
  folder.add(gpuPickerConf, 'enable').onChange(v => {
    useGPUPicker = v;
  });
  folder.add(gpuPickerConf, 'debug').onChange(v => {
    debugGPUPicker = v;
  });
}

function particleSystem(effectName) {
  let example = new __WEBPACK_IMPORTED_MODULE_4__ParticleEngine_ParticleEngineExamples_js__["a" /* Examples */]();
  let paras = example.getEffect(effectName);

  if (!paras) {
    console.error('[particle system] no parameters');
  }

  let path = paras.particleTexturePath;
  let loader = new THREE.TextureLoader();
  loader.load('../images/smokeparticle.png', _texture => {
    paras.particleTexture = _texture;
    paras.positionBase = new THREE.Vector3(-50, 140, 0);
    paras.positionSpread = new THREE.Vector3(300, 0, 200);
    paras.sizeBase = 100;
    paras.sizeSpread = 60;
    paras.colorBase = new THREE.Vector3(173 / 360, 0.67, 0.6);
    paras.particlesPerSecond = 60;
    paras.particleDeathAge = 10;
    paras.emitterDeathAge = 900;
    let group = new THREE.Group();
    particleEngine = new __WEBPACK_IMPORTED_MODULE_3__ParticleEngine_ParticleEngine_js__["a" /* ParticleEngine */]();
    particleEngine.setValues(paras);
    particleEngine.initialize();

    group.add(particleEngine.particleMesh);
    scene.add(group);
  }, xhr => {
    console.log(xhr.loaded / xhr.total + '% loaded ' + path);
  }, xhr => {
    console.warn('[ParticleEffectsMarker] an error happened while loading ' + path);
  });
}

function initDepth() {
  if (depthTarget) {
    depthTarget.dispose();
  }
  depthTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
  depthTarget.texture.format = THREE.RGBFormat;
  depthTarget.texture.minFilter = THREE.NearestFilter;
  depthTarget.texture.magFilter = THREE.NearestFilter;
  depthTarget.texture.generateMipmaps = false;
  depthTarget.stencilBuffer = false;
  depthTarget.depthBuffer = true;
  depthTarget.depthTexture = new THREE.DepthTexture();
  depthTarget.depthTexture.type = THREE.UnsignedShortType;

  postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  depthuniform = {
    cameraNear: { value: camera.near },
    cameraFar: { value: camera.far },
    tDiffuse: { value: depthTarget.texture },
    tDepth: { value: depthTarget.depthTexture }
  };
  var postMaterial = new THREE.ShaderMaterial({
    vertexShader: __WEBPACK_IMPORTED_MODULE_1__shaders_depth_js__["a" /* default */].vert,
    fragmentShader: __WEBPACK_IMPORTED_MODULE_1__shaders_depth_js__["a" /* default */].frag,
    uniforms: depthuniform
  });
  var postPlane = new THREE.PlaneBufferGeometry(2, 2);
  var postQuad = new THREE.Mesh(postPlane, postMaterial);
  postScene = new THREE.Scene();
  postScene.add(postQuad);
}

var GPUPickerMaterial = new THREE.ShaderMaterial({
  uniforms: {
    color: {
      value: new THREE.Color()
    }
  },
  vertexShader: `
  void main(){
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  fragmentShader: `
  uniform vec3 color;
  void main(){
    gl_FragColor = vec4(color, 1.0);
  }
  `
});
var visibilityMapping = {};
function pick(event) {
  if (event.button === 0 && useGPUPicker) {
    let x = event.clientX;
    let y = event.clientY;
    let mouse = { x, y };
    let offsetTimes = 2000;

    scene.traverse(obj => {
      visibilityMapping[obj.uuid] = obj.visible;
      obj.visible = false;
    });
    scene.visible = true;

    pickableObjectList.map((obj, index) => {
      obj.object.visible = true;
      obj.ID = index * offsetTimes;
      obj.materials = [];
      obj.object.traverse(c => {
        c.visible = true;
        if (c instanceof THREE.Mesh) {
          c.visible = true;
          obj.materials.push(c.material);
          c.material = GPUPickerMaterial.clone();
          c.material.uniforms.color.value = new THREE.Color().setHex(obj.ID);
        }
      });
    });
    // renderer.render(scene, camera)

    let pickingTexture = new THREE.WebGLRenderTarget();
    let size = renderer.getSize();
    let pixelBuffer = new Uint8Array(4 * size.width * size.height);
    pickingTexture.setSize(size.width, size.height);
    pickingTexture.texture.minFilter = THREE.LinearFilter;
    pickingTexture.texture.generateMipmaps = false;
    renderer.render(scene, camera, pickingTexture);
    renderer.readRenderTargetPixels(pickingTexture, 0, 0, size.width, size.height, pixelBuffer);

    if (debugGPUPicker) {
      var canvaswindow = window.open("", "_blank");
      canvaswindow.document.write(`
          <title>test</title>
          <p>test</p>
          <p>rgb</p>
          <div><canvas id="targetrgb" width=${size.width} height=${size.height} /></div>
          `);
      var c = canvaswindow.document.getElementById('targetrgb');
      var ctx = c.getContext("2d");
      ctx.clearRect(0, 0, size.width, size.height);
      var rgbimdata = ctx.createImageData(size.width, size.height);
      for (let i = 0; i < rgbimdata.data.length; i += 1) {
        rgbimdata.data[i] = pixelBuffer[i];
      }
      ctx.putImageData(rgbimdata, 0, 0);
    }

    // restore visibility
    pickableObjectList.map(obj => {
      obj.object.traverse(c => {
        if (c instanceof THREE.Mesh) {
          c.material = obj.materials.shift();
        }
      });
    });

    scene.traverse(obj => {
      obj.visible = visibilityMapping[obj.uuid];
    });

    let index = (mouse.x + (pickingTexture.height - mouse.y) * pickingTexture.width) * 4;
    let id = pixelBuffer[index] << 16 | pixelBuffer[index + 1] << 8 | pixelBuffer[index + 2];
    if (id / offsetTimes < pickableObjectList.length) {
      let result;
      pickableObjectList.map(obj => {
        if (obj.ID === id) {
          result = obj.object;
        }
      });
      // console.log(result)
      if (result.name === 'miku') {
        for (let i = 0; i < animationArray.length; ++i) {
          if (animationArray[i].duration < 0) {
            animationArray.splice(i, 1);
            i--;
          }
        }
        animationArray.push({ target: result, direction: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5), duration: 1.0 });
      }
    } else {
      console.log('no object picked');
    }
    pickingTexture.dispose();
  }
}

function initMatcap() {
  let material = new __WEBPACK_IMPORTED_MODULE_2__shaders_Matcap_js__["a" /* default */]({
    'name': 'matcap material',
    'MatcapTexturePath': '../images/matcap-6.jpg'
  });
  var geometry = new THREE.TorusKnotBufferGeometry(10, 3, 100, 16);
  var torus = new THREE.Mesh(geometry, material);
  torus.position.set(100, 0, 0);
  scene.add(torus);
}

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var phong = {};

phong.frag = `
#define PHONG
#define USE_MAP
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
uniform bool showMapTexture;
uniform float time;
uniform bool texScrolling;
uniform sampler2D mapProj;
varying vec4 texCoordProj;
varying vec3 vNormalProj;
varying vec3 vViewPositionProj;
uniform vec3 spotLightPosition;
uniform vec3 spotLightColor;
uniform float blendingParam;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
  #ifdef USE_MAP
    if (showMapTexture) {
			vec2 transformedvUv = vec2(vUv);
			if (texScrolling) {
				transformedvUv.x = mod(transformedvUv.x + time, 1.0);
			}
      vec4 texelColor = texture2D( map, transformedvUv );
      texelColor = mapTexelToLinear( texelColor );
      diffuseColor *= texelColor;
    }
  #endif
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	#ifdef DOUBLE_SIDED
		float flipNormal = ( float( gl_FrontFacing ) * 2.0 - 1.0 );
	#else
		float flipNormal = 1.0;
	#endif
	#include <normal_fragment>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_template>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#ifdef USE_MAP
		if (showMapTexture) {
			outgoingLight = outgoingLight * blendingParam + diffuseColor.xyz * (1.0 - blendingParam);
		}
	#endif
	gl_FragColor = vec4( outgoingLight, diffuseColor.a );

	vec4 texColorProj = texCoordProj.q < 0.0 ? vec4(0.0, 0.0, 0.0, 0.0) : texture2DProj( mapProj, texCoordProj); // for projective texturing

	gl_FragColor.xyz += texColorProj.xyz;

	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}
`;

phong.vert = `
#define PHONG
#define USE_MAP
varying vec3 vViewPosition;
uniform mat4 textureMatrixProj;
varying vec4 texCoordProj;
varying vec3 vNormalProj;
varying vec3 vViewPositionProj;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_METALNESSMAP )

		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;

	#endif
	#include <uv2_vertex>
	#include <color_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#ifndef FLAT_SHADED
		vNormal = normalize( transformedNormal );
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
	texCoordProj = textureMatrixProj * modelMatrix * vec4(position, 1.0);
	vNormalProj = normalMatrix * normal;
	vNormalProj = normalize(vNormalProj);
	vViewPositionProj = -(modelMatrix * vec4(position, 1.0)).xyz;
}
`;

/* harmony default export */ __webpack_exports__["a"] = (phong);

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var depthShader = {};

depthShader.vert = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

depthShader.frag = `
#include <packing>
varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform sampler2D tDepth;
uniform float cameraNear;
uniform float cameraFar;

float readDepth (sampler2D depthSampler, vec2 coord) {
  float fragCoordZ = texture2D(depthSampler, coord).x;
  float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
  return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
}

float remap( float minval, float maxval, float curval )
{
    return ( curval - minval ) / ( maxval - minval );
}

void main() {
  // vec3 diffuse = texture2D(tDiffuse, vUv).rgb;
  float depth = readDepth(tDepth, vUv);

  const vec4 GREEN = vec4( 0.0, 1.0, 0.0, 1.0 );
  const vec4 BLUE = vec4( 0.0, 0.0, 1.0, 1.0 );
  const vec4 RED   = vec4( 1.0, 0.0, 0.0, 1.0 );

  if( depth < 0.5 )
    gl_FragColor = mix( GREEN, BLUE, remap( 0.0, 0.5, depth ) );
  else
    gl_FragColor = mix( BLUE, RED, remap( 0.5, 1.0, depth ) );
  // gl_FragColor.rgb = vec3(depth);
  // gl_FragColor.a = 1.0;
}
`;

/* harmony default export */ __webpack_exports__["a"] = (depthShader);

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var MatcapSelfShaderMaterialParameters = {
  uniforms: {
    // mtl parameters
    bumpMapUsed: { type: 'f', value: 0.0 }, // mtl bump or map_bump exists
    bumpMap: { type: 't', value: null }, // mtl map_bump
    bumpScale: { type: 'f', value: 1.0 }, // mtl bump or map_bump scale
    bumpMapPath: { value: null },
    normalMapUsed: { type: 'f', value: 0.0 }, // the normal map
    normalMap: { type: 't', value: null },
    normalScale: { type: 'v2', value: [1.0, 1.0] },
    normalMapPath: { value: null },
    displacementMapUsed: { type: 'f', value: 0.0 },
    displacementMap: { type: 't', value: null },
    displacementScale: { type: 'f', value: 0.0 },
    displacementBias: { type: 'f', value: 0.0 },
    displacementMapPath: { value: null },

    ka: { type: 'v3', value: [0.2, 0.2, 0.2] }, // mtl ka, ambient color
    mapKaUsed: { type: 'f', value: 0.0 },
    mapKa: { type: 't', value: null },
    mapKaPath: { value: null },
    mapKaWidth: { type: 'f', value: 1.0 },
    mapKaHeight: { type: 'f', value: 1.0 },
    kd: { type: 'v3', value: [0.1, 0.1, 1.0] }, // mtl kd, diffuse color
    mapKdUsed: { type: 'f', value: 0.0 }, // mtl map_kd exists or not
    mapKd: { type: 't', value: null }, // mtl map_kd, diffuse map
    mapKdPath: { value: null },
    mapKdWidth: { type: 'f', value: 1.0 },
    mapKdHeight: { type: 'f', value: 1.0 },
    ks: { type: 'v3', value: [1.0, 0.1, 0.1] }, // mtl ks, specular color
    mapKsUsed: { type: 'f', value: 0.0 },
    mapKs: { type: 't', value: null },
    mapKsPath: { value: null },
    mapKsWidth: { type: 'f', value: 1.0 },
    mapKsHeight: { type: 'f', value: 1.0 },
    ns: { type: 'f', value: 20.0 }, // mtl ns, specular shininess

    d: { type: 'f', value: 1.0 }, // opacity, the alpha channel

    // matcap parameters
    MatcapTextureUsed: { type: 'f', value: 0.0 },
    MatcapTexture: { type: 't', value: null },
    MatcapTexturePath: { value: null },
    fraction: { type: 'v3', value: [1.0, 1.0, 1.0] }
  },
  vertexShader: `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
uniform float displacementMapUsed;
uniform sampler2D displacementMap;
uniform float displacementScale;
uniform float displacementBias;
vec3 displacementMapOffset(vec3 normal, vec2 uv){
  if(displacementMapUsed>0.5){
    return normalize(normal) * (texture2D(displacementMap, uv).x * displacementScale + displacementBias);
  }else{
    return vec3(0.0);
  }
}
void main()
{
  // passing texture to fragment shader
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vViewPosition = -(modelViewMatrix * vec4(position, 1.0)).xyz;

  vec3 transformedPosition = position + displacementMapOffset(normal, uv);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformedPosition,1.0);
}
`,
  fragmentShader: `
#define USE_BUMPMAP
#define USE_NORMALMAP
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

uniform sampler2D MatcapTexture;
uniform float MatcapTextureUsed;

uniform float bumpMapUsed;
uniform float normalMapUsed;

uniform vec3 fraction;
` + THREE.ShaderChunk['bumpmap_pars_fragment'] + THREE.ShaderChunk['normalmap_pars_fragment'] + `
void main() {
  vec3 modelPosition = -vViewPosition;
  vec3 treatedNormal = normalize(vNormal);
  if(bumpMapUsed>0.5)treatedNormal = perturbNormalArb(modelPosition, treatedNormal, dHdxy_fwd());
  if(normalMapUsed>0.5)treatedNormal = perturbNormal2Arb( modelPosition, treatedNormal );
  vec3 r = reflect(treatedNormal, normalize(modelPosition));
  float m = 2.0 * sqrt(pow(r.x,2.0)+pow(r.y,2.0)+pow(r.z+1.5,2.0));
  vec2 matcapuv = r.xy / m + 0.5;  

  vec3 base = fraction;
  if(MatcapTextureUsed > 0.5){
    base *= texture2D(MatcapTexture, matcapuv).rgb;
  }

  gl_FragColor = vec4(base,1.0);
}
`
};

class MTLMatcapShaderMaterial extends THREE.ShaderMaterial {
  constructor(options) {
    super();
    this.uniforms = JSON.parse(JSON.stringify(MatcapSelfShaderMaterialParameters.uniforms));
    this.vertexShader = MatcapSelfShaderMaterialParameters.vertexShader;
    this.fragmentShader = MatcapSelfShaderMaterialParameters.fragmentShader;
    this.transparent = true;
    this.extensions.derivatives = true;

    this.name = options.name;
    let bumpPath = options.bump;
    if (bumpPath !== undefined && bumpPath !== null) {
      this._loadTexture(bumpPath, this.uniforms.bumpMap, this.uniforms.bumpMapUsed, this.uniforms.bumpMapPath);
    }
    let MatcapTexturePath = options.MatcapTexturePath;
    if (MatcapTexturePath !== undefined && MatcapTexturePath !== null) {
      this._loadTexture(MatcapTexturePath, this.uniforms.MatcapTexture, this.uniforms.MatcapTextureUsed, this.uniforms.MatcapTexturePath);
    }
    if (options.fraction) {
      this.uniforms.fraction.value = options.fraction;
    }
  }

  loadMatcapTexture(path) {
    this._loadTexture(path, this.uniforms.MatcapTexture, this.uniforms.MatcapTextureUsed, this.uniforms.MatcapTexturePath);
  }

  _loadTexture(path, textureObject, textureUsedObject, texturePathObject) {
    if (path === '') {
      textureUsedObject.value = 0.0;
      return;
    }
    var loader = new THREE.TextureLoader();
    loader.setCrossOrigin('');
    loader.withCredentials = true;
    loader.load(path, _texture => {
      textureObject.value = _texture;
      texturePathObject.value = path;
      textureUsedObject.value = 1.0;
    }, xhr => {
      // console.log(xhr.loaded / xhr.total * 100.0 + '% loaded ' + path)
    }, xhr => {
      console.warn('an error happened while loading ' + path);
    });
  }

  setMatcapTextureFraction(value) {
    this.uniforms.fraction.value = value;
    this.description.fraction = value;
  }
}

/* harmony default export */ __webpack_exports__["a"] = (MTLMatcapShaderMaterial);

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Examples; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ParticleEngine_js__ = __webpack_require__(0);

/**
* @author Lee Stemkoski   http://www.adelphi.edu/~stemkoski/
*/

/*
  Particle Engine options:

  positionBase   : new THREE.THREE.Vector3(),
  positionStyle : Type.CUBE or Type.SPHERE,

  // for Type.CUBE
  positionSpread  : new THREE.THREE.Vector3(),

  // for Type.SPHERE
  positionRadius  : 10,

  velocityStyle : Type.CUBE or Type.SPHERE,

  // for Type.CUBE
  velocityBase       : new THREE.THREE.Vector3(),
  velocitySpread     : new THREE.THREE.Vector3(),

  // for Type.SPHERE
  speedBase   : 20,
  speedSpread : 10,

  accelerationBase   : new THREE.THREE.Vector3(),
  accelerationSpread : new THREE.THREE.Vector3(),

  particleTexture : THREE.ImageUtils.loadTexture( 'images/star.png' ),

  // rotation of image used for particles
  angleBase               : 0,
  angleSpread             : 0,
  angleVelocityBase       : 0,
  angleVelocitySpread     : 0,
  angleAccelerationBase   : 0,
  angleAccelerationSpread : 0,

  // size, color, opacity
  //   for static  values, use base/spread
  //   for dynamic values, use Tween
  //   (non-empty Tween takes precedence)
  sizeBase   : 20.0,
  sizeSpread : 5.0,
  sizeTween  : new Tween( [0, 1], [1, 20] ),

  // colors stored in THREE.Vector3 in H,S,L format
  colorBase   : new THREE.THREE.Vector3(0.0, 1.0, 0.5),
  colorSpread : new THREE.THREE.Vector3(0,0,0),
  colorTween  : new Tween( [0.5, 2], [ new THREE.THREE.Vector3(0, 1, 0.5), new THREE.THREE.Vector3(1, 1, 0.5) ] ),

  opacityBase   : 1,
  opacitySpread : 0,
  opacityTween  : new Tween( [2, 3], [1, 0] ),

  blendStyle    : THREE.NormalBlending (default), THREE.AdditiveBlending

  particlesPerSecond : 200,
  particleDeathAge   : 2.0,
  emitterDeathAge    : 60
*/

/*
var initExamples = {
  // Not just any fountain -- a RAINBOW STAR FOUNTAIN of AWESOMENESS
  fountain:
  {
    positionStyle: Type.CUBE,
    positionBase: new THREE.Vector3(0, 5, 0),
    positionSpread: new THREE.Vector3(10, 0, 10),

    velocityStyle: Type.CUBE,
    velocityBase: new THREE.Vector3(0, 160, 0),
    velocitySpread: new THREE.Vector3(100, 20, 100),

    accelerationBase: new THREE.Vector3(0, -100, 0),

    particleTexture: null,
    particleTexturePath: '../images/star.png',

    angleBase: 0,
    angleSpread: 180,
    angleVelocityBase: 0,
    angleVelocitySpread: 360 * 4,

    sizeTween: new Tween([0, 1], [1, 20]),
    opacityTween: new Tween([2, 3], [1, 0]),
    colorTween: new Tween([0.5, 2], [new THREE.Vector3(0, 1, 0.5), new THREE.Vector3(0.8, 1, 0.5)]),

    particlesPerSecond: 200,
    particleDeathAge: 3.0,
    emitterDeathAge: 60
  },

  fireball:
  {
    positionStyle: Type.SPHERE,
    positionBase: new THREE.Vector3(0, 50, 0),
    positionRadius: 2,

    velocityStyle: Type.SPHERE,
    speedBase: 40,
    speedSpread: 8,

    particleTexture: null,
    particleTexturePath: '../images/smokeparticle.png',

    sizeTween: new Tween([0, 0.1], [1, 150]),
    opacityTween: new Tween([0.7, 1], [1, 0]),
    colorBase: new Vector3(0.02, 1, 0.4),
    blendStyle: AdditiveBlending,

    particlesPerSecond: 60,
    particleDeathAge: 1.5,
    emitterDeathAge: 60
  },

  starfield:
  {
    positionStyle: Type.CUBE,
    positionBase: new Vector3(0, 200, 0),
    positionSpread: new Vector3(600, 400, 600),

    velocityStyle: Type.CUBE,
    velocityBase: new Vector3(0, 0, 0),
    velocitySpread: new Vector3(0.5, 0.5, 0.5),

    angleBase: 0,
    angleSpread: 720,
    angleVelocityBase: 0,
    angleVelocitySpread: 4,

    particleTexture: null,
    particleTexturePath: '../images/spikey.png',

    sizeBase: 10.0,
    sizeSpread: 2.0,
    colorBase: new Vector3(0.15, 1.0, 0.9), // H,S,L
    colorSpread: new Vector3(0.00, 0.0, 0.2),
    opacityBase: 1,

    particlesPerSecond: 20000,
    particleDeathAge: 60.0,
    emitterDeathAge: 0.1
  },

  fireflies:
  {
    positionStyle: Type.CUBE,
    positionBase: new Vector3(0, 100, 0),
    positionSpread: new Vector3(400, 200, 400),

    velocityStyle: Type.CUBE,
    velocityBase: new Vector3(0, 0, 0),
    velocitySpread: new Vector3(60, 20, 60),

    particleTexture: null,
    particleTexturePath: '../images/spark.png',

    sizeBase: 30.0,
    sizeSpread: 2.0,
    opacityTween: new Tween([0.0, 1.0, 1.1, 2.0, 2.1, 3.0, 3.1, 4.0, 4.1, 5.0, 5.1, 6.0, 6.1],
      [0.2, 0.2, 1.0, 1.0, 0.2, 0.2, 1.0, 1.0, 0.2, 0.2, 1.0, 1.0, 0.2]),
    colorBase: new Vector3(0.30, 1.0, 0.6), // H,S,L
    colorSpread: new Vector3(0.3, 0.0, 0.0),

    particlesPerSecond: 20,
    particleDeathAge: 6.1,
    emitterDeathAge: 600
  },

  startunnel:
  {
    positionStyle: Type.CUBE,
    positionBase: new Vector3(0, 0, 0),
    positionSpread: new Vector3(10, 10, 10),

    velocityStyle: Type.CUBE,
    velocityBase: new Vector3(0, 100, 200),
    velocitySpread: new Vector3(40, 40, 80),

    angleBase: 0,
    angleSpread: 720,
    angleVelocityBase: 10,
    angleVelocitySpread: 0,

    particleTexture: null,
    particleTexturePath: '../images/spikey.png',

    sizeBase: 4.0,
    sizeSpread: 2.0,
    colorBase: new Vector3(0.15, 1.0, 0.8), // H,S,L
    opacityBase: 1,
    blendStyle: AdditiveBlending,

    particlesPerSecond: 500,
    particleDeathAge: 4.0,
    emitterDeathAge: 60
  },

  firework:
  {
    positionStyle: Type.SPHERE,
    positionBase: new Vector3(0, 100, 0),
    positionRadius: 10,

    velocityStyle: Type.SPHERE,
    speedBase: 90,
    speedSpread: 10,

    accelerationBase: new Vector3(0, -80, 0),

    particleTexture: null,
    particleTexturePath: '../images/spark.png',

    sizeTween: new Tween([0.5, 0.7, 1.3], [5, 40, 1]),
    opacityTween: new Tween([0.2, 0.7, 2.5], [0.75, 1, 0]),
    colorTween: new Tween([0.4, 0.8, 1.0], [new Vector3(0, 1, 1), new Vector3(0, 1, 0.6), new Vector3(0.8, 1, 0.6)]),
    blendStyle: AdditiveBlending,

    particlesPerSecond: 3000,
    particleDeathAge: 2.5,
    emitterDeathAge: 0.2
  }
} */

var examples = {
  // parameters above remain the same, to be modified
  // effects below are modified for examples in earth. exmaples/qh-8-add-particles/debug.html
  smoke: {
    positionStyle: __WEBPACK_IMPORTED_MODULE_0__ParticleEngine_js__["c" /* Type */].CUBE,
    positionBase: new THREE.Vector3(0, 0, 0),
    positionSpread: new THREE.Vector3(2, 2, 0),

    velocityStyle: __WEBPACK_IMPORTED_MODULE_0__ParticleEngine_js__["c" /* Type */].CUBE,
    velocityBase: new THREE.Vector3(0, 0, 10),
    velocitySpread: new THREE.Vector3(5, 5, 5),
    accelerationBase: new THREE.Vector3(0, 0, -1),

    particleTexture: null,
    particleTexturePath: '../images/smokeparticle.png',

    angleBase: 0,
    angleSpread: 720,
    angleVelocityBase: 0,
    angleVelocitySpread: 720,

    sizeTween: new __WEBPACK_IMPORTED_MODULE_0__ParticleEngine_js__["b" /* Tween */]([0, 1], [32, 128]),
    opacityTween: new __WEBPACK_IMPORTED_MODULE_0__ParticleEngine_js__["b" /* Tween */]([0.8, 2], [0.5, 0]),
    colorTween: new __WEBPACK_IMPORTED_MODULE_0__ParticleEngine_js__["b" /* Tween */]([0.4, 1], [new THREE.Vector3(0, 0, 0.2), new THREE.Vector3(0, 0, 0.5)]),

    particlesPerSecond: 400,
    particleDeathAge: 2.0,
    emitterDeathAge: 60
  },

  clouds: {
    positionStyle: __WEBPACK_IMPORTED_MODULE_0__ParticleEngine_js__["c" /* Type */].CUBE,
    positionBase: new THREE.Vector3(0, 0, 0),
    positionSpread: new THREE.Vector3(20, 20, 10),

    velocityStyle: __WEBPACK_IMPORTED_MODULE_0__ParticleEngine_js__["c" /* Type */].CUBE,
    velocityBase: new THREE.Vector3(8, 0, 0),
    velocitySpread: new THREE.Vector3(4, 0, 0),

    particleTexture: null,
    particleTexturePath: '../../images/smokeparticle.png',

    sizeBase: 10.0,
    sizeSpread: 5.0,
    colorBase: new THREE.Vector3(0.0, 0.0, 1.0), // H,S,L
    opacityTween: new __WEBPACK_IMPORTED_MODULE_0__ParticleEngine_js__["b" /* Tween */]([0, 1, 4, 5], [0, 1, 1, 0]),

    particlesPerSecond: 20,
    particleDeathAge: 4.0,
    emitterDeathAge: 60
  },

  snow: {
    positionStyle: __WEBPACK_IMPORTED_MODULE_0__ParticleEngine_js__["c" /* Type */].CUBE,
    positionBase: new THREE.Vector3(0, 0, 0),
    positionSpread: new THREE.Vector3(5, 5, 0),

    velocityStyle: __WEBPACK_IMPORTED_MODULE_0__ParticleEngine_js__["c" /* Type */].CUBE,
    velocityBase: new THREE.Vector3(0, 0, -1),
    velocitySpread: new THREE.Vector3(1, 1, 0.5),
    accelerationBase: new THREE.Vector3(0, 0, -0.5),

    angleBase: 0,
    angleSpread: 720,
    angleVelocityBase: 0,
    angleVelocitySpread: 60,

    particleTexture: null,
    particleTexturePath: '../images/snowflake.png',

    sizeTween: new __WEBPACK_IMPORTED_MODULE_0__ParticleEngine_js__["b" /* Tween */]([0, 0.25], [40, 80]),
    colorBase: new THREE.Vector3(0.66, 1.0, 0.9), // H,S,L
    opacityTween: new __WEBPACK_IMPORTED_MODULE_0__ParticleEngine_js__["b" /* Tween */]([2, 3], [0.8, 0]),

    particlesPerSecond: 20,
    particleDeathAge: 4.0,
    emitterDeathAge: 60
  },

  rain: {
    positionStyle: __WEBPACK_IMPORTED_MODULE_0__ParticleEngine_js__["c" /* Type */].CUBE,
    positionBase: new THREE.Vector3(0, 0, 0),
    positionSpread: new THREE.Vector3(5, 5, 0),

    velocityStyle: __WEBPACK_IMPORTED_MODULE_0__ParticleEngine_js__["c" /* Type */].CUBE,
    velocityBase: new THREE.Vector3(0, 0, -3),
    velocitySpread: new THREE.Vector3(1, 1, 2),
    accelerationBase: new THREE.Vector3(0, 0, -2),

    particleTexture: null,
    particleTexturePath: '../images/raindrop2flip.png',

    sizeBase: 60.0,
    sizeSpread: 30.0,
    colorBase: new THREE.Vector3(0.67, 1.0, 0.4), // H,S,L
    colorSpread: new THREE.Vector3(0.00, 0.0, 0.2),
    opacityBase: 0.6,

    particlesPerSecond: 40,
    particleDeathAge: 1.5,
    emitterDeathAge: 60
  },

  candle: {
    positionStyle: __WEBPACK_IMPORTED_MODULE_0__ParticleEngine_js__["c" /* Type */].SPHERE,
    positionBase: new THREE.Vector3(0, 0, 0),
    positionRadius: 1,

    velocityStyle: __WEBPACK_IMPORTED_MODULE_0__ParticleEngine_js__["c" /* Type */].CUBE,
    velocityBase: new THREE.Vector3(0, 0, 7),
    velocitySpread: new THREE.Vector3(2, 2, 0),

    particleTexture: null,
    particleTexturePath: '../images/smokeparticle.png',

    sizeTween: new __WEBPACK_IMPORTED_MODULE_0__ParticleEngine_js__["b" /* Tween */]([0, 0.3, 1.2], [20, 150, 1]),
    opacityTween: new __WEBPACK_IMPORTED_MODULE_0__ParticleEngine_js__["b" /* Tween */]([0.9, 1.5], [1, 0]),
    colorTween: new __WEBPACK_IMPORTED_MODULE_0__ParticleEngine_js__["b" /* Tween */]([0.5, 1.0], [new THREE.Vector3(0.02, 1, 0.5), new THREE.Vector3(0.05, 1, 0)]),
    blendStyle: THREE.AdditiveBlending,

    particlesPerSecond: 600,
    particleDeathAge: 12,
    emitterDeathAge: 60
  }

};

function cloneExamples(examples) {
  let dst = {};
  for (let key in examples) {
    dst[key] = {};
    for (let u in examples[key]) {
      if (examples[key][u] instanceof THREE.Vector3) {
        dst[key][u] = examples[key][u].clone();
      } else if (examples[key][u] instanceof __WEBPACK_IMPORTED_MODULE_0__ParticleEngine_js__["b" /* Tween */]) {
        dst[key][u] = examples[key][u].clone();
      } else if (examples[key][u] instanceof Array) {
        dst[key][u] = examples[key][u].slice();
      } else if (examples[key][u] instanceof String) {
        dst[key][u] = examples[key][u];
      } else if (examples[key][u] instanceof Number) {
        dst[key][u] = examples[key][u];
      } else {
        dst[key][u] = examples[key][u];
      }
    }
  }
  return dst;
}

class Examples {
  constructor() {
    this.examples = cloneExamples(examples);
  }

  exist(effect) {
    if (this.examples[effect]) {
      return true;
    } else {
      return false;
    }
  }

  getEffect(effect) {
    return this.examples[effect];
  }

  destruct() {
    for (let key in this.examples) {
      if (this.examples[key].particleTexture) {
        this.examples[key].particleTexture.dispose();
        this.examples[key].particleTexture = null;
      }
    }
  }
}



/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = __webpack_require__(9);

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = __webpack_require__(10);

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7), __webpack_require__(8)))

/***/ }),
/* 7 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 8 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}

/***/ }),
/* 10 */
/***/ (function(module, exports) {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}


/***/ })
/******/ ]);
//# sourceMappingURL=index_bundle.js.map