import React, { useRef, useMemo } from 'react';
import {
  useFBO
} from '@react-three/drei';

import {
  Scene
} from 'three';
import {useControls} from 'leva';
import {useFrame, createPortal, useThree} from '@react-three/fiber';
import TextFx from './TextFx'
import BackgroundFx from './BackgroundFx'


const FBO = () => {
  const { viewport, camera } = useThree()
  const fboSceneRef = useRef();
  const fboBGSceneRef = useRef();
  const shaderRef = useRef();
  const FBOscene = useMemo(() => new Scene(), [])
  const BGScene = useMemo(() => new Scene(), [])
  const target = useFBO();
  const {voronoiAmount} = useControls({voronoiAmount: {
      value: 200,
      min: 0,
      max: window.innerWidth/2,
      step: 1,
    }});

  useFrame((state) => {
    if (camera) {
      state.gl.autoClear = false;
      state.gl.clear();
      state.gl.setRenderTarget(target)
      state.gl.render(BGScene, camera)
      state.gl.render(FBOscene, camera)
      state.gl.setRenderTarget(null)
    }
    shaderRef.current.uniforms.voronoiAmount.value = voronoiAmount;
  });

  const shaderArgs = useMemo(
    () => ({
      uniforms: {
        iChannel0: { value: target.texture },
        voronoiAmount: { value: voronoiAmount },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        } 
      `,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        uniform sampler2D iChannel0;
        uniform int voronoiAmount;

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
            // vec2 mouseC = vMouseC;
            vec2 mouseC = vec2(.05,.5);
            //divide uv coord for tiling
            float def = float(voronoiAmount);
            //get global tile coordinate of uv
            //and tile coordinate of uv
            vec2 i_st = floor(def*uv);
            vec2 f_st = fract(def*uv);
            
            vec2 localPoint = vec2(0.);
            float dist = 1.5;
            //for each adjacent neighboring tiles
            if (def < 840.) {
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
            } else {
              gl_FragColor = texture(iChannel0, vUv); 
            }
  
            //#include <tonemapping_fragment>
            //#include <colorspace_fragment>
        }
      `
    }),
    [target.texture, viewport, voronoiAmount]
  )

  return (
    <>
      {createPortal(<TextFx ref={fboSceneRef} />, FBOscene)}
      {createPortal(<BackgroundFx ref={fboBGSceneRef} />, BGScene)}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[viewport.width, viewport.height]} />
        <shaderMaterial ref={shaderRef} args={[shaderArgs]} />
      </mesh>
    </>
  )
}

export default FBO;