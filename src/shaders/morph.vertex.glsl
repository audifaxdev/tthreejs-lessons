uniform vec2 uRes;
uniform float uProgress;
varying float depth;
varying float initAlpha;
varying vec3 vColor;
attribute vec3 aPositionTarget;
attribute float aInitialAlpha;
attribute float aSize;
uniform vec3 colorA;
uniform vec3 colorB;
uniform float devicePixelRatio;

#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

void main() {
//  float n = min(abs(snoise3(position))*.4, .4);
  float noiseO = snoise3(position*.4);
  float noiseT = snoise3(aPositionTarget*.4);
  float noise = mix(noiseO, noiseT, uProgress);
  float n = smoothstep(-1., 1., noise);
  float duration = .4;
  float start = n * (1.- duration);
  float end = start + duration;
  float localProgress = smoothstep(start, end, uProgress);

  vec3 mixedPos = mix(position, aPositionTarget, localProgress);
  vec4 modelPos = modelMatrix * vec4(mixedPos, 1.);
  vec4 viewPos = viewMatrix * modelPos;
  gl_Position = projectionMatrix * viewPos;

  initAlpha = mix(aInitialAlpha, 1., localProgress);
  depth = viewPos.z;
  gl_PointSize = aSize * 0.05 * devicePixelRatio * uRes.y;
  gl_PointSize *= (1. / -viewPos.z);
  vColor = mix(colorA, colorB, noise);
}