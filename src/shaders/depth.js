var depthShader = {}

depthShader.vert = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

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
`

export default depthShader;
