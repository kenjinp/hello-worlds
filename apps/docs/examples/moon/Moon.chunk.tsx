import { PlanetChunks, usePlanet } from "@hello-worlds/react"
import { FC, useRef } from "react"

import { useHelper } from "@react-three/drei"
import { Mesh } from "three"
import { MeshBVHVisualizer } from "three-mesh-bvh"
import { DebugRayCast } from "./DebugRaycaster"

const BoundingTreeChunkVisualizer: FC<{ mesh: Mesh }> = ({ mesh }) => {
  const meshRef = useRef(mesh)

  useHelper(meshRef, MeshBVHVisualizer)
  return null
}

export const MoonChunk: FC = () => {
  const planet = usePlanet()
  return (
    <>
      <DebugRayCast grp={planet} />
      <PlanetChunks>
        {chunk => {
          // TODO:
          // defensive programming
          // the chunk to be created before the geometry
          // TODO: add new event in terrain Chunk for when the geometry actually exists
          const indices = chunk.geometry.getIndex()
          if (!indices?.count) {
            return null
          }

          // change layer to 1 for raycasting
          chunk.layers.enable(1)
          return <BoundingTreeChunkVisualizer mesh={chunk} />
        }}
      </PlanetChunks>
    </>
  )
}
