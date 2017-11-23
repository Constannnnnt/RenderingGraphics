var projTexShader = {}

projTexShader.vertex = `
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec2 vUv;
uniform vec4 offsetRepeat;
varying vec3 vWorldPosition;

uniform mat4 textureMatrixProj; // for projective texturing
varying vec4 texCoordProj; // for projective texturing

uniform sampler2D map;

void main() {
  // vUv = uv * offsetRepeat.zw + offsetRepeat.xy;
  vUv = uv;

  vec3 transformedNormal = normalMatrix * normal;
  vNormal = normalize( transformedNormal );

  vec4 mvPosition;
  mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_Position = projectionMatrix * mvPosition;

  vViewPosition = -mvPosition.xyz;

  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
  vWorldPosition = worldPosition.xyz;

  texCoordProj = textureMatrixProj * modelMatrix * vec4(position, 1.0);  // for projective texturing
}
`

projTexShader.fragment = `
uniform vec3 diffuse;
uniform float opacity;
const vec3 ambient = vec3(1.0, 1.0, 1.0);
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
varying vec2 vUv;
uniform sampler2D map;
const vec3 ambientLightColor = vec3(0.25, 0.25, 0.25);

#if NUM_SPOT_LIGHTS > 0
struct SpotLight {
  vec3 color;
  float coneCos;
  float decay;
  vec3 direction;
  float distance;
  vec3 position;
};
uniform SpotLight spotLights[NUM_SPOT_LIGHTS];
#endif

uniform float exponent;

varying vec3 vWorldPosition;
varying vec3 vViewPosition;
varying vec3 vNormal;

uniform sampler2D mapProj;  // for projective texturing
varying vec4 texCoordProj; // for projective texturing

void main() {
  gl_FragColor = vec4( vec3 ( 1.0 ), opacity );

  vec4 texelColor = texture2D( map, vUv );

  gl_FragColor = gl_FragColor * texelColor;


  vec4 texColorProj = texCoordProj.q < 0.0 ? vec4(0.0, 0.0, 0.0, 0.0) : texture2DProj( mapProj, texCoordProj); // for projective texturing
  float projectorAttenuation = texColorProj.r; // for projective texturing

  float specularStrength = 1.0;

  vec3 normal = normalize( vNormal );
  vec3 viewPosition = normalize( vViewPosition );
  vec3 spotDiffuse  = vec3( 0.0 );
  vec3 spotSpecular = vec3( 0.0 );
  vec4 lPosition = viewMatrix * vec4( spotLights[1].position, 1.0 );
  vec3 lVector = lPosition.xyz + vViewPosition.xyz;
  float lDistance = 1.0;
  if ( spotLights[1].distance > 0.0 )
    lDistance = 1.0 - min( ( length( lVector ) / spotLights[1].distance ), 1.0 );
  lVector = normalize( lVector );
  float spotEffect = dot( spotLights[1].direction, normalize( spotLights[1].position - vWorldPosition ) );
  if ( spotEffect > spotLights[1].coneCos ) {
    spotEffect = max( pow( abs(spotEffect), exponent ), 0.0 );
    float dotProduct = dot( normal, lVector );
    float spotDiffuseWeight = max( dotProduct, 0.0 );
    spotDiffuse += diffuse * spotLights[1].color * spotDiffuseWeight * lDistance * spotEffect * projectorAttenuation; // corrected by the projector attenuation
    vec3 spotHalfVector = normalize( lVector + viewPosition );
    float spotDotNormalHalf = max( dot( normal, spotHalfVector ), 0.0 );
    float spotSpecularWeight = specularStrength * max( pow( spotDotNormalHalf, shininess ), 0.0 );
    spotSpecular += specular * spotLights[1].color * spotSpecularWeight * spotDiffuseWeight * lDistance * spotEffect * projectorAttenuation; // corrected by the projector attenuation
  }
  vec3 totalDiffuse = vec3( 0.0 );
  vec3 totalSpecular = vec3( 0.0 );
  totalDiffuse += spotDiffuse;
  totalSpecular += spotSpecular;

  gl_FragColor.xyz = gl_FragColor.xyz * ( emissive + totalDiffuse + ambientLightColor * ambient) + totalSpecular;
}
`

export default projTexShader