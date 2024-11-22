varying float depth;
varying float initAlpha;
varying vec3 vColor;

vec3 pal( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
  return a + b*cos( 6.28318*(c*t+d) );
}

void main() {
  const float outerWidth = .05;
  //vec3 col = pal((2. / -depth), vec3(0.1,0.5,0.5), vec3(.9,.5,.1), vec3(.5,.1,.5), vec3(.8,.5,.5));
//  vec3 col = vec3(1.);
  float distanceToCenter = length( gl_PointCoord - vec2(.5) );
  float alpha = .05 / distanceToCenter - .1;
  gl_FragColor = vec4(vColor, alpha*initAlpha);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}