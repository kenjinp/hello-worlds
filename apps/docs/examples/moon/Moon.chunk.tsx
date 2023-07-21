import { PlanetChunks, usePlanet } from "@hello-worlds/react"
import { FC, useRef } from "react"

import { useHelper } from "@react-three/drei"
import { useControls } from "leva"
import { Mesh } from "three"
import { MeshBVHVisualizer } from "three-mesh-bvh"

const BoundingTreeChunkVisualizer: FC<{ mesh: Mesh }> = ({ mesh }) => {
  const meshRef = useRef(mesh)

  useHelper(meshRef, MeshBVHVisualizer)
  return null
}

export const MoonChunk: FC = () => {
  const planet = usePlanet()
  const { showBoundingTree } = useControls({
    showBoundingTree: false,
  })
  return (
    <>
      {/* <DebugRayCast grp={planet} /> */}
      <PlanetChunks>
        {chunk => {
          // change layer to 1 for raycasting
          chunk.layers.enable(1)
          return showBoundingTree ? (
            <BoundingTreeChunkVisualizer mesh={chunk} />
          ) : null
        }}
      </PlanetChunks>
    </>
  )
}
