import { FlatWorld as HelloFlatWorld } from "@hello-worlds/planets"
import { FlatWorld } from "@hello-worlds/react"
import { useFrame, useThree } from "@react-three/fiber"
import {
  DoubleSide,
  Euler,
  Float32BufferAttribute,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  RawShaderMaterial,
  Vector3,
} from "three"

import { randomRange } from "@hello-worlds/core"
import { useEffect, useRef, useState } from "react"
import Worker from "./Grass.worker?worker"

const GRASS_BLADES = 1024 * 5
const NUM_GRASS_X = Math.sqrt(GRASS_BLADES)
const NUM_GRASS_Y = NUM_GRASS_X
const GRASS_HEIGHT = 5
const GRASS_WIDTH = 0.25
const GRASS_TIP_PROPORTION = 0.25

const GRASS_BLADES_VERTICES = 15
const GRASS_TILE_SIZE = 64
// const VERTICES = GRASS_BLADES_PER_TILE * 3

function createTileGeometry() {
  const offsets: number[] = []
  // offsets = []
  for (let i = 0; i < NUM_GRASS_X; ++i) {
    const x = i / NUM_GRASS_Y - 0.5
    for (let j = 0; j < NUM_GRASS_Y; ++j) {
      const y = j / NUM_GRASS_X - 0.5
      offsets.push(x * GRASS_TILE_SIZE + randomRange(-0.2, 0.2))
      offsets.push(0)
      offsets.push(y * GRASS_TILE_SIZE + randomRange(-0.2, 0.2))
    }
  }

  const offsetsData = offsets //offsets.map(DataUtils.toHalfFloat)
  console.log({ offsetsData })

  // const vertId = new Uint8Array(GRASS_BLADES_VERTICES)
  // for (let i = 0; i < VERTICES; i++) {
  //   vertId[i] = i
  // }

  // TODO: Taper vertices
  function createGrassGeometry(
    fullHeight: number,
    width: number,
    numSteps: number,
    topProportion: number,
  ) {
    let halfWidth = width * 0.5

    const tipHeight = fullHeight * topProportion

    const bodyHeight = fullHeight - tipHeight
    const stepHeight = bodyHeight / numSteps

    console.log(tipHeight + bodyHeight)
    console.log(`height: ${fullHeight}`)
    const positions = []
    for (let i = 0; i < numSteps; i++) {
      const j = i + 1
      positions.push(-halfWidth, j * stepHeight, 0)
      positions.push(halfWidth, j * stepHeight, 0)
      positions.push(halfWidth, i * stepHeight, 0)

      positions.push(-halfWidth, j * stepHeight, 0)
      positions.push(halfWidth, i * stepHeight, 0)
      positions.push(-halfWidth, i * stepHeight, 0)
    }

    positions.push(-halfWidth, numSteps * stepHeight, 0)
    positions.push(0, bodyHeight + tipHeight, 0)
    positions.push(halfWidth, numSteps * stepHeight, 0)

    return positions
  }

  const colors = []
  const upVectors = []
  // const c = [
  //   randomRange(0, 0.2),
  //   randomRange(0.75, 1),
  //   randomRange(0, 0.2),
  //   1.0,
  // ]
  for (let i = 0; i < GRASS_BLADES; i++) {
    colors.push(
      randomRange(0, 0.2),
      randomRange(0.75, 1),
      randomRange(0, 0.2),
      1.0,
    )

    // TODO: Calculator what is up
    upVectors.push(0, 1, 0)
  }

  // const pos = new Float32Array()
  // pos.set(offsetsData, 3)

  const geo = new InstancedBufferGeometry()
  geo.instanceCount = GRASS_BLADES
  // geo.setAttribute("vertIndex", new Uint8BufferAttribute(vertId, 1))
  const positions = createGrassGeometry(
    GRASS_HEIGHT,
    GRASS_WIDTH,
    4,
    GRASS_TIP_PROPORTION,
  )
  console.log({ positions })

  geo.setAttribute("position", new Float32BufferAttribute(positions, 3))
  geo.setAttribute(
    "offset",
    new InstancedBufferAttribute(new Float32Array(offsets), 3),
  )
  geo.setAttribute(
    "maxHeight",
    new InstancedBufferAttribute(
      new Float32Array(GRASS_BLADES).fill(GRASS_HEIGHT),
      1,
    ),
  )
  geo.setAttribute(
    "up",
    new InstancedBufferAttribute(new Float32Array(offsets), 3),
  )
  geo.setAttribute(
    "color",
    new InstancedBufferAttribute(new Float32Array(colors), 4),
  )

  // const material = new MeshBasicMaterial({
  //   vertexColors: true,
  //   side: DoubleSide,
  // })

  const vertexShader = `
  precision highp float;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;

  uniform float time;

  attribute vec3 position;
  attribute vec3 offset;
  attribute vec4 color;
  attribute vec3 up;
  attribute float maxHeight;

  varying vec4 vColor;

  mat3 rotation3dY(float angle) {
    float s = sin(angle);
    float c = cos(angle);
  
    return mat3(
      c, 0.0, -s,
      0.0, 1.0, 0.0,
      s, 0.0, c
    );
  }

  mat3 rotation3dX(float angle) {
    float s = sin(angle);
    float c = cos(angle);
  
    return mat3(
      1.0, 0.0, 0.0,
      0.0, c, s,
      0.0, -s, c
    );
  }

  vec3 rotateX(vec3 v, float angle) {
    return rotation3dX(angle) * v;
  }

  vec3 rotateY(vec3 v, float angle) {
    return rotation3dY(angle) * v;
  }

  float hash(float n) { return fract(sin(n) * 1e4); }
  float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

  void main() { 
    vColor = color;

    float perBladeHash = hash(offset.xy);

    // TODO towards up vector
    float heightPercentTowardsUpVector = position.y / maxHeight;
    float curveAmount = heightPercentTowardsUpVector * perBladeHash;
    mat3 grassMat = rotation3dX(curveAmount);
    vec3 grassVertexPosition = grassMat * vec3(position.xy, 0.0);
    
    float randomAngle = perBladeHash * 2.0 * 3.14159 * time;
    vec3 newPostion = grassVertexPosition;

    vec3 rotatedPosition = rotateY(newPostion, randomAngle);
  
    gl_Position = projectionMatrix * modelViewMatrix * vec4( rotatedPosition + offset, 1.0 );
  }
  `

  const fragmentShader = `
    precision highp float;
    varying vec4 vColor;

    void main() {
      gl_FragColor = vColor;
    }
  `
  const material = new RawShaderMaterial({
    uniforms: {
      time: { value: 1.0 },
      sineTime: { value: 1.0 },
    },
    vertexShader,
    fragmentShader,
    side: DoubleSide,
    // forceSinglePass: true,
    transparent: true,
  })

  const mesh = new Mesh(geo, material)

  // geo.setIndex(CreateIndexBuffer())
  return mesh
}

