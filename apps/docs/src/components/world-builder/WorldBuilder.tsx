import { Stars } from '@react-three/drei';
import * as React from 'react';
import { Vector3 } from 'three';
import Footer from '../footer/Footer';
import { SpaceBox } from '../SpaceBox';
import { Canvas } from './WorldBuilder.canvas';
import { RenderEntities } from './WorldBuilder.entities';
import { AU } from './WorldBuilder.math';
import { PostProcessing } from './WorldBuilder.postprocessing';

export default function(): React.ReactElement {
  // because React needs to be defined :[
  return (
    <div>
    <Canvas>
      <RenderEntities />
      <PostProcessing />
      <SpaceBox />
        <group
          scale={
            new Vector3(1, 1, 1)
              .multiplyScalar(AU)
              .multiplyScalar(10)
          }
        >
          <Stars />
        </group>
    </Canvas>
    <Footer middle={<div style={{ display: 'flex', justifyContent: 'space-between', width: "100vw", fontSize: '4em', padding: '1em' }}>
      <div id="body"></div>
      <div id="alt"></div>
      <div id="speed"></div>
    </div>}>
    </Footer>
    </div>
  );
}
