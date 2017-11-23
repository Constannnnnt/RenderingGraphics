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
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shaders_phong_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_util__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_util___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_util__);
// import * as THREE from 'three'



var container, stats;
var camera, scene, renderer;
var controls, ambientLight, directionalLight, spotLight, pointLight;
var miku, stage;

// shadowMap variable
var SHADOW_MAP_WIDTH = 1024;
var SHADOW_MAP_HEIGHT = 1024;

// screen variable
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var NEAR = 1;
var FAR = 10000;

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
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.addEventListener('change', render);
  controls.minDistance = 10;
  controls.maxDistance = 800;
  controls.enablePan = true;

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
  // var sphereSize = 1;
  // var pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
  // scene.add( pointLightHelper );

  // spotlight
  spotLight = new THREE.SpotLight(0xffff00, 1);
  window.t = spotLight;
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
    let cube = new THREE.Mesh(geometry, material);
    cube.position.copy(new THREE.Vector3(-27, -94, 5));
    cube.castShadow = false;
    cube.receiveShadow = true;
    scene.add(cube);
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
      scene.add(object);

      // verticalMirror.target = object
      spotLight.target = object;
      scene.add(spotLight.target);

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

  // projective texturing
  // window.projLight = new THREE.SpotLight(0xffff00, 3.0, 0.0, false)
  // projLight.position.set(300, 800, 500)
  // projLight.target.position.set(0, 0, 0)
  // projLight.angle = Math.PI / 20
  // projLight.exponent = 50
  // scene.add(projLight)

  // var spotLightHelper = new THREE.SpotLightHelper(projLight)
  // scene.add(spotLightHelper)

  let backboardTexture = textureLoader.load("../images/huaji.png");
  // textureLoader.load(
  //   "../images/huaji.png",
  //   function (textureProj) {
  //     let shader = THREE.ShaderLib["phong"]

  //     window.uniforms = THREE.UniformsUtils.clone(shader.uniforms)
  //     uniforms["lightIntensity"] = {"value": 0.3}
  //     uniforms["textureSampler"] = {"type": "t", "value": backboardTexture}

  //     let parameters = {
  //       fragmentShader: projTexShader2.fragment,
  //       vertexShader: projTexShader2.vertex,
  //       uniforms: uniforms,
  //       lights: true
  //     }

  //     let mesh = new THREE.Mesh(new THREE.CubeGeometry(1000, 600, 0.001, 1, 1, 1), new THREE.ShaderMaterial(parameters))

  //     scene.add(mesh)
  //   },
  //   function (xhr) {
  //     // console.log((xhr.loaded / xhr.total * 100) + '% loaded')
  //   },
  //   function (xhr) {
  //     console.error('An error happened')
  //   }
  // )

  window.shader = THREE.ShaderLib["phong"];
  window.uniforms = THREE.UniformsUtils.clone(shader.uniforms);
  uniforms["map"].value = backboardTexture;
  uniforms["showMapTexture"] = {
    'type': 'b',
    'value': true
  };
  uniforms["time"] = {
    'type': 'f',
    'value': 0.5
  };
  window.m = new THREE.ShaderMaterial({
    fragmentShader: __WEBPACK_IMPORTED_MODULE_0__shaders_phong_js__["a" /* default */].frag,
    vertexShader: __WEBPACK_IMPORTED_MODULE_0__shaders_phong_js__["a" /* default */].vert,
    uniforms: uniforms,
    lights: true
  });
  let box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), m);
  scene.add(box);
  box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), m);
  box.position.set(0, -10, 0);
  scene.add(box);
  box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), m);
  box.position.set(0, -20, 0);
  scene.add(box);
  box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), m);
  box.position.set(0, -30, 0);
  scene.add(box);
  box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), m);
  box.position.set(0, -40, 0);
  scene.add(box);
  box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), m);
  box.position.set(0, -50, 0);
  scene.add(box);

  let spotLight2 = new THREE.SpotLight(0xffff00, 0.3);
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

  let planeuniform = THREE.UniformsUtils.clone(shader.uniforms);
  planeuniform["diffuse"] = {
    type: 'c',
    value: new THREE.Color(0xffffff)
  };
  planeuniform["showMapTexture"] = {
    value: false
  };
  planeuniform["map"] = {
    value: null
  };
  planeuniform["mapProj"] = {
    "type": "t",
    "value": backboardTexture
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
  let planegeo = new THREE.PlaneBufferGeometry(200, 200);
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
  targetObject.position.set(-50, 0, -130);
  spotLight2.target = targetObject;
  targetObject.updateMatrixWorld();
  scene.add(spotLight2);
  scene.add(targetObject);

  // let spotlightHelper = new THREE.SpotLightHelper(spotLight2)
  // scene.add(spotlightHelper)
  plane.material.uniforms.textureMatrixProj.value = makeProjectiveMatrixForLight(spotLight2);

  window.addEventListener('resize', onWindowResize, false);

  //mirror reflector
  var verticalMirror = new THREE.Reflector(400, 350, {
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
  // verticalMirror.lookAtPosition.add(-camera.matrixWorld.position)
  scene.add(verticalMirror);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(time) {
  uniforms.time.value = time / 300;
  requestAnimationFrame(animate);
  render();
}

function render() {
  renderer.render(scene, camera);
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
  // var API = {
  //   'show directional light': true,
  //   'show spot light': true,
  //   'show ambient light': true
  // }
  // var gui = new dat.GUI()
  // gui.add(API, 'show directional light').onChange(function () {
  //   directionalLight.visible = API['show directional light']
  // })
  let gui = new dat.GUI({
    width: '300px'
  });

  let folder = gui.addFolder("Miku");
  let shadingConf = {
    'shading': 'smooth shading'
  };
  folder.add(shadingConf, 'shading', ['smooth shading', 'flat shading']).onChange(value => {
    miku.traverse(node => {
      if (node instanceof THREE.Mesh) {
        if (value == 'flat shading') {
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

  folder = gui.addFolder("Directional light");
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

  folder = gui.addFolder("Point light");
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

  folder = gui.addFolder("Spot light");
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
  // folder.open()
}

/***/ }),
/* 1 */
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
uniform sampler2D mapProj;
varying vec4 texCoordProj;
varying vec3 vNormalProj;
varying vec3 vViewPositionProj;
uniform vec3 spotLightPosition;
uniform vec3 spotLightColor;
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
			transformedvUv.x = mod(transformedvUv.x + time, 1.0);
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
/* 2 */
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

exports.isBuffer = __webpack_require__(5);

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
exports.inherits = __webpack_require__(6);

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

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3), __webpack_require__(4)))

/***/ }),
/* 3 */
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
/* 4 */
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
/* 5 */
/***/ (function(module, exports) {

module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}

/***/ }),
/* 6 */
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