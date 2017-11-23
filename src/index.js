// import * as THREE from 'three'
import phong from './shaders/phong.js'
import {
  debug,
  inspect
} from 'util';

var container, stats
var camera, scene, renderer
var controls, ambientLight, directionalLight, spotLight, pointLight
var miku, stage

// shadowMap variable
var SHADOW_MAP_WIDTH = 1024
var SHADOW_MAP_HEIGHT = 1024

// screen variable
var SCREEN_WIDTH = window.innerWidth
var SCREEN_HEIGHT = window.innerHeight
var NEAR = 1
var FAR = 10000

init()
animate()

function init() {
  // scene
  scene = new THREE.Scene()

  // canvas
  container = document.createElement('div')
  document.body.appendChild(container)
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, NEAR, FAR)
  camera.position.z = 250
  scene.add(camera)

  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap // PCF shadowMap now
  container.appendChild(renderer.domElement)

  // control
  controls = new THREE.OrbitControls(camera, renderer.domElement)
  controls.addEventListener('change', render)
  controls.minDistance = 10
  controls.maxDistance = 800
  controls.enablePan = true

  // lights
  ambientLight = new THREE.AmbientLight(0xcccccc, 0.4)
  scene.add(ambientLight)

  // directional light
  directionalLight = new THREE.DirectionalLight(0x0000cc, 0.4)
  directionalLight.position.copy(new THREE.Vector3(0, 300, 300))
  var target = new THREE.Object3D()
  target.position.copy(new THREE.Vector3(0, 0, -5))

  scene.add(directionalLight)
  scene.add(target)
  directionalLight.target = target

  // point light
  pointLight = new THREE.PointLight(0xff0000, 0.4, 500)
  pointLight.position.set(-25, 0, -10)
  pointLight.castShadow = true
  scene.add(pointLight)
  // var sphereSize = 1;
  // var pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
  // scene.add( pointLightHelper );

  // spotlight
  spotLight = new THREE.SpotLight(0xffff00, 1)
  window.t = spotLight
  spotLight.position.set(5, 95, 100)
  spotLight.angle = Math.PI / 8
  spotLight.penumbra = 0.08
  spotLight.decay = 2
  spotLight.distance = 400
  // spotLight.shadow.bias = 0.0001
  spotLight.castShadow = true
  spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH
  spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT
  spotLight.shadow.camera.near = 10
  spotLight.shadow.camera.far = 180
  scene.add(spotLight)

  // floor texture
  let textureLoader = new THREE.TextureLoader()
  textureLoader.load(
    '../images/floor.jpg',
    function (texture) {
      var material = new THREE.MeshBasicMaterial({
        map: texture,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.3
      })
      var geometry = new THREE.BoxGeometry(387, 0.0001, 266)
      //  var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} )
      let cube = new THREE.Mesh(geometry, material)
      cube.position.copy(new THREE.Vector3(-27, -94, 5))
      cube.castShadow = false
      cube.receiveShadow = true
      scene.add(cube)
    },
    function (xhr) {
      // console.log((xhr.loaded / xhr.total * 100) + '% loaded')
    },
    function (xhr) {
      console.error('An error happened')
    }
  )

  // Miku model
  THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader())
  let mtlLoader = new THREE.MTLLoader()
  mtlLoader.setPath('../models/Miku/')
  mtlLoader.load('Miku.mtl', function (materials) {
    materials.preload()
    let objLoader = new THREE.OBJLoader()
    objLoader.setMaterials(materials)
    objLoader.setPath('../models/Miku/')
    objLoader.load('Miku.obj', function (object) {
      object.position.y = -95
      object.position.x = -25
      object.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
          node.castShadow = true
          node.receiveShadow = false
        }
      })
      miku = object
      scene.add(object)

      // verticalMirror.target = object
      spotLight.target = object
      scene.add(spotLight.target)

      controls.target.copy(object.position)
      controls.update()

      // stage model
      let objLoader = new THREE.OBJLoader()
      objLoader.setPath('../models/stage/')
      objLoader.load('stage.obj', function (object) {
        object.position.y -= 123.8
        object.scale.x = 20
        object.scale.y = 20
        object.scale.z = 20
        object.traverse(function (node) {
          if (node instanceof THREE.Mesh) {
            node.receiveShadow = true;
            node.castShadow = true;
          }
        })
        stage = object
        scene.add(object)

        initGUI()
      }, (xhr) => {
        // console.log(xhr)
      }, (xhr) => {
        console.log(xhr)
      })
    }, (xhr) => {
      // console.log(xhr)
    }, (xhr) => {
      console.log(xhr)
    })
  })

  // projective texturing
  // window.projLight = new THREE.SpotLight(0xffff00, 3.0, 0.0, false)
  // projLight.position.set(300, 800, 500)
  // projLight.target.position.set(0, 0, 0)
  // projLight.angle = Math.PI / 20
  // projLight.exponent = 50
  // scene.add(projLight)

  // var spotLightHelper = new THREE.SpotLightHelper(projLight)
  // scene.add(spotLightHelper)

  let backboardTexture = textureLoader.load("../images/huaji.png")
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

  window.shader = THREE.ShaderLib["phong"]
  window.uniforms = THREE.UniformsUtils.clone(shader.uniforms)
  uniforms["map"].value = backboardTexture
  uniforms["showMapTexture"] = {
    'type': 'b',
    'value': true
  }
  uniforms["time"] = {
    'type': 'f',
    'value': 0.5
  }
  window.m = new THREE.ShaderMaterial({
    fragmentShader: phong.frag,
    vertexShader: phong.vert,
    uniforms: uniforms,
    lights: true
  })
  let box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), m)
  scene.add(box)
  box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), m)
  box.position.set(0, -10, 0)
  scene.add(box)
  box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), m)
  box.position.set(0, -20, 0)
  scene.add(box)
  box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), m)
  box.position.set(0, -30, 0)
  scene.add(box)
  box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), m)
  box.position.set(0, -40, 0)
  scene.add(box)
  box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), m)
  box.position.set(0, -50, 0)
  scene.add(box)

  let spotLight2 = new THREE.SpotLight(0xffff00, 0.3)
  spotLight2.position.set(-70, 95, 100)
  spotLight2.angle = Math.PI / 8
  spotLight2.penumbra = 0.08
  spotLight2.decay = 2
  spotLight2.distance = 400
  spotLight2.castShadow = true
  spotLight2.shadow.mapSize.width = SHADOW_MAP_WIDTH
  spotLight2.shadow.mapSize.height = SHADOW_MAP_HEIGHT
  spotLight2.shadow.camera.near = 10
  spotLight2.shadow.camera.far = 180

  let planeuniform = THREE.UniformsUtils.clone(shader.uniforms)
  planeuniform["diffuse"] = {
    type: 'c',
    value: new THREE.Color(0xffffff)
  }
  planeuniform["showMapTexture"] = {
    value: false
  }
  planeuniform["map"] = {
    value: null
  }
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
  }
  planeuniform['spotLightColor'] = {
    value: new THREE.Color(0xffffff)
  }
  let planegeo = new THREE.PlaneBufferGeometry(200, 200)
  let planemtl = new THREE.ShaderMaterial({
    fragmentShader: phong.frag,
    vertexShader: phong.vert,
    uniforms: planeuniform,
    lights: true
  })
  let plane = new THREE.Mesh(planegeo, planemtl)
  plane.position.set(-30, 0, -130)
  scene.add(plane)

  let targetObject = new THREE.Object3D()
  targetObject.position.set(-50, 0, -130)
  spotLight2.target = targetObject
  targetObject.updateMatrixWorld()
  scene.add(spotLight2)
  scene.add(targetObject)

  // let spotlightHelper = new THREE.SpotLightHelper(spotLight2)
  // scene.add(spotlightHelper)
  plane.material.uniforms.textureMatrixProj.value = makeProjectiveMatrixForLight(spotLight2)

  window.addEventListener('resize', onWindowResize, false)

  //mirror reflector
  var verticalMirror = new THREE.Reflector(400, 350, {
    clipBias: 0.002,
    textureWidth: SCREEN_WIDTH * window.devicePixelRatio,
    textureHeight: SCREEN_HEIGHT * window.devicePixelRatio,
    color: 0x889999,
    recursion: 1
  })
  verticalMirror.position.y = 50
  verticalMirror.position.x = -260
  verticalMirror.position.z = -70
  verticalMirror.rotateY(Math.PI / 2)
  // verticalMirror.lookAtPosition.add(-camera.matrixWorld.position)
  scene.add(verticalMirror)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate(time) {
  uniforms.time.value = time / 300
  requestAnimationFrame(animate)
  render()
}