const worker = () => new Worker()
export default () => {
  const controls = useThree(state => state.controls)
  const camera = useThree(state => state.camera)
  const scene = useThree(state => state.scene)
  const flatWorld = useRef<HelloFlatWorld<any>>(null)

  // camera.position.set(-809.4739943418741, 739.46933062522, 651.9329496161308)

  const [grass, setGrass] = useState<Mesh>(() => {
    return createTileGeometry()
  })

  useEffect(() => {
    const onEnterPress = e => {
      if (e.key !== "Enter") return
      setGrass(createTileGeometry())
    }

    window.addEventListener("keydown", onEnterPress)
    return () => window.removeEventListener("keydown", onEnterPress)
  }, [])

  useFrame(state => {
    const c = state.clock.getElapsedTime()
    grass.material.uniforms.time.value = c
  })

  return (
    <>
      <primitive object={grass} />
      <group
        visible={false}
        // Rotate World so it's along the x axis
        rotation={new Euler().setFromVector3(new Vector3(-Math.PI / 2, 0, 0))}
      >
        <FlatWorld
          ref={flatWorld}
          size={1_000}
          minCellSize={32}
          minCellResolution={32 * 2}
          lodOrigin={camera.position}
          worker={worker}
          data={{
            seed: "Basic Example",
          }}
        >
          <meshStandardMaterial vertexColors side={DoubleSide} />
        </FlatWorld>
      </group>
    </>
  )
}
