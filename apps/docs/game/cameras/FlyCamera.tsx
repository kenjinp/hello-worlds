import { archetypes, PlanetProperties } from "@game/Entity"
import { FlyControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useEntities } from "miniplex/react"
import { useRouter } from "next/router"
import * as React from "react"
import { Group, MathUtils, Vector3 } from "three"
import { FlyControls as FlyControlsImpl } from "three-stdlib"

let lastTime = 0

const FlyCamera: React.FC<{
  minSpeed?: number
  maxSpeed?: number
}> = ({ minSpeed = 100, maxSpeed = 100_000_000_000 }) => {
  const router = useRouter()

  const flyControls = React.useRef<FlyControlsImpl>(null)
  const groupRef = React.useRef<Group>(null)
  const altitude = React.useRef(0)
  const { entities } = useEntities(archetypes.planetOrMoon)

  const { camera } = useThree()
  const [_closestPlanet, setClosestPlanet] =
    React.useState<PlanetProperties>(null)

  const [pause, setPause] = React.useState(false)

  // sync camera position with url params at start
  // React.useEffect(() => {
  //   console.log("camera sync first")
  //   const query = router.query
  //   if (query.translation) {
  //     const { rotation, position } = JSON.parse(
  //       atob(query.translation as string),
  //     )
  //     console.log({ rotation, position })
  //     camera.position.set(position.x, position.y, position.z)
  //     camera.rotation.setFromQuaternion(rotation)
  //   }
  // }, [camera])

  React.useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "p") {
        setPause(!pause)
      }
    }
    document.body.addEventListener("keyup", listener)
    return () => {
      document.body.removeEventListener("keyup", listener)
    }
  }, [pause])

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

    console.log("camera sync first")
    const query = router.query
    if (query.translation) {
      const { rotation, position } = JSON.parse(
        atob(query.translation as string),
      )
      console.log({ rotation, position })
      camera.position.set(position.x, position.y, position.z)
      camera.rotation.setFromQuaternion(rotation)
    }
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

  useFrame(({ clock }, deltaTime) => {
    if (!flyControls.current) {
      return
    }
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

    // update url params
    const translation = {
      rotation: camera.quaternion,
      position: camera.position,
    }

    if (clock.getElapsedTime() - lastTime >= 0.5) {
      router.replace(
        {
          pathname: router.pathname,
          query: {
            ...router.query,
            translation: btoa(JSON.stringify(translation)),
          },
        },
        undefined,
        { shallow: true },
      )

      lastTime = clock.getElapsedTime()
    }


    // const newUrl = new URL(window.location.href)
    // newUrl.searchParams.append("translation", btoa(JSON.stringify(translation)))

    // window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
  })

  return (
    <>
      {!pause && <FlyControls ref={flyControls} rollSpeed={0.25} />}
      <group ref={groupRef}>
        {/* <mesh position={new Vector3(0, 0, -20)} castShadow receiveShadow>
          <capsuleGeometry args={[0.75, 1]} />
          <meshStandardMaterial color="pink" />
        </mesh> */}
      </group>
    </>
  )
}

export default FlyCamera
