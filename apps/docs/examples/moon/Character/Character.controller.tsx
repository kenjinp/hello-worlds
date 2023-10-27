import { Controls } from "@game/player/KeyboardController"
import { usePlanet } from "@hello-worlds/react"
import { useGetExactPlanetaryElevation } from "@hooks/useGetExactPlanetaryElevation"
import { OrbitControls, useKeyboardControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useControls } from "leva"
import { FC, PropsWithChildren, useEffect, useRef, useState } from "react"
import {
  Box3,
  Euler,
  Group,
  Line3,
  Matrix4,
  Mesh,
  Raycaster,
  Vector3,
} from "three"
import { OrbitControls as OrbitControlsImpl } from "three-stdlib"

export const CharacterController: FC<
  PropsWithChildren<{
    initialPosition?: Vector3
    characterDimensionHeight?: number
    characterDimensionRadius?: number
  }>
> = ({
  children,
  initialPosition,
  characterDimensionHeight = 1.8,
  characterDimensionRadius = 0.5,
}) => {
  const {
    gravity,
    playerSpeed,
    physicsSteps,
    firstPerson,
    fudgeRoom,
    groundCheckDist,
    jumpScale,
  } = useControls({
    gravity: -9 / 3,
    playerSpeed: 10,
    physicsSteps: 5,
    firstPerson: false,
    jumpScale: 10,
    fudgeRoom: 1,
    groundCheckDist: 1,
  })

  const planet = usePlanet()

  const [ready, setReady] = useState(false)
  const [playerVelocity] = useState(new Vector3())
  const [gravityVector] = useState(new Vector3())
  const [gravityDir] = useState(new Vector3())
  const [upVector] = useState(new Vector3())
  const [movementVector] = useState(new Vector3())
  const [tempBox] = useState(new Box3())
  const [tempVector] = useState(new Vector3())
  const [tempVector2] = useState(new Vector3())
  const [tempMat] = useState(new Matrix4())
  const [tempSegment] = useState(new Line3())
  const [subscribeKeys, getKeys] = useKeyboardControls()
  const [raycaster] = useState(new Raycaster())
  const camera = useThree(s => s.camera)
  const scene = useThree(s => s.scene)
  const orbitControlsRef = useRef<OrbitControlsImpl>(null)
  const characterModelRef = useRef<Group>(null)
  const characterCapsuleRef = useRef<Group>(null)
  const raycastRef = useRef<Mesh>(null)
  const playerIsOnGroundRef = useRef(true)
  const getExactPlanetElevationAtPosition = useGetExactPlanetaryElevation()

  const [capsuleInfo] = useState({
    radius: 0.5,
    segment: new Line3(new Vector3(), new Vector3(0, -1.0, 0.0)),
  })

  const characterDimensions = {
    height: characterDimensionHeight,
    radius: characterDimensionRadius,
  }
  const characterCapsuleLength =
    characterDimensions.height - characterDimensions.radius * 2

  function computePlanetVectors() {
    const player = characterModelRef.current
    gravityDir.copy(planet.position).sub(player.position).normalize().negate()

    gravityVector.copy(gravityDir).multiplyScalar(gravity)

    upVector.copy(gravityDir).negate()
  }

  function groundCheck() {
    if (!characterModelRef.current) {
      return
    }
    raycastRef.current.getWorldPosition(tempVector)
    const dirToPlanet = tempVector2
      .copy(tempVector)
      .sub(planet.position)
      .normalize()

    const origin = tempVector
    const rayDir = dirToPlanet.negate()
    raycaster.layers.set(1)
    raycaster.set(origin, rayDir)
    const intersects = raycaster.intersectObjects(scene.children)

    return !!intersects.length && intersects[0].distance < groundCheckDist
  }

  function placeCharacterOnPlanetFromNoise() {
    if (!characterModelRef.current) {
      throw new Error("I'm not sure what happened, no character")
    }
    // get current position
    const position = characterModelRef.current.position.copy(initialPosition)
    // get direction (normalized vector) from core to character
    // then multiply it by distance
    const e = getExactPlanetElevationAtPosition(position)
    if (!e) {
      return
    }
    const playerAltitude = e.elevation + characterDimensions.height / 2
    const dirToPlayer = position.sub(planet.position).normalize()
    const playerHeightFromCore = planet.radius + playerAltitude + fudgeRoom
    const playerGroundPosition = dirToPlayer
      .clone()
      .multiplyScalar(playerHeightFromCore)
    characterModelRef.current.position.copy(playerGroundPosition)
  }

  function orientCharacterToPlanetNormal() {
    // orient to normal of planet
    const position = characterModelRef.current.position
    // get direction (normalized vector) from core to character
    // then multiply it by distance
    const dirToPlayer = tempVector
      .copy(position)
      .sub(planet.position)
      .normalize()
    characterModelRef.current.lookAt(planet.position)
    orbitControlsRef.current.target.copy(characterModelRef.current.position)
    camera.up.copy(dirToPlayer)
    orbitControlsRef.current.update()
  }

  function reset() {
    const player = characterModelRef.current
    const controls = orbitControlsRef.current
    const playerIsOnGround = playerIsOnGroundRef.current
    playerVelocity.set(0, 0, 0)
    player.position.copy(initialPosition)
    camera.position.sub(controls.target)
    controls.target.copy(player.position)
    camera.position.add(player.position)
    controls.update()
  }

  function updatePlayer(delta) {
    const player = characterModelRef.current
    const controls = orbitControlsRef.current
    const playerIsOnGround = playerIsOnGroundRef.current
    if (!player || !controls || !ready) {
      return
    }
    computePlanetVectors()

    if (playerIsOnGround) {
      // playerVelocity.copy(gravityDir.multiplyScalar(delta * gravity))
      playerVelocity.set(0, 0, 0)
    } else {
      playerVelocity.add(gravityDir.multiplyScalar(delta * gravity))
    }

    player.position.addScaledVector(playerVelocity, delta)

    const { forward, back, left, right } = getKeys()

    // move the player
    const angle = controls.getAzimuthalAngle()
    if (forward) {
      movementVector.set(0, 0, -1).applyAxisAngle(upVector, angle)
      player.position.addScaledVector(movementVector, playerSpeed * delta)
    }

    if (back) {
      movementVector.set(0, 0, 1).applyAxisAngle(upVector, angle)
      player.position.addScaledVector(movementVector, playerSpeed * delta)
    }

    if (left) {
      movementVector.set(-1, 0, 0).applyAxisAngle(upVector, angle)
      player.position.addScaledVector(movementVector, playerSpeed * delta)
    }

    if (right) {
      movementVector.set(1, 0, 0).applyAxisAngle(upVector, angle)
      player.position.addScaledVector(movementVector, playerSpeed * delta)
    }

    player.updateMatrixWorld()

    for (const chunk of planet.chunks) {
      // adjust player position based on collisions
      tempBox.makeEmpty()
      tempMat.copy(chunk.matrixWorld).invert()
      tempSegment.copy(capsuleInfo.segment)

      // get the position of the capsule in the local space of the collider
      tempSegment.start.applyMatrix4(player.matrixWorld).applyMatrix4(tempMat)
      tempSegment.end.applyMatrix4(player.matrixWorld).applyMatrix4(tempMat)

      // get the axis aligned bounding box of the capsule
      tempBox.expandByPoint(tempSegment.start)
      tempBox.expandByPoint(tempSegment.end)

      tempBox.min.addScalar(-capsuleInfo.radius)
      tempBox.max.addScalar(capsuleInfo.radius)

      chunk.geometry.boundsTree.shapecast({
        intersectsBounds: box => box.intersectsBox(tempBox),

        intersectsTriangle: tri => {
          console.log({ tri })
          // check if the triangle is intersecting the capsule and adjust the
          // capsule position if it is.
          const triPoint = tempVector
          const capsulePoint = tempVector2

          const distance = tri.closestPointToSegment(
            tempSegment,
            triPoint,
            capsulePoint,
          )
          if (distance < capsuleInfo.radius) {
            const depth = capsuleInfo.radius - distance
            const direction = capsulePoint.sub(triPoint).normalize()

            tempSegment.start.addScaledVector(direction, depth)
            tempSegment.end.addScaledVector(direction, depth)
          }
        },
      })
    }

    // get the adjusted position of the capsule collider in world space after checking
    // triangle collisions and moving it. capsuleInfo.segment.start is assumed to be
    // the origin of the player model.
    const newPosition = tempVector
    newPosition.copy(tempSegment.start).applyMatrix4(planet.matrixWorld)

    // check how much the collider was moved
    const deltaVector = tempVector2
    deltaVector.subVectors(newPosition, player.position)

    // if the player was primarily adjusted vertically we assume it's on something we should consider ground
    playerIsOnGroundRef.current = groundCheck()

    const offset = Math.max(0.0, deltaVector.length() - 1e-5)
    deltaVector.normalize().multiplyScalar(offset)

    // adjust the player model
    // player.position.add(deltaVector)

    // if (!playerIsOnGround) {
    //   deltaVector.normalize()
    //   playerVelocity.addScaledVector(
    //     deltaVector,
    //     -deltaVector.dot(playerVelocity),
    //   )
    // } else {
    //   playerVelocity.set(0, 0, 0)
    // }

    // adjust the camera
    camera.position.sub(controls.target)
    controls.target.copy(player.position)
    camera.position.add(player.position)

    // if the player has fallen too far below the level reset their position to the start
    // if (player.position.y < -25) {
    //   reset()
    // }
    orientCharacterToPlanetNormal()
  }

  useEffect(() => {
    placeCharacterOnPlanetFromNoise()
    orientCharacterToPlanetNormal()
    setReady(true)

    return subscribeKeys(
      state => state[Controls.jump],
      pressed => {
        if (!pressed) {
          return
        }
        if (playerIsOnGroundRef.current) {
          // do jump stuff
          computePlanetVectors()
          // TODO might be interesting to use the surface normal for the jump
          playerVelocity.copy(
            // its very interesting that this doesn't have to be negated
            tempVector.copy(gravityDir).multiplyScalar(jumpScale),
          )
          playerIsOnGroundRef.current = false
        }
      },
    )
  }, [getExactPlanetElevationAtPosition, jumpScale])

  // useEffect(() => {
  //   camera.position
  //     .sub(orbitControlsRef.current.target)
  //     .normalize()
  //     .multiplyScalar(10)
  //     .add(orbitControlsRef.current.target)
  // }, [firstPerson])

  useFrame(({ clock }, delta) => {
    const player = characterModelRef.current
    const controls = orbitControlsRef.current
    const playerIsOnGround = playerIsOnGroundRef.current
    if (!controls) {
      return
    }
    // const delta = Math.min(clock.getDelta(), 0.1)

    // camera.up.copy(upVector)

    if (firstPerson) {
      controls.maxPolarAngle = Math.PI
      controls.minDistance = 1e-4
      controls.maxDistance = 1e-4
    } else {
      controls.maxPolarAngle = Math.PI / 2
      controls.minDistance = 1
      controls.maxDistance = 20
    }

    for (let i = 0; i < physicsSteps; i++) {
      updatePlayer(delta / physicsSteps)
    }

    controls.update()
  })

  return (
    <>
      <OrbitControls ref={orbitControlsRef} />
      <group ref={characterModelRef} layers={2}>
        <group
          rotation={new Euler().setFromVector3(new Vector3(-Math.PI / 2, 0, 0))}
        >
          <group ref={characterCapsuleRef} castShadow receiveShadow>
            <mesh position={[0, 0, 0]} ref={raycastRef}>
              <boxGeometry args={[0.1, 0.1, 0.1]} />
            </mesh>
            <mesh>
              <capsuleGeometry
                args={[characterDimensions.radius, characterCapsuleLength]}
              />
              <meshStandardMaterial color="mediumpurple" shadowSide={2} />
            </mesh>
            <mesh position={[0, 0.5, 0.5]}>
              <boxGeometry args={[0.5, 0.2, 0.3]} />
              <meshStandardMaterial color="mediumpurple" />
            </mesh>
          </group>
          {children}
        </group>
      </group>
    </>
  )
}
