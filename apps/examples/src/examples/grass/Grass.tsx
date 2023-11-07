import { useFrame } from "@react-three/fiber"
import { DoubleSide, Mesh, RawShaderMaterial, ShaderMaterial } from "three"

import { randomRange } from "@hello-worlds/core"
import { FC, useMemo, useRef } from "react"
import { frag, vert } from "./Grass.shaders"

function createGrassPatchOffsets(
  totalGrassBlades: number,
  grassPatchSideLength: number,
  jitter: number,
) {
  const absJitter = Math.abs(jitter)
  const offsets: number[] = []
  const numGrassBladesPerSide = Math.sqrt(totalGrassBlades)
  for (let i = 0; i < numGrassBladesPerSide; i++) {
    const x = i / numGrassBladesPerSide - 0.5
    for (let j = 0; j < numGrassBladesPerSide; j++) {
      const y = j / numGrassBladesPerSide - 0.5
      offsets.push(
        x * grassPatchSideLength +
          (jitter > 0 ? randomRange(-absJitter, absJitter) : 0),
        0,
        y * grassPatchSideLength +
          (jitter > 0 ? randomRange(-absJitter, absJitter) : 0),
      )
    }
  }
  return new Float32Array(offsets)
}

// TODO: Taper vertices
function createGrassGeometryPositions(
  fullHeight: number,
  width: number,
  numSteps: number,
  topProportion: number,
) {
  let halfWidth = width * 0.5
  const tipHeight = fullHeight * topProportion
  const bodyHeight = fullHeight - tipHeight
  const stepHeight = bodyHeight / numSteps
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
  return new Float32Array(positions)
}

function createGrassColors(totalGrassBlades: number) {
  const colors: number[] = []
  for (let i = 0; i < totalGrassBlades; i++) {
    colors.push(
      randomRange(0, 0.2),
      randomRange(0.75, 1),
      randomRange(0, 0.2),
      1.0,
    )
  }
  return new Float32Array(colors)
}

export interface GrassProps {
  totalGrassBlades: number
  grassPatchSideLength: number
  grassHeight: number
  grassWidth: number
  grassGridJitter: number
  grassTipProportion: number
  numGrassSteps: number
}

export const Grass: FC<GrassProps> = props => {
  const {
    totalGrassBlades = 2048,
    grassPatchSideLength = 16,
    grassGridJitter = 0.2,
    grassHeight = 1.5,
    grassWidth = 0.05,
    grassTipProportion = 0.25,
    numGrassSteps = 4,
  } = props
  const ref = useRef<Mesh>(null)

  // generate a single grass blade geometry to copy
  const positions = useMemo(
    () =>
      createGrassGeometryPositions(
        grassHeight,
        grassWidth,
        numGrassSteps,
        grassTipProportion,
      ),
    [grassHeight, grassWidth, numGrassSteps, grassTipProportion],
  )

  // generate all the positions where to place the geometry
  const offsets = useMemo(
    () =>
      createGrassPatchOffsets(
        totalGrassBlades,
        grassPatchSideLength,
        grassGridJitter,
      ),
    [totalGrassBlades, grassPatchSideLength, grassGridJitter],
  )

  // should each grass blade be a different color?
  const colors = useMemo(
    () => createGrassColors(totalGrassBlades),
    [totalGrassBlades],
  )

  const material = useMemo(
    () =>
      new RawShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        side: DoubleSide,
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
        },
      }),
    [],
  )

  useFrame(state => {
    if (!ref.current) {
      return
    }
    const c = state.clock.getElapsedTime()
    ;(ref.current.material as ShaderMaterial).uniforms.uTime.value = c
  })

  return (
    <mesh ref={ref} key={JSON.stringify(props)} material={material}>
      <instancedBufferGeometry instanceCount={totalGrassBlades}>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
        <instancedBufferAttribute
          attach="attributes-color"
          array={colors}
          count={colors.length / 4}
          itemSize={4}
        />
        <instancedBufferAttribute
          attach="attributes-offset"
          array={offsets}
          count={offsets.length / 3}
          itemSize={3}
        />
        <instancedBufferAttribute
          attach="attributes-maxHeight"
          array={new Float32Array(totalGrassBlades).fill(grassHeight)}
          count={totalGrassBlades}
          itemSize={1}
        />
        {/* TODO */}
        <instancedBufferAttribute
          attach="attributes-up"
          array={offsets}
          count={offsets.length / 3}
          itemSize={3}
        />
      </instancedBufferGeometry>
    </mesh>
  )
}