function render() {
  renderer.render(scene, camera)
}

function makeProjectiveMatrixForLight(l) {
  var lightCamera = new THREE.PerspectiveCamera(l.angle * 180 / Math.PI, 1.0, 1, 1000)
  var lightMatrix = new THREE.Matrix4()
  var targetPosition = new THREE.Vector3()

  lightCamera.position.setFromMatrixPosition(l.matrixWorld)
  targetPosition.setFromMatrixPosition(l.target.matrixWorld)
  lightCamera.lookAt(targetPosition)
  lightCamera.updateMatrixWorld()

  lightCamera.matrixWorldInverse.getInverse(lightCamera.matrixWorld)

  lightMatrix.set(
    0.5, 0.0, 0.0, 0.5,
    0.0, 0.5, 0.0, 0.5,
    0.0, 0.0, 0.5, 0.5,
    0.0, 0.0, 0.0, 1.0
  )

  lightMatrix.multiply(lightCamera.projectionMatrix)
  lightMatrix.multiply(lightCamera.matrixWorldInverse)

  return lightMatrix
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
  })

  let folder = gui.addFolder("Miku")
  let shadingConf = {
    'shading': 'smooth shading'
  }
  folder.add(shadingConf, 'shading', ['smooth shading', 'flat shading'])
    .onChange((value) => {
      miku.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          if (value == 'flat shading') {
            if (node.material instanceof THREE.MeshPhongMaterial) {
              node.material.flatShading = true
              node.material.needsUpdate = true
            } else {
              for (let k in node.material) {
                node.material[k].flatShading = true
                node.material[k].needsUpdate = true
              }
            }
          } else {
            if (node.material instanceof THREE.MeshPhongMaterial) {
              node.material.flatShading = false
              node.material.needsUpdate = true
            } else {
              for (let k in node.material) {
                node.material[k].flatShading = false
                node.material[k].needsUpdate = true
              }
            }
          }
        }
      })
    })

  folder = gui.addFolder("Directional light")
  let directionalLightConf = {
    visible: directionalLight.visible,
    color: directionalLight.color.getStyle()
  }
  folder.add(directionalLightConf, 'visible').onChange(() => {
    directionalLight.visible = directionalLightConf['visible']
  })
  folder.addColor(directionalLightConf, 'color').onChange((value) => {
    directionalLight.color.setStyle(value)
  })
  // folder.open()

  folder = gui.addFolder("Point light")
  let pointLightConf = {
    visible: pointLight.visible,
    color: pointLight.color.getStyle(),
    castShadow: pointLight.castShadow
  }
  folder.add(pointLightConf, 'visible').onChange(() => {
    pointLight.visible = pointLightConf['visible']
  })
  folder.addColor(pointLightConf, 'color').onChange((value) => {
    pointLight.color.setStyle(value)
  })
  folder.add(pointLightConf, 'castShadow').onChange(() => {
    pointLight.castShadow = pointLightConf['castShadow']
  })
  // folder.open()

  folder = gui.addFolder("Spot light")
  let spotLightConf = {
    visible: spotLight.visible,
    color: spotLight.color.getStyle(),
    castShadow: spotLight.castShadow
  }
  folder.add(spotLightConf, 'visible').onChange(() => {
    spotLight.visible = spotLightConf['visible']
  })
  folder.addColor(spotLightConf, 'color').onChange((value) => {
    spotLight.color.setStyle(value)
  })
  folder.add(spotLightConf, 'castShadow').onChange(() => {
    spotLight.castShadow = spotLightConf['castShadow']
  })
  // folder.open()
}