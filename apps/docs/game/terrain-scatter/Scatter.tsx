import { CorrectedChunkTranslation } from "@game/render/Planets"
import { Chunk } from "@hello-worlds/planets"
import { PlanetChunks, usePlanet } from "@hello-worlds/react"
import { useLayoutEffect, useState } from "react"
import { Color, InstancedMesh, MathUtils, Object3D, Vector3 } from "three"
import { MeshSurfaceSampler } from "three-stdlib"

function TerrainSampler({ chunk, color }: { chunk: Chunk; color: Color }) {
  return (
    <CorrectedChunkTranslation chunk={chunk}>
      <bufferGeometry attach="geometry" {...chunk.geometry} />
      <meshBasicMaterial wireframe color="red" />
    </CorrectedChunkTranslation>
  )
}

const tempColor = new Color()
export function TerrainScatter() {
  return (
    <>
      <PlanetChunks>
        {chunk => {
          tempColor.set(Math.random() * 0xffffff)
          return chunk && chunk.geometry.getAttribute("position") ? (
            <TerrainSampler key={chunk.id} chunk={chunk} color={tempColor} />
          ) : null
        }}
      </PlanetChunks>
    </>
  )
}

export interface ChunkScatterProps {
  chunk: Chunk
  instancedMesh?: InstancedMesh
}
// const rot = new Euler().setFromVector3(new Vector3(-Math.PI / 2, 0, 0))
export function ChunkScatterer({ chunk, instancedMesh }: ChunkScatterProps) {
  const planet = usePlanet()
  const [sampler] = useState(() => {
    const sampler = new MeshSurfaceSampler(chunk)
    sampler.build()
    // sampler.setRandomGenerator(() => MathUtils.seededRandom())
    return sampler
  })

  useLayoutEffect(() => {
    if (!instancedMesh) return
    const _position = new Vector3()
    const _tempObject = new Object3D()
    const count = MathUtils.clamp(chunk.width / 2, 0, 20_000)

    // Sample randomly from the surface, creating an instance of the sample
    // geometry at each sample point.
    for (let i = 0; i < count; i++) {
      sampler.sample(_position)
      _tempObject.position.copy(_position)
      _tempObject.lookAt(planet.position)

      // Rotate the sample geometry to face the surface normal.
      // _tempObject.rotation.copy(rot)
      _tempObject.updateMatrix()

      instancedMesh.setMatrixAt(i, _tempObject.matrix)
      instancedMesh.instanceMatrix.needsUpdate = true
    }
  }, [sampler, planet, instancedMesh])

  return null
}

export function ScatteringAsset() {
  // Global Limit
  //
}
