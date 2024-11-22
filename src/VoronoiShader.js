
import {
  ShaderMaterial,
  DoubleSide,
  Vector2,
} from 'three';
import { extend } from '@react-three/fiber';

class VoronoiShader extends ShaderMaterial {
  constructor(texture) {
    super({
      transparent: true,
      wireframe: false,
      depthWrite: false,
      side: DoubleSide,
      uniforms: {
        mouseC: {
          value: new Vector2(0,0)
        },
        iChannel0: {
          value: texture
        }
      },
      vertexShader: `
        uniform sampler2D iChannel0;
        uniform vec2 mouseC;
        
        varying vec2 vUv;
        varying vec2 vMouseC;

        void main() {
          vUv = uv;
          vMouseC = mouseC;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
    `,
      fragmentShader: `
        uniform sampler2D iChannel0;
        varying vec2 vMouseC;
        varying vec2 vUv;
        
        vec2 random2( vec2 p ) {
            return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
        }
        
        #define PI 3.14159265359
        #define threshold 0.55
        #define padding 0.2
        #define METHOD 2

        float map(float value, float min1, float max1, float min2, float max2) {
          return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
        }
        
        void main() {
            // vec4 vCol = texture2D(iChannel0, vUv);
            // Normalized pixel coordinates (from 0 to 1)
            vec2 uv = vUv;
            // vec2 mouseC = iMouse.xy / iResolution.xy;
            vec2 mouseC = vMouseC;
            vec4 video = texture(iChannel0, uv);
            
            // Normalized pixel coordinates (from 0 to 1) 
            // vec2 uv = fragCoord/iResolution.xy;
            // vec2 mouseC = iMouse.xy / iResolution.xy;
            //divide uv coord for tiling
            float def = float( floor(map(mouseC.x, 0., 1., 16., 960.)) );
            //float def = max(16., float( floor(200.*  (.5 + .5 * sin(iTime))) ) );
            //get global tile coordinate of uv
            //and tile coordinate of uv
            vec2 i_st = floor(def*uv);
            vec2 f_st = fract(def*uv);
            
            vec2 localPoint = vec2(0.);
            float dist = 1.5;
            //for each adjacent neighboring tiles
            for(int i=-1;i<1;i++) {
                for(int j=-1;j<1;j++) {
                    vec2 neighborTile = vec2(float(i), float(j));
                    //get tile random point in tile coordinate
                    vec2 randomPt = random2(i_st +  neighborTile);
        
                    //get vector difference between random point and px
                    //so as to calculate distance between the 2
                    vec2 pxToPt = neighborTile + randomPt - f_st;
                    float lDist = length(pxToPt);
        
                    if ( lDist < dist) {
                        // Keep the closer distance
                        dist = lDist;
        
                        // Kepp the position of the closer point
                        localPoint = i_st + neighborTile + randomPt;
                    }
        
                }
            } 
        
            gl_FragColor = texture(iChannel0, (localPoint) / def); 
  
            //#include <tonemapping_fragment>
            //#include <colorspace_fragment>
        }
    `,
    });
  }
}
extend({VoronoiShader})

export default VoronoiShader;