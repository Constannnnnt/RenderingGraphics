// import * as THREE from 'three'
import phong from './shaders/phong.js'

import depthShader from './shaders/depth.js'
import { ParticleEngine } from './ParticleEngine/ParticleEngine.js'
import { Examples } from './ParticleEngine/ParticleEngineExamples.js'
import { debug, inspect } from 'util';
var container, stats
var camera, scene, renderer
var controls, ambientLight, directionalLight, spotLight, pointLight, planeuniform, spotLight2
var miku, stage, floor
var depthTarget, postCamera, postScene, renderDepthFlag = false, depthuniform

window.pickableObjectList = []
window.particleEngine = null
var spotlightHelper2, spotLightHelper, pointLightHelper

// shadowMap variable
var SHADOW_MAP_WIDTH = 1024
var SHADOW_MAP_HEIGHT = 1024

// screen variable
var SCREEN_WIDTH = window.innerWidth
var SCREEN_HEIGHT = window.innerHeight
var NEAR = 1
var FAR = 1000

init()
animate()

function init() {
  // scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x00cc00)

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
  renderer.shadowMap.needsUpdate = true
  renderer.shadowMap.type = THREE.PCFShadowMap // PCF shadowMap now
  container.appendChild(renderer.domElement)

  // control
  controls = new THREE.OrbitControls(camera, renderer.domElement)
  controls.addEventListener('change', render)
  controls.minDistance = 10
  controls.maxDistance = 800
  controls.enablePan = true
  controls.update()

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
  var sphereSize = 1;

  pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
  pointLightHelper.visible = false

  scene.add(pointLightHelper);

  // spotlight
  spotLight = new THREE.SpotLight(0xffff00, 1)
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
      floor = new THREE.Mesh(geometry, material)
      floor.position.copy(new THREE.Vector3(-27, -94, 5))
      floor.castShadow = false
      floor.receiveShadow = true
      scene.add(floor)
      pickableObjectList.push({object: floor})
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
      object.updateMatrixWorld()

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

        pickableObjectList.push({object: miku}, {object: stage})
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

  spotLightHelper = new THREE.SpotLightHelper(spotLight)
  spotLightHelper.visible = false
  scene.add(spotLightHelper)

  let huajiTexture = textureLoader.load("../images/huaji.png")
  let backboardTex = textureLoader.load("../images/backboard.jpg")

  window.shader = THREE.ShaderLib["phong"]
  window.uniforms = THREE.UniformsUtils.clone(shader.uniforms)
  uniforms["map"].value = huajiTexture
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

  let huajiArray = new THREE.Group()
  let box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), m)
  huajiArray.add(box)
  box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), m)
  box.position.set(0, -10, 0)
  huajiArray.add(box)
  box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), m)
  box.position.set(0, -20, 0)
  huajiArray.add(box)
  box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), m)
  box.position.set(0, -30, 0)
  huajiArray.add(box)
  box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), m)
  box.position.set(0, -40, 0)
  huajiArray.add(box)
  box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), m)
  box.position.set(0, -50, 0)
  huajiArray.add(box)
  scene.add(huajiArray)
  pickableObjectList.push({object: huajiArray})

  particleSystem('clouds')

  // projective texture mapping
  spotLight2 = new THREE.SpotLight(0xffff00, 0.3)
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

  planeuniform = THREE.UniformsUtils.clone(shader.uniforms)
  planeuniform["diffuse"] = {
    type: 'c',
    value: new THREE.Color(0xffffff)
  }
  planeuniform["showMapTexture"] = {
    type: 'b',
    value: true
  }
  planeuniform["blendingParam"] = {
    type: 'f',
    value: 0.5
  }
  planeuniform["map"] = {
    value: backboardTex
  }
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

  spotlightHelper2 = new THREE.SpotLightHelper(spotLight2)
  spotlightHelper2.visible = false
  scene.add(spotlightHelper2)
  plane.material.uniforms.textureMatrixProj.value = makeProjectiveMatrixForLight(spotLight2)

  initDepth()

  window.addEventListener('resize', onWindowResize, false)
  window.addEventListener('mouseup', pick, false)

  //mirror reflector
  verticalMirror = new THREE.Reflector(400, 350, {
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
  verticalMirror.visible = false
  // verticalMirror.lookAtPosition.add(-camera.matrixWorld.position)
  scene.add(verticalMirror)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

var lastTime = null

function animate(time) {
  if (!lastTime) {
    lastTime = time
  }
  uniforms.time.value = time / 300
  requestAnimationFrame(animate)
  if (particleEngine) {
    let delta = time - lastTime
    particleEngine.update(delta / 1000)
  }
  lastTime = time
  render()
  if (renderDepthFlag) { renderer.render(postScene, postCamera) }
}

function render() {
  if (renderDepthFlag) {
    renderer.render(scene, camera, depthTarget)
  } else {
    renderer.render(scene, camera)
  }
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
    'Shading': 'Smooth Shading'
  }
  folder.add(shadingConf, 'Shading', ['Smooth Shading', 'Flat Shading'])
    .onChange((value) => {
      miku.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          if (value == 'Flat Shading') {
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

  folder = gui.addFolder("Directional Light")
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

  folder = gui.addFolder("Point Light")
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

  folder = gui.addFolder("Spot Light")
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

  /*
  Type: Value
  BasicShadowMap: 0
  PCFShadowMap: 1
  PCFSoftShadowMap: 2
  */
  folder = gui.addFolder("ShadowMap")
  let ShadowMapConf = {
    ShadowMapType: renderer.shadowMap.type,
  }
  folder.add(ShadowMapConf, 'ShadowMapType').min(0).max(2).step(1).onChange((value) => {
    renderer.shadowMap.type = value
    renderer.clearTarget(spotLight.shadow.map)
    miku.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        if (node.material instanceof THREE.MeshPhongMaterial) {
          node.material.needsUpdate = true
        } else {
          for (let k in node.material) {
            node.material[k].needsUpdate = true
          }
        }
      } else {
        if (node.material instanceof THREE.MeshPhongMaterial) {
          node.material.needsUpdate = true
        } else {
          for (let k in node.material) {
            node.material[k].needsUpdate = true
          }
        }
      }
    })
    stage.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        if (node.material instanceof THREE.MeshPhongMaterial) {
          node.material.needsUpdate = true
        } else {
          for (let k in node.material) {
            node.material[k].needsUpdate = true
          }
        }
      } else {
        if (node.material instanceof THREE.MeshPhongMaterial) {
          node.material.needsUpdate = true
        } else {
          for (let k in node.material) {
            node.material[k].needsUpdate = true
          }
        }
      }
    })
  })

  folder = gui.addFolder("Projective Texture")
  let ProjectiveTextureConf = {
    blendingParam: planeuniform["blendingParam"].value,
    showMapTexture: planeuniform["showMapTexture"].value
  }
  folder.add(ProjectiveTextureConf, 'blendingParam').min(0.0).max(1.0).step(0.1).onChange((value) => {
    planeuniform["blendingParam"].value = value
  })
  folder.add(ProjectiveTextureConf, 'showMapTexture').onChange((value) => {
    planeuniform["showMapTexture"].value = value
  })

  folder = gui.addFolder("Mirror")
  let MirrorConf = {
    mirror: verticalMirror.visible
  }
  folder.add(MirrorConf, 'mirror').onChange((value) => {
    verticalMirror.visible = value
    pointLight.visible = (!value)
    spotLight.visible = (!value)
    directionalLight.visible = (!value)
  })

  folder = gui.addFolder("Helper")
  let HelperConf = {
    spotLightHelper1: spotLightHelper.visible,
    spotLightHelper2: spotlightHelper2.visible,
    pointLightHelper: pointLightHelper.visible
  }
  folder.add(HelperConf, 'spotLightHelper1').onChange((value) => {
    spotLightHelper.visible = value
  })
  folder.add(HelperConf, 'spotLightHelper2').onChange((value) => {
    spotlightHelper2.visible = value
  })
  folder.add(HelperConf, 'pointLightHelper').onChange((value) => {
    pointLightHelper.visible = value
  })
  // folder.open()

  folder = gui.addFolder("Projective texturing")
  let projectiveConf = {
    showMapTexture: planeuniform.showMapTexture.value,
    blendingParam: planeuniform.blendingParam.value
  }
  folder.add(projectiveConf, 'showMapTexture').onChange((v) => {
    planeuniform.showMapTexture.value = v
  })
  folder.add(projectiveConf, 'blendingParam').min(0.0).max(1.0).step(0.1)
    .onChange((v) => {
      planeuniform.blendingParam.value = v
    })

  folder = gui.addFolder("Depth Buffer")
  let depthConf = {
    'render depth': renderDepthFlag,
    'camera near': depthuniform.cameraNear.value,
    'camera far': depthuniform.cameraFar.value
  }
  folder.add(depthConf, 'render depth').onChange((v) => {
    renderDepthFlag = v
    if (v === false) {
      camera.near = NEAR
      camera.far = FAR
      camera.updateProjectionMatrix()
    }
  })
  folder.add(depthConf, 'camera near').min(1).max(100).step(1.0)
    .onChange((v) => {
      camera.near = v
      camera.updateProjectionMatrix()
    })
  folder.add(depthConf, 'camera far').min(500).max(FAR).step(1.0)
    .onChange((v) => {
      camera.far = v
      camera.updateProjectionMatrix()
    })
}

