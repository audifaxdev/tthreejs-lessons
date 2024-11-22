import { useRef } from 'react';
import {
  useVideoTexture,
  useTexture
} from '@react-three/drei';
import {
  SRGBColorSpace,
  Clock,
  Raycaster,
  Vector2,
} from 'three';
import {useControls} from 'leva';
import { useFrame, useThree } from '@react-three/fiber';
import GreenScreenShader from './GreenScreenShader';
import VoronoiShader from './VoronoiShader';


function cfgTxt(txt) {
  txt.colorSpace = SRGBColorSpace;
  txt.flipY = true;
  // txt.wrapS = RepeatWrapping;
  // txt.wrapT = RepeatWrapping;
  // txt.anosotropy = 32;
}

export default () => {
  const { camera, scene } = useThree();
  const ref = useRef();
  const matRef = useRef();
  const texture = useTexture("img.png")
  const {} = useControls({});
  const raycaster = new Raycaster();
  const pointer = new Vector2();

  window.addEventListener('pointermove', (e) => {
    pointer.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
    if (ref.current) {
      camera.updateMatrixWorld();
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects( scene.children, false );
      if (intersects.length) {
        matRef.current.uniforms.mouseC.value = intersects[0].uv;
      }
    }
  });

  cfgTxt(texture);

  return (
    <>
      <color args={["black"]} attach="background"/>
      <mesh ref={ref} toneMapped={false} position={[0,0,0]} scale={[1000, 1000, 1000]}>
        <planeGeometry args={[16 / 9, 1]}/>
        <greenScreenShader ref={matRef} args={[texture]}/>
      </mesh>

    </>
  );
}