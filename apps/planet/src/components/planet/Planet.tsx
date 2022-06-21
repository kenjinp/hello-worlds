import { useControls } from "leva";
import * as React from "react";
import * as THREE from "three";
import { useColorController } from "../generators/ColorController";
import { useHeightController } from "../generators/HeightController";
import { NOISE_STYLES } from "../noise/Noise";
import { useNoiseController } from "../noise/NoiseController";
import CubicQuadTree from "../quadtree/CubicQuadTree";
import { TerrainChunkCube } from "../terrain/TerrainChunkCube";
import { useTerrainController } from "../terrain/TerrainController";
const Planet: React.FC = () => {
  const rootGroupRef = React.useRef<THREE.Group>(null);
  const planet = useControls("planet", {
    planetRadius: {
      min: -10_000_000,
      max: 10_000_000,
      value: 500,
      step: 10,
    },
    minCellSize: {
      min: 0,
      max: 10_000_000,
      value: 500,
      step: 10,
    },
    minCellResolution: {
      min: 0,
      max: 10_000_000,
      value: 128,
      step: 10,
    },
  });
  const noise = useNoiseController("noise");
  const biomes = useNoiseController("biomes", {
    octaves: 2,
    persistence: 0.5,
    lacunarity: 2.0,
    exponentiation: 3.9,
    scale: 2048.0,
    noiseType: NOISE_STYLES.simplex,
    seed: 2,
    height: 1,
  });
  const terrain = useTerrainController();

  const colors = useColorController();

  const heights = useHeightController(noise);

  React.useEffect(() => {
    if (!rootGroupRef.current) {
      return;
    }
    console.log("hi", rootGroupRef.current);
    const nodes = [];
    const q = new CubicQuadTree({
      radius: planet.planetRadius,
      minNodeSize: planet.minCellSize,
    });

    // do something to click and add position
    // q.Insert(this._params.camera.position);

    const sides = q.getChildren();

    console.log({ sides });

    const center = new THREE.Vector3();
    const dimensions = new THREE.Vector3();
    for (let i = 0; i < sides.length; i++) {
      const group = rootGroupRef.current.children[i];
      console.log({ group });
      group.matrix = sides[i].transform;
      group.matrixAutoUpdate = false;
      for (let c of sides[i].children) {
        c.bounds.getCenter(center);
        c.bounds.getSize(dimensions);

        const child = {
          index: i,
          group,
          position: [center.x, center.y, center.z],
          bounds: c.bounds,
          size: dimensions.x,
        };
        nodes.push(child);

        // const k = _Key(child);
        // newTerrainChunks[k] = child;

        // const [xp, yp, zp] = difference[k].position;

        // const offset = new THREE.Vector3(xp, yp, zp);
      }
    }
  }, [rootGroupRef.current]);

  return (
    <group ref={rootGroupRef}>
      {[...new Array(6)].fill(0).map((val, index) => {
        console.log("hello", index);
        return (
          <group key={`group.${index}`}>
            <TerrainChunkCube
              {...{
                offset: new THREE.Vector3(),
                name: `mainChunk.${index}`,
                width: terrain.width,
                scale: terrain.scale,
                radius: planet.planetRadius,
                visible: terrain.visible,
                subdivisions: terrain.subdivisions,
                wireframe: terrain.wireframe,
                resolution: planet.minCellResolution,
                colourGenerator: colors,
                heightGenerators: [heights],
              }}
            />
          </group>
        );
      })}
    </group>
  );
};

export default Planet;
