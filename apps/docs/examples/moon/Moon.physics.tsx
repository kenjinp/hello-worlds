import { PlanetChunks } from "@hello-worlds/react"
import { RigidBody, interactionGroups } from "@react-three/rapier"

export const MoonChunkPhysics: React.FC = () => {
  return (
    <PlanetChunks>
      {chunk => {
        // TODO:
        // defensive programming
        // the chunk appears to be created before the geometry
        // probably we should change this hook
        const indices = chunk.geometry.getIndex()
        if (!indices?.count) {
          return null
        }

        return (
          chunk.LODLevel <= 100 && (
            <RigidBody
              key={chunk.uuid}
              type="fixed"
              includeInvisible
              colliders="trimesh"
              restitution={0.2}
              collisionGroups={interactionGroups(0, [5])}
            >
              <mesh geometry={chunk.geometry}>
                <meshBasicMaterial visible={false} />
              </mesh>
            </RigidBody>
          )
        )
      }}
    </PlanetChunks>
  )
}
