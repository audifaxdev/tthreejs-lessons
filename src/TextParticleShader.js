
import {
  ShaderMaterial,
  DoubleSide,
  Vector2,
} from 'three';

class TextParticleShader extends ShaderMaterial {
  constructor() {
    super({
      transparent: true,
      wireframe: false,
      depthWrite: false,
      depthTest: false,
      side: DoubleSide,
      uniforms: {
        mouseC: {type: 'v2', value: new Vector2()},
        viewport: {type: 'v2', value: new Vector2(window.innerWidth*devicePixelRatio, window.innerHeight*devicePixelRatio)},
        devicePixelRatio: {type: 'i', value: devicePixelRatio}
      },
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_PointSize = 10.;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
    `,
      fragmentShader: `
        varying vec2 vUv;
        uniform vec2 mouseC;
        uniform vec2 viewport;
        uniform int devicePixelRatio;
        
        float makeCircle() {
          vec2 viewportUV = gl_FragCoord.xy / viewport;
          float viewportAspect = viewport.x / viewport.y;
          
          vec2 mousePoint = vec2(mouseC.x, 1. - mouseC.y);
          float circleRadius = max(0.0, float(devicePixelRatio) * 100. / viewport.x);
          
          vec2 shapeUv = viewportUV - mousePoint;
          shapeUv /= vec2(1.0, viewportAspect);
          shapeUv += mousePoint;
          
          float dist = distance(shapeUv, mousePoint);
          dist = smoothstep(circleRadius, circleRadius + 0.001, dist);
          return dist;
         }
       
        void main() {
          float c = 1. - makeCircle();
          c = 1.;
          float dist = length(gl_PointCoord - vec2(.5));
          float disc = smoothstep(0.5, 0.45, dist);
          gl_FragColor = vec4(disc*c);
          if (gl_FragColor.a < .001) discard;
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
    `,
    });
  }
}

export default TextParticleShader;