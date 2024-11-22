import {useRef, useEffect, forwardRef, useState, useMemo} from 'react';
import {
  OrbitControls,
  useTexture,
  useHelper, OrthographicCamera
} from '@react-three/drei';

import {
  Clock,
  NearestMipmapNearestFilter,
  BufferGeometry,
  BufferAttribute,
  Vector3,
  AxesHelper, Vector2
} from 'three';

import {extend, useFrame, useThree} from '@react-three/fiber';
import VoronoiShader from './VoronoiShader';

extend({VoronoiShader})

const BackgroundFx = forwardRef((props, ref) => {
  const { viewport } = useThree()
  const shaderRef = useRef();
  const clock = new Clock();
  clock.getElapsedTime();
  useFrame(() => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.iTime.value += .01;
    }
  });

  useEffect(() => {
    window.addEventListener("pointermove", (e) => {
      let x = e.clientX / window.innerWidth;
      let y = e.clientY / window.innerHeight;
      shaderRef.current.uniforms.mouseC.value.x = x;
      shaderRef.current.uniforms.mouseC.value.y = 1.-y;
    });
  }, [])


  const shaderArgs = useMemo(
    () => ({
      depthWrite: false,
      uniforms: {
        mouseC: { value: new Vector2() },
        iTime: { value: 0}
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        } 
      `,
      fragmentShader: /* glsl */ `
        #define fragColor gl_FragColor
        #define fragCoord gl_FragCoord
        varying vec2 vUv;
        uniform sampler2D iChannel0;
        uniform int voronoiAmount;
        uniform float iTime;
        uniform vec2 mouseC;
        vec3 pal( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
            return a + b*cos( 6.28318*(c*t+d) );
        }
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
          // Normalized pixel coordinates (from 0 to 1) 
          vec2 uv = vUv;
      
      
          //divide uv coord for tiling
          const float def = 14.;
          //get global tile coordinate of uv
          //and tile coordinate of uv
          vec2 i_st = floor(def*uv);
          vec2 f_st = fract(def*uv);
          vec3 col = 0.5 + 0.5*cos(.5*iTime+uv.xyx+vec3(0, 2, 4));
      
          vec2 localPoint = vec2(0.);
          float dist = 1.;
          //for each adjacent neighboring tiles
          for(int i=-1;i<=1;i++) {
              for(int j=-1;j<=1;j++) {
                  vec2 neighborTile = vec2(float(i), float(j));
                  //get tile random point in tile coordinate
                  vec2 randomPt = random2(i_st +  neighborTile);
                  
                  //animate
                  randomPt = 0.5 + 0.5*sin(iTime + 96.2831*randomPt);
                  
                  //get vector difference between random point and px
                  //so as to calculate distance between the 2
                  vec2 pxToPt = neighborTile + randomPt - f_st;
      
                  float lDist = length(pxToPt);
                  if ( lDist < dist ) {
                      // Keep the closer distance
                      dist = lDist;
      
                      // Kepp the position of the closer point
                      localPoint = randomPt;
                  }
      
              }
          }
          float distFromMouse = length(mouseC - uv);
          if (def * distFromMouse  < dist) {
      
              // Keep the closer distance
              dist = def * distFromMouse;
      
              // Kepp the position of the closer point
              localPoint = mouseC;
                  
          }
          
          col = vec3(dist);
          // col *= 0.5 + 0.5*cos(PI /4. * iTime+localPoint.xyx+vec3(2, 4, 0));
          col *= pal(vUv.x+iTime*.1, vec3(0.1,0.5,0.5), vec3(.9,.5,.1), vec3(.5,.1,.5), vec3(.8,.5,.5));
          //col = pal( vUv.x+iTime*.1, vec3(0.8,0.5,0.4),vec3(0.2,0.4,0.2),vec3(2.0,1.0,1.0),vec3(0.0,0.25,0.25) );
          
          // Output to screen
          fragColor = vec4(col,1.0);
  
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `
    }),
    []
  )

  return (
    <>
      <mesh position={[0, 0, 10]}>
        <planeGeometry args={[viewport.width, viewport.height]}/>
        <shaderMaterial ref={shaderRef} args={[shaderArgs]}/>
      </mesh>
    </>
  );
});

export default BackgroundFx;