function particleSystem(effectName) {
  let example = new Examples()
  let paras = example.getEffect(effectName)

  if (!paras) {
    console.error('[particle system] no parameters')
  }

  let path = paras.particleTexturePath
  let loader = new THREE.TextureLoader()
  loader.load('../images/smokeparticle.png',
    (_texture) => {
      paras.particleTexture = _texture
      let group = new THREE.Group()
      particleEngine = new ParticleEngine()
      particleEngine.setValues(paras)
      particleEngine.initialize()

      group.add(particleEngine.particleMesh)
      scene.add(group)
    },
    (xhr) => {
      console.log(xhr.loaded / xhr.total + '% loaded ' + path)
    },
    (xhr) => {
      console.warn('[ParticleEffectsMarker] an error happened while loading ' + path)
    })
}

function initDepth() {
  if (depthTarget) { depthTarget.dispose() }
  depthTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight)
  depthTarget.texture.format = THREE.RGBFormat
  depthTarget.texture.minFilter = THREE.NearestFilter
  depthTarget.texture.magFilter = THREE.NearestFilter
  depthTarget.texture.generateMipmaps = false
  depthTarget.stencilBuffer = false
  depthTarget.depthBuffer = true
  depthTarget.depthTexture = new THREE.DepthTexture()
  depthTarget.depthTexture.type = THREE.UnsignedShortType

  postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  depthuniform = {
    cameraNear: { value: camera.near },
    cameraFar: { value: camera.far },
    tDiffuse: { value: depthTarget.texture },
    tDepth: { value: depthTarget.depthTexture }
  }
  var postMaterial = new THREE.ShaderMaterial({
    vertexShader: depthShader.vert,
    fragmentShader: depthShader.frag,
    uniforms: depthuniform
  })
  var postPlane = new THREE.PlaneBufferGeometry(2, 2)
  var postQuad = new THREE.Mesh(postPlane, postMaterial)
  postScene = new THREE.Scene()
  postScene.add(postQuad)
}

