import SelfShaderChunks from './SelfShaderChunks'

var MatcapShader = {}

MatcapShader.unif = `
    bumpMapUsed: {type: 'f', value: 0.0}, // mtl bump or map_bump exists
    bumpMap: {type: 't', value: null}, // mtl map_bump
    bumpScale: {type: 'f', value: 1.0}, // mtl bump or map_bump scale
    bumpMapPath: {value: null},
    normalMapUsed: {type: 'f', value: 0.0}, // the normal map
    normalMap: {type: 't', value: null},
    normalScale: {type: 'v2', value: [1.0, 1.0]},
    normalMapPath: {value: null},
    displacementMapUsed: {type: 'f', value: 0.0},
    displacementMap: {type: 't', value: null},
    displacementScale: {type: 'f', value: 0.0},
    displacementBias: {type: 'f', value: 0.0},
    displacementMapPath: {value: null},

    ka: {type: 'v3', value: [0.2, 0.2, 0.2]}, // mtl ka, ambient color
    mapKaUsed: {type: 'f', value: 0.0},
    mapKa: {type: 't', value: null},
    mapKaPath: {value: null},
    mapKaWidth: {type: 'f', value: 1.0},
    mapKaHeight: {type: 'f', value: 1.0},
    kd: {type: 'v3', value: [0.1, 0.1, 1.0]}, // mtl kd, diffuse color
    mapKdUsed: {type: 'f', value: 0.0}, // mtl map_kd exists or not
    mapKd: {type: 't', value: null}, // mtl map_kd, diffuse map
    mapKdPath: {value: null},
    mapKdWidth: {type: 'f', value: 1.0},
    mapKdHeight: {type: 'f', value: 1.0},
    ks: {type: 'v3', value: [1.0, 0.1, 0.1]}, // mtl ks, specular color
    mapKsUsed: {type: 'f', value: 0.0},
    mapKs: {type: 't', value: null},
    mapKsPath: {value: null},
    mapKsWidth: {type: 'f', value: 1.0},
    mapKsHeight: {type: 'f', value: 1.0},
    ns: {type: 'f', value: 20.0}, // mtl ns, specular shininess

    d: {type: 'f', value: 1.0}, // opacity, the alpha channel

    // matcap parameters
    MatcapTextureUsed: {type: 'f', value: 0.0},
    MatcapTexture: {type: 't', value: null},
    MatcapTexturePath: {value: null},
    fraction: {type: 'v3', value: [1.0, 1.0, 1.0]}
`,

MatcapShader.vert = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
` +
    SelfShaderChunks.DisplacementMapPositionCalculation_vertex +
`void main()
{
  // passing texture to fragment shader
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vViewPosition = -(modelViewMatrix * vec4(position, 1.0)).xyz;

  vec3 transformedPosition = position + displacementMapOffset(normal, uv);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformedPosition,1.0);
}
`,

MatcapShader.frag = `
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
` +
    THREE.ShaderChunk['bumpmap_pars_fragment'] +
    THREE.ShaderChunk['normalmap_pars_fragment'] +
    `
void main() {
    vec3 modelPosition = -vViewPosition;
    vec3 treatedNormal = normalize(vNormal);
    if (bumpMapUsed > 0.5) treatedNormal = perturbNormalArb(modelPosition, treatedNormal, dHdxy_fwd());
    if (normalMapUsed > 0.5) treatedNormal = perturbNormal2Arb(modelPosition, treatedNormal);
    vec3 r = reflect(treatedNormal, normalize(modelPosition));
    float m = 2.0 * sqrt(pow(r.x, 2.0) + pow(r.y, 2.0) + pow(r.z + 1.5, 2.0));
    vec2 matcapuv = r.xy / m + 0.5;

    vec3 base = fraction;
    if (MatcapTextureUsed > 0.5) {
        base *= texture2D(MatcapTexture, matcapuv).rgb;
    }

    gl_FragColor = vec4(base, 1.0);
}
`

export default MatcapShader