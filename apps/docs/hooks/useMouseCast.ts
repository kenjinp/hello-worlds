import { usePlanet } from "@hello-worlds/react"
import { useFrame, useThree } from "@react-three/fiber"
import React, { useRef, useState } from "react"
import { Raycaster, Vector2, Vector3 } from "three"

export function useMouseCastToPlanetSurface() {
  const planet = usePlanet()
  const [raycaster] = useState(new Raycaster())
  const [mousePos] = useState(new Vector2())
  const [tempVector3] = useState(new Vector3())
  const useHitPositionRef = useRef<Vector3 | null>(null)
  const camera = useThree(s => s.camera)

  useFrame(() => {
    raycaster.setFromCamera(mousePos, camera)
    raycaster.firstHitOnly = true
    raycaster.layers.set(1)
    const res = raycaster.intersectObjects(planet.children)
    if (res.length) {
      tempVector3.copy(res[0].point)
      useHitPositionRef.current = tempVector3
    } else {
      useHitPositionRef.current = null
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

  return function getHitPoint(): Vector3 | null {
    return useHitPositionRef.current
  }
}