var GPUPickerMaterial = new THREE.ShaderMaterial({
  uniforms: {
    color: {
      value: new THREE.Color()
    }
  },
  vertexShader:
  `
  void main(){
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  fragmentShader:
  `
  uniform vec3 color;
  void main(){
    gl_FragColor = vec4(color, 1.0);
  }
  `
})
var visibilityMapping = {}
function pick (event) {
  let x = event.clientX
  let y = event.clientY
  let mouse = {x, y}

  scene.traverse((obj) => {
    visibilityMapping[obj.uuid] = obj.visible
    obj.visible = false
  })
  scene.visible = true

  pickableObjectList.map((obj, index) => {
    obj.object.visible = true
    obj.ID = index
    obj.materials = []
    obj.object.traverse((c) => {
      c.visible = true
      if (c instanceof THREE.Mesh) {
        c.visible = true
        obj.materials.push(c.material)
        c.material = GPUPickerMaterial.clone()
        c.material.uniforms.color.value = new THREE.Color().setHex(obj.ID)
      }
    })
  })
  // renderer.render(scene, camera)

  let pickingTexture = new THREE.WebGLRenderTarget()
  let size = renderer.getSize()
  let pixelBuffer = new Uint8Array(4 * size.width * size.height)
  pickingTexture.setSize(size.width, size.height)
  pickingTexture.texture.minFilter = THREE.LinearFilter
  pickingTexture.texture.generateMipmaps = false
  renderer.render(scene, camera, pickingTexture)
  renderer.readRenderTargetPixels(pickingTexture, 0, 0, size.width, size.height, pixelBuffer)

  // var canvaswindow = window.open("", "_blank")
  // canvaswindow.document.write(
  //   `
  //     <title>test</title>
  //     <p>test</p>
  //     <p>rgb</p>
  //     <div><canvas id="targetrgb" width=${size.width} height=${size.height} /></div>
  //     `
  // )
  // var c = canvaswindow.document.getElementById('targetrgb')
  // var ctx = c.getContext("2d")
  // ctx.clearRect(0, 0, size.width, size.height)
  // var rgbimdata = ctx.createImageData(size.width, size.height)
  // for (let i = 0; i < rgbimdata.data.length; i += 1) {
  //   rgbimdata.data[i] = pixelBuffer[i]
  // }
  // ctx.putImageData(rgbimdata, 0, 0)

  // restore visibility
  pickableObjectList.map((obj) => {
    obj.object.traverse((c) => {
      if (c instanceof THREE.Mesh) {
        c.material = obj.materials.shift()
      }
    })
  })

  scene.traverse((obj) => {
    obj.visible = visibilityMapping[obj.uuid]
  })

  let index = (mouse.x + (pickingTexture.height - mouse.y) * pickingTexture.width) * 4
  let id = (pixelBuffer[index] * 255 * 255) | (pixelBuffer[index + 1] * 255) | (pixelBuffer[index + 2])
  if (id < pickableObjectList.length) {
    let result
    pickableObjectList.map((obj) => {
      if (obj.ID === id) { result = obj }
    })
    console.log('picked target', result)
  } else {
    console.log('no object picked')
  }
  pickingTexture.dispose()
}