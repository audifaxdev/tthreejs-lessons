import React, {useCallback, useMemo, useRef} from 'react';
import {OrbitControls, useGLTF, useProgress} from '@react-three/drei';
import {Vector2, AdditiveBlending, Vector3, Color} from "three";
import {useControls, button} from "leva";
import {useFrame} from "@react-three/fiber";
import gsap from "gsap";

import morphV from "./shaders/morph.vertex.glsl";
import morphF from "./shaders/morph.frag.glsl";

const MorphParticles = () => {
  const shaderMat = useRef();
  const pointsRef = useRef();
  const torusPositions = useGLTF('torus.glb')?.scene?.children[0]?.geometry?.attributes['position']?.array;
  const monkeyPositions = useGLTF('monkey.glb')?.scene?.children[0]?.geometry?.attributes['position']?.array;
  //Declares controls

  const [{uProgress}, setUProgress] = useControls(() => ({
    uProgress: {
      min:0, max:1, value:0, step:.01,
      transient: false,
    },
  }));
  const {colorA, colorB} = useControls({
    colorA: {
      value: "#ff7300",
      onChange: (v) => {
        shaderMat.current.uniforms.colorA.value.set(v)
      }
    },
    colorB: {
      value: "#0091ff",
      onChange: (v) => {
        shaderMat.current.uniforms.colorB.value.set(v)
      }
    },
  });

  const startAnimation = (reverse = false) => {
    const o = {value: reverse ? 1.:0.};
    const end = {value: reverse ? 0.:1., duration: 1.};
    gsap.fromTo(o, o, Object.assign(end, {
      ease: 'linear',
      onUpdate: (v) => {
        setUProgress({uProgress: o.value})
      }
    }));
  };

  useControls({
    animate: button(startAnimation.bind(this, false)),
    reverse: button(startAnimation.bind(this, true))
  })
  const buffers = useMemo(() => {
    //update smallest position buffer to match the biggest buffer size
    //make sure the extra points
    const smallerBuffer = torusPositions.length < monkeyPositions.length ? torusPositions:monkeyPositions;
    const biggerBuffer = torusPositions.length > monkeyPositions.length ? torusPositions:monkeyPositions;
    const posBufferLength = Math.max(smallerBuffer.length, biggerBuffer.length);
    const newPositionBuffer = new Float32Array(posBufferLength);
    const alphaVertexBuffer = new Float32Array(posBufferLength/3);
    const sizeVertexBuffer = new Float32Array(posBufferLength/3);
    let newPositions = [];
    let alphaVertex = [];
    for (let i=0;i<smallerBuffer.length;i+=3) {
      newPositions.push(new Vector3(smallerBuffer[i], smallerBuffer[i+1], smallerBuffer[i+2]));
      alphaVertex.push(1.);
    }
    for (let i=smallerBuffer.length;i<biggerBuffer.length;i+=3) {
      let mappedI = i % smallerBuffer.length;
      newPositions.push(new Vector3(smallerBuffer[mappedI], smallerBuffer[mappedI+1], smallerBuffer[mappedI+2]))
      alphaVertex.push(0.);
    }
    let indexedPositions = gsap.utils.shuffle( newPositions.map((v,i) => i) );
    //rebuild new positions and alphaV attributes, shuffled but data integrity kept
    indexedPositions.forEach((i,realIndex) => {
      //get randomized vec3 and alphaness
      const v = newPositions[i];
      const initialAlpha =  alphaVertex[i];
      const posI = realIndex * 3;
      newPositionBuffer[posI] = v.x;
      newPositionBuffer[posI+1] = v.y;
      newPositionBuffer[posI+2] = v.z;
      alphaVertexBuffer[realIndex] = initialAlpha;
      sizeVertexBuffer[realIndex] = Math.random();
    })
    return {
      alphaVertexBuffer, newPositionBuffer, biggerBuffer, posBufferLength, sizeVertexBuffer
    };
  }, [])

  useFrame(() => {
    shaderMat.current.uniforms.uProgress.value = uProgress;
  }, []);

  const shaderArgs = useMemo(
    () => ({
      precision: 'highp',
      blending: AdditiveBlending,
      depthWrite: false,
      uniforms: {
        devicePixelRatio: {
          value: devicePixelRatio
        },
        uRes: {
          value: new Vector2(window.innerWidth, window.innerHeight)
        },
        uProgress: {
          value: 0
        },
        maxVertices: {
          value: buffers.posBufferLength
        },
        colorA: {
          value: new Color(colorA)
        },
        colorB: {
          value: new Color(colorB)
        },
      },
      vertexShader: morphV,
      fragmentShader: morphF
  }), []);

  return (
    <>
      <OrbitControls makeDefault />
      <color args={["black"]} attach="background" />
      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={buffers.newPositionBuffer.length / 3} array={buffers.newPositionBuffer} itemSize={3}/>
          <bufferAttribute attach="attributes-aPositionTarget" count={buffers.biggerBuffer.length / 3} array={buffers.biggerBuffer} itemSize={3}/>
          <bufferAttribute attach="attributes-aInitialAlpha" count={buffers.alphaVertexBuffer.length} array={buffers.alphaVertexBuffer} itemSize={1}/>
          <bufferAttribute attach="attributes-aSize" count={buffers.sizeVertexBuffer.length} array={buffers.sizeVertexBuffer} itemSize={1}/>
        </bufferGeometry>
        {/*<sphereGeometry ref={geoRef} args={[3]} />*/}
        <shaderMaterial ref={shaderMat} args={[shaderArgs]}/>
      </points>
    </>
  );
}

export default MorphParticles;