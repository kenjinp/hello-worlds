import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import * as React from "react";
import * as THREE from "three";
import { dictDifference, dictIntersection } from "../../utils";
import Chunk from "../chunk/Chunk";
import ChunkBuilder from "../chunk/ChunkBuilder";
import { useColorController } from "../generators/ColorController";
import { useHeightController } from "../generators/HeightController";
import { NOISE_STYLES } from "../noise/Noise";
import { useNoiseController } from "../noise/NoiseController";
import CubicQuadTree from "../quadtree/CubicQuadTree";
import { Node } from "../quadtree/Quadtree";
import { useTerrainController } from "../terrain/TerrainController";

export interface ChunkChild {
  index: number;
  // group: THREE.Object3D;
  position: THREE.Vector2;
  chunk: Chunk;
  // bounds: Node["bounds"];
  size: number;
}

export interface RootChunk {
  index: number;
  group: THREE.Object3D;
  position: THREE.Vector3;
  bounds: Node["bounds"];
  size: number;
}

export type ChunkMap = Record<string, ChunkChild | RootChunk>;

const makeChunkKey = (child: ChunkChild | RootChunk) => {
  return (
    child.position.x +
    "/" +
    child.position.y +
    " [" +
    child.size +
    "]" +
    " [" +
    child.index +
    "]"
  );
};

const Planet: React.FC = () => {
  const chunkDebug = useControls({ chunkDebugColors: false });

  const chunks = React.useRef<ChunkMap>({});
  const [updater, setUpdater] = React.useState(0);
  const [builder] = React.useState(new ChunkBuilder());
  const [material] = React.useState(
    new THREE.MeshStandardMaterial({
      wireframe: false,
      wireframeLinewidth: 1,
      color: 0xffffff,
      side: THREE.DoubleSide,
      vertexColors: true,
    })
  );

  const { camera, scene } = useThree();

  const rootGroupRef = React.useRef<THREE.Group>(null);
  const planet = useControls("planet", {
    invert: true,
    planetRadius: {
      min: -10_000_000,
      max: 10_000_000,
      value: 4_000,
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
  const noise = useNoiseController("noise", {
    seed: (Math.random() + 1).toString(36).substring(7),
  });
  const biomes = useNoiseController("biomes", {
    octaves: 2,
    persistence: 0.5,
    lacunarity: 2.0,
    exponentiation: 1,
    scale: 2048.0,
    noiseType: NOISE_STYLES.simplex,
    seed: 2,
    height: 1,
  });
  const terrain = useTerrainController();

  const colors = useColorController();

  const heights = useHeightController(noise);

  React.useEffect(() => {
    builder.rebuild(chunks.current);
  }, [planet, terrain, noise, biomes, colors, heights]);

  React.useEffect(() => {
    material.wireframe = terrain.wireframe;
    for (let k in chunks.current) {
      if (chunks.current[k].chunk) {
        chunks.current[k].chunk!.plane.material.wireframe = terrain.wireframe;
      }
    }
  }, [terrain.wireframe]);

  // React.useEffect(() => {
  // const side = planet.invert ? THREE.BackSide : THREE.FrontSide;
  // material.side = side;
  // for (let k in chunks.current) {
  //   if (chunks.current[k].chunk) {
  //     chunks.current[k].chunk!.plane.material.side = side;
  //   }
  // }
  // }, [planet.invert]);

  // React.useEffect(() => {
  //   for (let k in chunks.current) {
  //     console.log(k);
  //     if (chunks.current[k].chunk) {
  //       (chunks.current[k].chunk as Chunk).plane.material.color =
  //         new THREE.Color(Math.random() * 0xffffff);
  //       (chunks.current[k].chunk as Chunk).plane.material.vertexColors = false;
  //     }

  //     material.color = new THREE.Color(Math.random() * 0xffffff);
  //     material.vertexColors = false;
  //   }
  // }, [chunkDebug.chunkDebugColors]);

  useFrame(() => {
    if (!rootGroupRef.current) {
      return;
    }

    scene.traverse((object) => (object.frustumCulled = false));

    builder.update();

    if (builder.busy) {
      return;
    }

    const q = new CubicQuadTree({
      radius: planet.planetRadius,
      minNodeSize: planet.minCellSize,
    });

    q.insert(camera.position);

    const sides = q.getChildren();

    let newTerrainChunks: ChunkMap = {};
    const center = new THREE.Vector3();
    const dimensions = new THREE.Vector3();

    for (let i = 0; i < sides.length; i++) {
      const group = rootGroupRef.current.children[i];
      group.matrix = sides[i].transform;
      group.matrixAutoUpdate = false;

      for (let c of sides[i].children) {
        c.bounds.getCenter(center);
        c.bounds.getSize(dimensions);

        const rootChildChunk: RootChunk = {
          index: i,
          group: group,
          position: new THREE.Vector3(center.x, center.y, center.z),
          bounds: c.bounds,
          size: dimensions.x,
        };

        const k = makeChunkKey(rootChildChunk);
        newTerrainChunks[k] = rootChildChunk;
      }
    }

    const intersection = dictIntersection(chunks.current, newTerrainChunks);
    const difference = dictDifference(newTerrainChunks, chunks.current);
    const oldChunks = Object.values(
      dictDifference(chunks.current, newTerrainChunks)
    );

    // @ts-ignore
    builder.insertOld(oldChunks);

    newTerrainChunks = intersection;

    const createTerrainChunk = (
      group: THREE.Object3D,
      offset: THREE.Vector3,
      width: number,
      resolution: number
    ) => {
      return builder.allocateChunk({
        invert: planet.invert,
        name: "hi",
        material,
        offset,
        width,
        group,
        scale: terrain.scale,
        radius: planet.planetRadius,
        visible: terrain.visible,
        subdivisions: terrain.subdivisions,
        wireframe: terrain.wireframe,
        colourGenerator: colors,
        heightGenerators: [heights],
        resolution,
      });
    };

    for (let key in difference) {
      const { x, y, z } = difference[key].position as THREE.Vector3;

      const offset = new THREE.Vector3(x, y, z);

      newTerrainChunks[key] = {
        position: new THREE.Vector3(x, z),
        chunk: createTerrainChunk(
          difference[key].group,
          offset,
          difference[key].size,
          planet.minCellResolution
        ),
      };
    }

    chunks.current = newTerrainChunks;
    setUpdater(updater + 1);
  });

  return (
    <group ref={rootGroupRef}>
      {[...new Array(6)].fill(0).map((val, index) => {
        return (
          <group key={`group.${index}`} frustumCulled={false}>
            {/* {Object.values(chunks.current).map((entry, chunkIndex) => {
              return (
                <primitive
                  key={`group.${index}.${chunkIndex}`}
                  object={entry.chunk.plane}
                />
              );
            })} */}
          </group>
        );
      })}
    </group>
  );
};

export default Planet;
