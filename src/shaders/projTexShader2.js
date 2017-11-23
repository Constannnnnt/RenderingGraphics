var projTexShader2 = {}

projTexShader2.vertex = `
varying vec2 vUv;
varying vec3 vecPos;
varying vec3 vecNormal;
  
void main() {
  vUv = uv;
  // Since the light is in camera coordinates,
  // I'll need the vertex position in camera coords too
  vecPos = (modelViewMatrix * vec4(position, 1.0)).xyz;
  // That's NOT exacly how you should transform your
  // normals but this will work fine, since my model
  // matrix is pretty basic
  vecNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz;
  gl_Position = projectionMatrix *
                vec4(vecPos, 1.0);
}
`

projTexShader2.fragment = `
precision highp float;
  
varying vec2 vUv;
varying vec3 vecPos;
varying vec3 vecNormal;
  
uniform float lightIntensity;
uniform sampler2D textureSampler;
 
struct SpotLight {
  vec3 color;
  vec3 position; // light position, in camera coordinates
  float distance; // used for attenuation purposes. Since
                  // we're writing our own shader, it can
                  // really be anything we want (as long as
                  // we assign it to our light in its
                  // "distance" field
};
 
uniform SpotLight spotLights[NUM_SPOT_LIGHTS];
  
void main(void) {
  // Pretty basic lambertian lighting...
  vec4 addedLights = vec4(0.0,
                          0.0,
                          0.0,
                          1.0);

  vec3 lightDirection = normalize(vecPos
                        - spotLights[1].position);
  addedLights.rgb += clamp(dot(-lightDirection,
                            vecNormal), 0.0, 1.0)
                      * spotLights[1].color
                      * lightIntensity;

  gl_FragColor = texture2D(textureSampler, vUv)
                 * addedLights;
}
`

export default projTexShader2