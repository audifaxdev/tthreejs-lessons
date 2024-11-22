import React from 'react';
import { createRoot } from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import reportWebVitals from './reportWebVitals';
import MorphParticles from './MorphParticles';
import TextFx from './TextFx';
import FBO from './FBO'
import ImgParticles from './ImgParticles'
import './index.css';
import MSDFShader from "./MSDFShader";
import BackgroundFx from "./BackgroundFx";
import PostProcessing from "./PostProcessing";
import Hologram from "./Hologram";

const frustrumSize = 1;
const aspect = 1;

const orthoCamSettings = {
  position: [0,0,0],
  zoom: 4,
  left: frustrumSize * aspect / -2,
  right: frustrumSize * aspect / 2 ,
  top: frustrumSize / 2 ,
  bottom: frustrumSize / -2,
  near:-1000, far:1000
};

const perspCamSettings = {
  position: [0,0,3]
};

function App() {
  return (
    <React.StrictMode>
      <div id="canvas-container">
        <Canvas shadows={false} orthographic={true} {...orthoCamSettings}>
          <TextFx />
        </Canvas>
      </div>
      {/*<div id="html-overlay">*/}

      {/*</div>*/}
    </React.StrictMode>
  )
}

createRoot(document.getElementById('root')).render(<App />)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
