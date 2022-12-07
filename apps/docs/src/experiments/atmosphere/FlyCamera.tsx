import { FlyControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useEntities } from "miniplex/react"
import * as React from "react"
import "react-toastify/dist/ReactToastify.css"
import { Group, MathUtils, Vector3 } from "three"
import { FlyControls as FlyControlsImpl } from "three-stdlib"
import {
  archetypes,
  PlanetProperties,
} from "../../components/world-builder/WorldBuilder.state"

const FlyCamera: React.FC<{
  minSpeed?: number
  maxSpeed?: number
}> = ({ minSpeed = 100, maxSpeed = 100_000_000_000 }) => {
  const flyControls = React.useRef<FlyControlsImpl>(null)
  const groupRef = React.useRef<Group>(null)
  const altitude = React.useRef(0)
  const { entities } = useEntities(archetypes.planetOrMoon)

  const { camera } = useThree()
  const [_closestPlanet, setClosestPlanet] =
    React.useState<PlanetProperties>(null)

  React.useEffect(() => {
    const closestPlanet = entities.sort((a, b) => {
      return (
        camera.position.distanceToSquared(a.position) -
        camera.position.distanceToSquared(b.position)
      )
    })[0]
    setClosestPlanet(closestPlanet)
    camera.position.copy(
      new Vector3(closestPlanet.radius * 3, 0, closestPlanet.radius * 3),
    )
    camera.lookAt(closestPlanet.position)
  }, [entities])

  React.useEffect(() => {
    if (!_closestPlanet?.name) {
      return
    }
    entities.forEach(entity => {
      if (entity) {
        entity.focused = false
      }
    })
    _closestPlanet.focused = true
  }, [_closestPlanet])

  useFrame((_, deltaTime) => {
    const newClosestPlanet = entities.sort((a, b) => {
      return (
        camera.position.distanceToSquared(a.position) -
        camera.position.distanceToSquared(b.position)
      )
    })[0]
    if (!newClosestPlanet) {
      return
    }
    if (newClosestPlanet.id !== _closestPlanet?.id) {
      setClosestPlanet(newClosestPlanet)
    }
    const closestPlanet = newClosestPlanet
    if (!closestPlanet) {
      return
    }

    altitude.current =
      camera.position.distanceTo(closestPlanet.position) -
        closestPlanet.radius || 0

    flyControls.current.movementSpeed = MathUtils.clamp(
      Math.abs(altitude.current),
      minSpeed,
      maxSpeed,
    )
    groupRef.current.position.copy(camera.position)
    groupRef.current.quaternion.copy(camera.quaternion)
  })

  return (
    <>
      <FlyControls ref={flyControls} rollSpeed={0.25} />
      <group ref={groupRef}>
        <mesh position={new Vector3(0, 0, 10)} castShadow receiveShadow>
          <capsuleGeometry args={[0.75, 1]} />
          <meshStandardMaterial color="pink" />
        </mesh>
      </group>
    </>
  )
}

export default FlyCamera
