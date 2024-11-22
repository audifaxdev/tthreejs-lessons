import { useRef } from 'react';
import {
  useTexture,
  OrbitControls,
  useHelper,
} from '@react-three/drei';

import {
  SRGBColorSpace,
  DirectionalLightHelper,
  ShaderMaterial,
  RepeatWrapping,
  Clock,
  DoubleSide
} from 'three';
import {useControls} from 'leva';
import { extend, useFrame } from '@react-three/fiber';

class MyShader extends ShaderMaterial {
  constructor(texture) {
    super({
      transparent: true,
      wireframe: false,
      depthWrite: false,
      side: DoubleSide,
      uniforms: {
        uTime: {
          value: 0
        },
        perlinTxt: {
          value: texture
        }
      },
      vertexShader: `
        uniform sampler2D perlinTxt;
        uniform float uTime;
        varying vec2 vUv;
        varying float smoke;
        varying float vTime;
        varying vec3 vPos;
        
        vec2 rotate2D(vec2 pt, float angle) {
          float s = sin(angle);
          float c = cos(angle);
          mat2 m = mat2(c, s, s, c);
          return m * pt;
        }
        
        void main() {

          vTime = uTime;
          vUv = uv;
          vPos = position;
          
          vec2 windOffset = vec2(
            texture2D(perlinTxt, vec2(0.25, uTime * .1)).r -.5, 
            texture2D(perlinTxt, vec2(0.75, 1. + uTime * .1)).r -.5
          );
          windOffset += pow(uv.y, 4.) *10.;
          
          vec2 rotated = rotate2D(position.xz, position.y  * 10.);
          vPos = vec3(rotated.x, position.y, rotated.y);
          // vPos.xz += windOffset;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( vPos, 1.0 );
        }
    `,
      fragmentShader: `
        uniform sampler2D perlinTxt;
        varying vec2 vUv;
        // varying float smoke;
        varying float vTime;
        varying vec3 vPos;
        
        void main() {
          vec2 smokeUv = vUv;
          smokeUv.x *= .5;
          smokeUv.y *= .3;
          smokeUv.y -= vTime * .03;
          float smoke = texture2D(perlinTxt, smokeUv).r;
          smoke = smoothstep(.35, 1., smoke);
          smoke *= smoothstep(0., .1, vUv.x);
          smoke *= smoothstep(1., .9, vUv.x);
          smoke *= smoothstep(0., .1, vUv.y);
          smoke *= smoothstep(1., .9, vUv.y);
          
          gl_FragColor = vec4(vec3(1.), smoke);
          // gl_FragColor = vec4(vPos.y * 10., 0., 0., 1.);
          // gl_FragColor = vec4(vUv.x, 0., vUv.y, 1.);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
    `,
    });
  }
}
extend({MyShader})

function cfgTxt(txt) {
  txt.colorSpace = SRGBColorSpace;
  txt.flipY = false;
  txt.wrapS = RepeatWrapping;
  txt.wrapT = RepeatWrapping;
  console.log(txt)
}
export default () => {
  const ref = useRef();
  const meshRef = useRef();
  const texture = useTexture("perlin.png");
  const {} = useControls({});

  cfgTxt(texture);
  useHelper(ref, DirectionalLightHelper);
  const clock = new Clock();
  clock.getElapsedTime();
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
    }
   });

  return (
    <>
      <OrbitControls makeDefault />
      <color args={["black"]} attach="background" />
      {/*<ambientLight intensity={.1} />*/}
      {/*<directionalLight intensity={2} castShadow={true} ref={ref} color="white" />*/}
      <mesh position={[0, 0, -10]}>
        <sphereGeometry args={[3]} />
        <meshBasicMaterial args={[{color: "red"}]} />
      </mesh>
      <mesh ref={meshRef} position={[0, 0, 0]} scale={[1.5, 6, 1.5]} translate={[0, .5, 0]}>
        <planeGeometry args={[1, 1, 16, 64]}/>
        <myShader args={[texture]}/>
      </mesh>
    </>
  );
}