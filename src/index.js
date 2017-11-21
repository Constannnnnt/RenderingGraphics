/* global THREE */
var container, stats
var camera, scene, renderer

init()
animate()

function init() {
  // scene
  scene = new THREE.Scene()

  // canvas
  container = document.createElement('div')
  document.body.appendChild(container)
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000)
  camera.position.z = 250
  scene.add(camera)

  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)

  // control
  var controls = new THREE.OrbitControls(camera, renderer.domElement)
  controls.addEventListener('change', render)
  controls.minDistance = 10
  controls.maxDistance = 800
  controls.enablePan = true

  // lights
  var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4)
  scene.add(ambientLight)

  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.4)
  var target = new THREE.Object3D()
  target.position.copy(new THREE.Vector3(0, 0, -5))

  scene.add(directionalLight)
  scene.add(target)
  directionalLight.target = target

  // spotlight
  var spotLight = new THREE.SpotLight(0xffff00, 1)
  spotLight.position.set(5, 95, 100)
  spotLight.angle = Math.PI / 8
  spotLight.penumbra = 0.08
  spotLight.decay = 2
  spotLight.distance = 400
  spotLight.castShadow = true
  spotLight.shadow.mapSize.width = 1024
  spotLight.shadow.mapSize.height = 1024
  spotLight.shadow.camera.near = 10
  spotLight.shadow.camera.far = 200
  scene.add(spotLight)

  // floor texture
  var loader = new THREE.TextureLoader()
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
      })
      var geometry = new THREE.BoxGeometry(387, 0.001, 266)
      //  var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} )
      window.cube = new THREE.Mesh(geometry, material)
      cube.position.copy(new THREE.Vector3(-27, -94, 5))
      scene.add(cube)
    },
    // Function called when download progresses
    function (xhr) {
      // console.log((xhr.loaded / xhr.total * 100) + '% loaded')
    },
    // Function called when download errors
    function (xhr) {
      console.error('An error happened')
    }
  )

  // model
  THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader())
  var mtlLoader = new THREE.MTLLoader()
  mtlLoader.setPath('../models/Miku/')
  mtlLoader.load('Miku.mtl', function (materials) {
    materials.preload()
    var objLoader = new THREE.OBJLoader()
    objLoader.setMaterials(materials)
    objLoader.setPath('../models/Miku/')
    objLoader.load('Miku.obj', function (object) {
      object.position.y = - 95
      object.position.x = - 25
      scene.add(object)

      spotLight.target = object

      controls.target.copy(object.position)
      controls.update()
    }, (xhr) => {
      // console.log(xhr)
    }, (xhr) => {
      console.log(xhr)
    })
  })

  var objLoader = new THREE.OBJLoader()
  objLoader.setPath('../models/stage/')
  objLoader.load('stage.obj', function (object) {
    object.position.y -= 123.8
    object.scale.x = 20
    object.scale.y = 20
    object.scale.z = 20
    scene.add(object)
    // console.log('stage loading')
  }, (xhr) => {
    // console.log(xhr)
  }, (xhr) => {
    console.log(xhr)
  })

  window.addEventListener('resize', onWindowResize, false)
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
  requestAnimationFrame(animate)
  render()
}

function render() {
  renderer.render(scene, camera)
}