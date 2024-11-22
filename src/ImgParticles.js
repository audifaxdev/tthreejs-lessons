import React, { useRef, useMemo } from 'react';
import {
  useTexture,
  useVideoTexture,
  OrbitControls
} from '@react-three/drei';

import {
  Scene, Vector2, AdditiveBlending, SRGBColorSpace
} from 'three';
import {useControls} from 'leva';
import {useFrame, createPortal, useThree} from '@react-three/fiber';
import TextFx from './TextFx'
import BackgroundFx from './BackgroundFx'

const ImgParticles = () => {
  const { viewport, camera } = useThree();
  const ref = useRef();
  const shaderRef = useRef();
  // const texture = useTexture("./img.png");
  const texture = useVideoTexture("http://localhost:3001");
  const {} = useControls({});

  texture.colorSpace = SRGBColorSpace;

  useFrame((state) => {
    // shaderRef.current.uniforms.voronoiAmount.value = voronoiAmount;
  });

  const shaderArgs = useMemo(() => ({
    depthWrite: false,
    depthTest: false,
    blending: AdditiveBlending,
    uniforms: {
      iChannel0: { value: texture },
      uRes: {
        value: new Vector2(window.innerWidth, window.innerHeight)
      },
      devicePixelRatio: {
        value: devicePixelRatio
      },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      uniform vec2 uRes;
      uniform float devicePixelRatio;
      void main() {
        vec4 modelPos = modelMatrix * vec4(position, 1.);
        vec4 viewPos = viewMatrix * modelPos;
        gl_Position = projectionMatrix * viewPos;

        vUv = uv;
        gl_PointSize = 0.03 * uRes.y;
        gl_PointSize *= (1. / -viewPos.z);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform sampler2D iChannel0;

      void main() {
          float distanceToCenter = length( gl_PointCoord - vec2(.5) );
          float alpha = .05 / distanceToCenter - .1;
          vec4 col = texture2D(iChannel0, vUv);
          gl_FragColor = vec4(col.rgb, alpha);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
      }
    `
  }), []);

  return (
    <>
      {/*<color args={["#000000"]} attach="background"/>*/}
      <color args={["black"]} attach="background"/>
      {/*<color args={["black"]} attach="background"/>*/}

      {/*<OrbitControls makeDefault/>*/}
      {/*<points position={[0, 0, 0]}>*/}
      {/*  <planeGeometry args={[viewport.width, viewport.height, 256, 256]}/>*/}
      {/*  <shaderMaterial ref={shaderRef} args={[shaderArgs]}/>*/}
      {/*</points>*/}
    </>
  )
}

export default ImgParticles;