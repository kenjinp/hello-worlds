import { useFrame } from "@react-three/fiber"
import {
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  Texture,
  Vector3,
} from "three"

import { randomRange } from "@hello-worlds/core"
import { FC, useEffect, useMemo, useRef } from "react"
import CustomShaderMaterial from "three-custom-shader-material/vanilla"
import { MeshSurfaceSampler } from "three-stdlib"
import { frag, vert } from "./Grass.shaders"

function createGrassPatchOffsets(
  totalGrassBlades: number,
  grassPatchSideLength: number,
  jitter: number,
) {
  const absJitter = Math.abs(jitter)
  const offsets: number[] = []
  const grassUVs: number[] = []
  const numGrassBladesPerSide = Math.sqrt(totalGrassBlades)
  for (let i = 0; i < numGrassBladesPerSide; i++) {
    const x = i / numGrassBladesPerSide - 0.5
    for (let j = 0; j < numGrassBladesPerSide; j++) {
      const y = j / numGrassBladesPerSide - 0.5
      const u = 1 - i / numGrassBladesPerSide
      const v = j / numGrassBladesPerSide
      grassUVs.push(u, v)

      offsets.push(
        x * grassPatchSideLength +
          (jitter > 0 ? randomRange(-absJitter, absJitter) : 0),
        0,
        y * grassPatchSideLength +
          (jitter > 0 ? randomRange(-absJitter, absJitter) : 0),
      )
    }
  }
  return [new Float32Array(offsets), new Float32Array(grassUVs)]
}

function createGrassPatchOffsetWithChunkSample(
  totalGrassBlades: number,
  sampler: MeshSurfaceSampler,
) {
  const _position = new Vector3()
  const offsets: number[] = []
  for (let i = 0; i < totalGrassBlades; i++) {
    sampler.sample(_position)
    offsets.push(_position.x, _position.y, _position.z)
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
  const color = new Color()
  for (let i = 0; i < totalGrassBlades; i++) {
    color.setHSL(randomRange(0.0, 0.3), 1.0, 0.5)
    // colors.push(
    //   randomRange(0, 0.2),
    //   randomRange(0.75, 1),
    //   randomRange(0, 0.2),
    //   1.0,
    // )
    colors.push(color.r, color.g, color.b, 1.0)
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
  heightmap?: Texture
  minHeight?: number
  maxHeight?: number
}

export const Grass: FC<GrassProps> = props => {
  console.log("grass rerender")
  // const [normalMap, map] = useTexture(["/normal.png", "/grass.png"])
  const {
    totalGrassBlades = 2048,
    grassPatchSideLength = 16,
    grassGridJitter = 0.2,
    grassHeight = 1.5,
    grassWidth = 0.05,
    grassTipProportion = 0.25,
    numGrassSteps = 4,
    heightmap,
    minHeight,
    maxHeight,
  } = props
  // const sampler = useMemo<MeshSurfaceSampler | null>(() => {
  //   if (meshSurface) {
  //     const sampler = new MeshSurfaceSampler(meshSurface)
  //     sampler.build()
  //     sampler.setRandomGenerator(() => seededRandom(0xfff))
  //     return sampler
  //   }
  //   return null
  // }, [meshSurface])
  const mesh = useRef<Mesh>(null)
  // const material = useRef<CustomShaderMaterial | null>(null)

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
  const [offsets, grassUvs] = useMemo(() => {
    // if (sampler) {
    //   return createGrassPatchOffsetWithChunkSample(totalGrassBlades, sampler)
    // }
    return createGrassPatchOffsets(
      totalGrassBlades,
      grassPatchSideLength,
      grassGridJitter,
    )
  }, [
    totalGrassBlades,
    grassPatchSideLength,
    grassGridJitter,
    // sampler
  ])

  // should each grass blade be a different color?
  const colors = useMemo(
    () => createGrassColors(totalGrassBlades),
    [totalGrassBlades],
  )

  const material = useMemo(() => {
    const mat = new CustomShaderMaterial({
      baseMaterial: MeshBasicMaterial,
      vertexShader: vert,
      fragmentShader: frag,
      side: DoubleSide,
      uniforms: {
        offsetHeight: {
          value: !!heightmap ? 1 : 0,
        },
        uHeightmap: {
          value: heightmap,
        },
        uMinHeight: {
          value: minHeight,
        },
        uMaxHeight: {
          value: maxHeight,
        },
        uTime: { value: 0 },
        uGrassWidth: { value: grassWidth },
      },
    })
    // if (heightmap) {
    //   heightmap.needsUpdate = true
    // }
    mat.needsUpdate = true
    return mat
  }, [grassWidth, heightmap, minHeight, maxHeight])

  useFrame(state => {
    if (!material) {
      return
    }
    const elapsedTime = state.clock.getElapsedTime()
    material.uniforms.uTime.value = elapsedTime
  })

  const key = JSON.stringify(props)

  useEffect(() => {
    if (!mesh.current) {
      return
    }
    // We need normals!
    mesh.current.matrixWorldNeedsUpdate = true
    mesh.current.geometry.computeVertexNormals()
  }, [key])

  return (
    // TODO fix frustrum culling
    <mesh ref={mesh} key={key} material={material} frustumCulled={false}>
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
          attach="attributes-grassUvs"
          array={grassUvs}
          count={grassUvs.length / 2}
          itemSize={2}
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
