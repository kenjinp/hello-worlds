import { useFrame, useThree } from "@react-three/fiber"
import * as React from "react"
import { Group, Vector3 } from "three"

export const FloatingOriginScene: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const groupRef = React.useRef<Group>(null)
  const { camera } = useThree()
  const origin = React.useRef<Vector3>(camera.position.clone())

  // React.useEffect(() => {
  //   if (groupRef.current) {
  //     origin.current.copy(camera.position.clone());
  //   }
  // }, [groupRef.current]);

  useFrame(() => {
    if (!groupRef.current) {
      return
    }
    groupRef.current.position.copy(origin.current)
    groupRef.current.position.sub(camera.position)
    // state.scene.userData.diff = groupRef.current.position;
    // state.scene.userData.camera = camera.position;
    // state.scene.userData.origin = origin.current;
  })

  return (
    <group ref={groupRef}>
      {/* <PerspectiveCamera
        makeDefault
        name="floating-origin"
        position={new Vector3(0, 0, 0)}
      /> */}
      {children}
    </group>
  )
}
