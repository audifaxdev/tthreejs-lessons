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
  Clock, DoubleSide
} from 'three';
import {useControls} from 'leva';
import { extend, useFrame } from '@react-three/fiber';

class MyShader extends ShaderMaterial {
  constructor() {
    super({
      transparent: true,
      wireframe: true,
      depthWrite: true,
      side: DoubleSide,
      uniforms: {
        uTime: {
          value: 0
        },
      },
      vertexShader: `
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
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
    `,
      fragmentShader: `
        varying vec2 vUv;
        varying float vTime;
        varying vec3 vPos;
        
        void main() {

          // gl_FragColor = vec4( 1.);
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
    // if (meshRef.current) {
    //   meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
    // }
   });

  return (
    <>
      <OrbitControls makeDefault/>
      <color args={["black"]} attach="background"/>
      {/*<ambientLight intensity={.1} />*/}
      {/*<directionalLight intensity={2} castShadow={true} ref={ref} color="white" />*/}
      <mesh position={[-10, 0, 0]}>
        <sphereGeometry args={[3]}/>
        <meshBasicMaterial args={[{color: "red"}]}/>
      </mesh>

      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1]}/>
        <meshBasicMaterial args={[{color: "red"}]}/>
      </mesh>
      <mesh position={[0, 0, 0]} scale={[0, 0, 0]} translate={[0, 0, 0]}>
        <sphereGeometry args={[1]}/>
        <meshBasicMaterial args={[{color: "red"}]}/>
      </mesh>
    </>
  );
}