import { Tween, Type } from './ParticleEngine.js'
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

var examples =
  {
    // parameters above remain the same, to be modified
    // effects below are modified for examples in earth. exmaples/qh-8-add-particles/debug.html
    smoke:
    {
      positionStyle: Type.CUBE,
      positionBase: new THREE.Vector3(0, 0, 0),
      positionSpread: new THREE.Vector3(2, 2, 0),

      velocityStyle: Type.CUBE,
      velocityBase: new THREE.Vector3(0, 0, 10),
      velocitySpread: new THREE.Vector3(5, 5, 5),
      accelerationBase: new THREE.Vector3(0, 0, -1),

      particleTexture: null,
      particleTexturePath: '../images/smokeparticle.png',

      angleBase: 0,
      angleSpread: 720,
      angleVelocityBase: 0,
      angleVelocitySpread: 720,

      sizeTween: new Tween([0, 1], [32, 128]),
      opacityTween: new Tween([0.8, 2], [0.5, 0]),
      colorTween: new Tween([0.4, 1], [new THREE.Vector3(0, 0, 0.2), new THREE.Vector3(0, 0, 0.5)]),

      particlesPerSecond: 400,
      particleDeathAge: 2.0,
      emitterDeathAge: 60
    },

    clouds:
    {
      positionStyle: Type.CUBE,
      positionBase: new THREE.Vector3(0, 0, 0),
      positionSpread: new THREE.Vector3(200, 200, 10),

      velocityStyle: Type.CUBE,
      velocityBase: new THREE.Vector3(0.4, 0, 0),
      velocitySpread: new THREE.Vector3(0.2, 0, 0),

      particleTexture: null,
      particleTexturePath: '../../images/smokeparticle.png',

      sizeBase: 40.0,
      sizeSpread: 40.0,
      colorBase: new THREE.Vector3(0.0, 0.0, 1.0), // H,S,L
      opacityTween: new Tween([0, 1, 4, 5], [0, 1, 1, 0]),

      particlesPerSecond: 20,
      particleDeathAge: 4.0,
      emitterDeathAge: 60
    },

    snow:
    {
      positionStyle: Type.CUBE,
      positionBase: new THREE.Vector3(0, 0, 0),
      positionSpread: new THREE.Vector3(5, 5, 0),

      velocityStyle: Type.CUBE,
      velocityBase: new THREE.Vector3(0, 0, -1),
      velocitySpread: new THREE.Vector3(1, 1, 0.5),
      accelerationBase: new THREE.Vector3(0, 0, -0.5),

      angleBase: 0,
      angleSpread: 720,
      angleVelocityBase: 0,
      angleVelocitySpread: 60,

      particleTexture: null,
      particleTexturePath: '../images/snowflake.png',

      sizeTween: new Tween([0, 0.25], [40, 80]),
      colorBase: new THREE.Vector3(0.66, 1.0, 0.9), // H,S,L
      opacityTween: new Tween([2, 3], [0.8, 0]),

      particlesPerSecond: 20,
      particleDeathAge: 4.0,
      emitterDeathAge: 60
    },

    rain:
    {
      positionStyle: Type.CUBE,
      positionBase: new THREE.Vector3(0, 0, 0),
      positionSpread: new THREE.Vector3(5, 5, 0),

      velocityStyle: Type.CUBE,
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

    candle:
    {
      positionStyle: Type.SPHERE,
      positionBase: new THREE.Vector3(0, 0, 0),
      positionRadius: 1,

      velocityStyle: Type.CUBE,
      velocityBase: new THREE.Vector3(0, 0, 7),
      velocitySpread: new THREE.Vector3(2, 2, 0),

      particleTexture: null,
      particleTexturePath: '../images/smokeparticle.png',

      sizeTween: new Tween([0, 0.3, 1.2], [20, 150, 1]),
      opacityTween: new Tween([0.9, 1.5], [1, 0]),
      colorTween: new Tween([0.5, 1.0], [new THREE.Vector3(0.02, 1, 0.5), new THREE.Vector3(0.05, 1, 0)]),
      blendStyle: THREE.AdditiveBlending,

      particlesPerSecond: 600,
      particleDeathAge: 12,
      emitterDeathAge: 60
    }

  }

function cloneExamples (examples) {
  let dst = {}
  for (let key in examples) {
    dst[key] = {}
    for (let u in examples[key]) {
      if (examples[key][u] instanceof THREE.Vector3) {
        dst[key][u] = examples[key][u].clone()
      } else if (examples[key][u] instanceof Tween) {
        dst[key][u] = examples[key][u].clone()
      } else if (examples[key][u] instanceof Array) {
        dst[key][u] = examples[key][u].slice()
      } else if (examples[key][u] instanceof String) {
        dst[key][u] = examples[key][u]
      } else if (examples[key][u] instanceof Number) {
        dst[key][u] = examples[key][u]
      } else {
        dst[key][u] = examples[key][u]
      }
    }
  }
  return dst
}

class Examples {
  constructor () {
    this.examples = cloneExamples(examples)
  }

  exist (effect) {
    if (this.examples[effect]) {
      return true
    } else {
      return false
    }
  }

  getEffect (effect) {
    return this.examples[effect]
  }

  destruct () {
    for (let key in this.examples) {
      if (this.examples[key].particleTexture) {
        this.examples[key].particleTexture.dispose()
        this.examples[key].particleTexture = null
      }
    }
  }
}

export { Examples }
