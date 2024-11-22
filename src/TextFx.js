import {useRef, useEffect, forwardRef, useState, useMemo, useCallback, useLayoutEffect} from 'react';
import {
  OrbitControls,
  useTexture,
  useHelper, OrthographicCamera, Html
} from '@react-three/drei';

import {
  Clock,
  NearestMipmapNearestFilter,
  BufferGeometry,
  BufferAttribute,
  Vector3,
  AxesHelper
} from 'three';
import {useControls} from 'leva';
import {extend, useFrame} from '@react-three/fiber';
import {TextGeometry as BMFTextGeometry} from "three-bmfont-text-es/";
import MSDFShader from './MSDFShader';
import font from "./manifold.json";
import playFairFont from "./PlayfairDisplay-Black-msdf.json";
import TextParticleShader from "./TextParticleShader";

extend({BMFTextGeometry})
extend({MSDFShader})
extend({TextParticleShader})

const fontScale = 1;
const TextFx = forwardRef((props, ref) => {
  const textRef = useRef();
  const matRef = useRef();
  const mat2Ref = useRef();
  const [textPositions, setTextPositions] = useState(false);
  const axesHelper = useRef();
  const [text, setText] = useState('AU');
  const map = useTexture("./manifold-msdf.png");
  // const map = useTexture("./PlayfairDisplay-Black.png");
  const gradMap = useTexture("./gradient-map.png");
  map.minFilter = NearestMipmapNearestFilter;
  const clock = new Clock();
  clock.getElapsedTime();
  useFrame(() => {
    if (matRef.current) {
      matRef.current.uniforms.time.value += .1;
    }
  });
  useLayoutEffect(() => {
    if (!bmFTextStableRef.current) {
      console.log('bmFText is null');
      return;
    } else {
      console.log('bmFText is not null');
    }

    console.log('bmFTextStableRef',bmFTextStableRef.current);

    const bGeo = bmFTextStableRef.current;
    bGeo.scale(fontScale, -fontScale, -fontScale);
    bGeo.computeBoundingBox();
    const b = bGeo.boundingBox;
    let min = b.min;
    let size = new Vector3();
    b.getSize(size);
    size = size.multiplyScalar(0.5);
    bGeo.translate(-min.x-size.x, -min.y-size.y, -min.z-size.z);
    bGeo.attributes.position.needsUpdate = true;
    bGeo.computeBoundingBox();
    bGeo.computeBoundingSphere();

    let positions = bmFTextStableRef.current.attributes.position.clone();
    let particleCount = positions.count;
    let p = [];
    const scale = 30.;
    for (let i=0;i<particleCount;i++) {
      const randomI = Math.floor(Math.random()*particleCount);
      const x = positions[randomI];
      const y = positions[randomI+1];
      const z = positions[randomI+2];
      p.push(x,y,z);
    }
    setTextPositions(true);

    window.addEventListener("pointermove", (e) => {
      let x = e.clientX / window.innerWidth;
      let y = e.clientY / window.innerHeight;
      matRef.current.uniforms.mouseC.value.x = x;
      matRef.current.uniforms.mouseC.value.y = y;

      mat2Ref.current.uniforms.mouseC.value.x = x;
      mat2Ref.current.uniforms.mouseC.value.y = y;
    });
  }, []);

  // for(let i=0;i<particleCount;i++) {
  //   let x = scale * (Math.random()-.5);
  //   let y = scale * (Math.random()-.5);
  //   let z = Math.random()-.5;
  //   pos.push(x,y,z);
  // }

  const bmFTextStableRef = useRef(null);

  return (
    <>
      <color args={["black"]} attach="background"/>
      {/*<mesh ref={axesHelper} />*/}
      <group visible={true}>
        <mesh ref={textRef} scale={[3,3,3]}>
          <bMFTextGeometry ref={bmFTextStableRef} args={[{
            text,
            font,
            align: 'center',
            flipY: map.flipY
          }]} />
          <mSDFShader ref={matRef} args={[{
            map,
            gradMap,
            transparent: true,
            color: '#ffffff',
            negate: false,
          }]} />
        </mesh>
      </group>
      <group visible={false} position={[0, 0, 0]}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={textPositions.length / 3} array={textPositions} itemSize={3}/>
          </bufferGeometry>
          <textParticleShader ref={mat2Ref}/>
        </points>
      </group>
      <group visible={false}>
        <mesh>
          <meshBasicMaterial args={[{color: 'white'}]}/>
          <boxGeometry args={[1, 1]}/>
        </mesh>
      </group>
    </>
  );
});

export default TextFx;