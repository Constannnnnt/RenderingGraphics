const particleShaderFrag = `
varying vec4 vColor;

void main() {
  float f = length( gl_PointCoord - vec2( 0.5, 0.5 ) );
  if ( f > 0.5 ) {
    discard;
  }
  gl_FragColor = vColor;
}
`

export default particleShaderFrag
