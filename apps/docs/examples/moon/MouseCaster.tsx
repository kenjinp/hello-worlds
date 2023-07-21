import { usePlanet } from "@hello-worlds/react"
import { useFrame, useThree } from "@react-three/fiber"
import React, { FC, useRef, useState } from "react"
import { Matrix4, Mesh, Raycaster, Vector2, Vector3 } from "three"

const invMat = new Matrix4()
const origVec = new Vector3()
export const MouseCaster: FC = () => {
  const meshRef = useRef<Mesh>(null)
  const planet = usePlanet()
  const [raycaster] = useState(new Raycaster())
  const [mousePos] = useState(new Vector2())
  const camera = useThree(s => s.camera)

  useFrame(() => {
    raycaster.setFromCamera(mousePos, camera)

    let hit
    for (let chunk of planet.chunks) {
      invMat.copy(chunk.matrixWorld).invert()

      // raycasting
      // ensure the ray is in the local space of the geometry being cast against
      raycaster.ray.applyMatrix4(invMat)
      let currentHit = chunk.geometry.boundsTree?.raycastFirst(
        raycaster.ray,
        chunk.material,
      )
      if (currentHit) {
        currentHit.point.applyMatrix4(chunk.matrixWorld)
        if (hit && currentHit.distance < hit.distance) {
          hit = currentHit
        }
        if (!hit) {
          hit = currentHit
        }
      }
    }
    if (hit) {
      meshRef.current.position.copy(hit.point)
      meshRef.current.visible = true
    } else {
      meshRef.current.visible = false
      console.warn("no camera hit")
    }
  })

  React.useEffect(() => {
    function onMouseMove(event) {
      // calculate mouse position in normalized device coordinates
      // (-1 to +1) for both components
      mousePos.x = (event.clientX / window.innerWidth) * 2 - 1
      mousePos.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    window.addEventListener("mousemove", onMouseMove, false)
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
    }
  })

  return (
    <mesh ref={meshRef} visible={false}>
      <sphereGeometry args={[10, 20, 20]} />
      <meshBasicMaterial color={"purple"} />
    </mesh>
  )
}
