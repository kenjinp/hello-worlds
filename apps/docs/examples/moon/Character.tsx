import { usePlanet } from "@hello-worlds/react"
import useFollowCamera from "@hooks/useFollowCamera"
import { useKeyboardControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { FC, useEffect, useMemo, useRef, useState } from "react"
import {
  Euler,
  Group,
  MathUtils,
  Quaternion,
  Raycaster,
  Vector2,
  Vector3,
} from "three"
import { Light } from "./Light"
import { useGetExactPlanetaryElevation } from "./useGetExactPlanetaryElevation"

// steps
// donezo 1. place character model on planet
// donezo 2. orient character upwards
// 3. follow camera - oriented to normal of sphere or character
// 4. forward / backwards walking
// 5. rotation left / right

// DIR is normalized vector
// VEC is un-normalized whole value vector

function computeTangentAndBitangent(normal) {
  // Define a helper vector that is not aligned with the normal
  const helperVec = new Vector3(1, 0, 0)

  // If normal is aligned with helperVec, choose a different helperVec
  if (normal.dot(helperVec) > 0.99) {
    helperVec.set(0, 1, 0)
  }

  // Compute the tangent
  const tangent = new Vector3()
  tangent.crossVectors(helperVec, normal).normalize()

  // Compute the bitangent
  const bitangent = new Vector3()
  bitangent.crossVectors(normal, tangent)

  return {
    tangent,
    bitangent,
  }
}

export interface CharacterCapsuleDimensions {
  height: number
  radius: number
}

const targetPosition = new Vector3()
const tempNormal = new Vector3()
const raycaster = new Raycaster()
const heightOrbitPosition = new Vector3()
export const Character: FC<{
  originalPosition: Vector3
  characterDimensionHeight?: number
  characterDimensionRadius?: number
}> = ({
  originalPosition,
  characterDimensionHeight = 1.8,
  characterDimensionRadius = 0.5,
}) => {
  const characterDimensions = {
    height: characterDimensionHeight,
    radius: characterDimensionRadius,
  }
  const characterCapsuleLength =
    characterDimensions.height - characterDimensions.radius * 2

  const characterModelRef = useRef<Group>(null)
  const characterCapsuleRef = useRef<Group>(null)
  const raycastRef = useRef<Group>(null)
  const planet = usePlanet()
  const { pivot, rotation: followCameraRotation } = useFollowCamera()
  const [, getKeys] = useKeyboardControls()
  const [pivotPosition] = useState(new Vector3())
  const [ready, setReady] = useState(false)
  const modelEuler = useMemo(() => new Euler(), [])
  const camera = useThree(state => state.camera)
  const scene = useThree(state => state.scene)
  const getExactPlanetElevationAtPosition = useGetExactPlanetaryElevation()
  const sprintModifier = useRef(1)
  const modelQuat = useMemo(() => new Quaternion(), [])
  const velocity = useMemo(() => new Vector3(), [])
  const gravity = useMemo(() => new Vector3(), [])
  const jumping = useRef(false)
  const movingDirection = useMemo(() => new Vector3(), [])
  const turnSpeed = 18
  const groundCheckDist = 1

  function groundCheck() {
    if (!characterModelRef.current) {
      return
    }
    raycastRef.current.getWorldPosition(tempNormal)
    const dirToPlanet = targetPosition
      .copy(tempNormal)
      .sub(planet.position)
      .normalize()

    const origin = tempNormal
    const rayDir = dirToPlanet.negate()
    raycaster.layers.set(1)
    raycaster.set(origin, rayDir)
    const intersects = raycaster.intersectObjects(scene.children)

    return !!intersects.length && intersects[0].distance < groundCheckDist
  }

  function updateCameraPosition() {
    /**
     *  Camera movement
     */
    characterCapsuleRef.current.getWorldPosition(pivotPosition)
    pivot.position.lerp(pivotPosition, 0.2)
    camera.lookAt(pivot.position)
  }

  function placeCharacterOnPlanetFromNoise() {
    if (!characterModelRef.current) {
      throw new Error("I'm not sure what happened, no character")
    }
    // get current position
    const position = characterModelRef.current.position
    // get direction (normalized vector) from core to character
    // then multiply it by distance
    const dirToPlayer = position.sub(planet.position).normalize()
    const { elevation } = getExactPlanetElevationAtPosition(position)
    const playerAltitude = elevation
    const playerHeightFromCore = planet.radius + playerAltitude
    const playerGroundPosition = dirToPlayer
      .clone()
      .multiplyScalar(playerHeightFromCore)
    // place character model at core + radius + character height
    characterModelRef.current.position.copy(playerGroundPosition)
  }

  function placeCharacterOnPlanetFromMeshRaycast() {
    if (!characterModelRef.current) {
      return
    }
    const dirToPlanet = targetPosition
      .copy(characterModelRef.current.position)
      .sub(planet.position)
      .normalize()

    heightOrbitPosition.copy(dirToPlanet.multiplyScalar(planet.radius * 2))

    const origin = heightOrbitPosition
    const rayDir = dirToPlanet.negate()
    raycaster.layers.set(1)
    raycaster.set(origin, rayDir)
    const intersects = raycaster.intersectObjects(planet.children)
    if (intersects.length) {
      characterModelRef.current.position.copy(intersects[0].point)
    }
  }

  function orientCharacterToPlanetNormal() {
    // orient to normal of planet
    const position = characterModelRef.current.position
    // get direction (normalized vector) from core to character
    // then multiply it by distance
    const dirToPlayer = targetPosition
      .copy(position)
      .sub(planet.position)
      .normalize()
    characterModelRef.current.lookAt(planet.position)
    pivot.quaternion.copy(characterModelRef.current.quaternion)
    camera.up.copy(dirToPlayer)
  }

  function updateCharacterMovement(delta: number) {
    const { forward, back, left, right, jump, run } = getKeys()
    targetPosition.set(0, 0, 0)
    const movement = new Vector2()
    const movementDistance = 0.5
    const sprintMultiplier = 1.5
    if (forward) {
      movement.x += 1
    }
    if (back) {
      movement.x -= 1
    }
    if (left) {
      movement.y += 1
    }
    if (right) {
      movement.y += 1
    }
    sprintModifier.current = MathUtils.lerp(
      sprintModifier.current,
      run ? sprintMultiplier : 1,
      0.2,
    )

    // getCharacterForwardDir
    characterCapsuleRef.current.getWorldDirection(movingDirection)

    const isGrounded = groundCheck()
    const gravityVelocity = gravity
      .copy(characterModelRef.current.position)
      .sub(planet.position)
      .normalize()
      .multiplyScalar(9.8 * delta)

    if (isGrounded) {
      // get targetPosition
      if (movement.length() && !jump) {
        targetPosition
          .copy(
            movingDirection,
            // Math.abs(movement.x) > 0 ? movingDirection : movingDirection.negate(),
          )
          .multiplyScalar(
            movementDistance * movement.length() * sprintModifier.current,
          )
      }
    }

    if (targetPosition.length()) {
      characterModelRef.current.position.lerp(targetPosition, 0.2)
    }

    isGrounded && placeCharacterOnPlanetFromMeshRaycast()
    orientCharacterToPlanetNormal()
  }

  function updateCharacterRotation(delta: number) {
    /**
     * Getting all the useful keys from useKeyboardControls
     */
    const { forward, back, left, right, jump, run } = getKeys()

    // Getting moving directions
    if (forward) {
      // Apply camera rotation to character model
      modelEuler.y = followCameraRotation.rotation.y
    } else if (back) {
      // Apply camera rotation to character model
      modelEuler.y = followCameraRotation.rotation.y + Math.PI
    } else if (left) {
      // Apply camera rotation to character model
      modelEuler.y = followCameraRotation.rotation.y + Math.PI / 2
    } else if (right) {
      // Apply camera rotation to character model
      modelEuler.y = followCameraRotation.rotation.y - Math.PI / 2
    }
    if (forward && left) {
      // Apply camera rotation to character model
      modelEuler.y = followCameraRotation.rotation.y + Math.PI / 4
    } else if (forward && right) {
      // Apply camera rotation to character model
      modelEuler.y = followCameraRotation.rotation.y - Math.PI / 4
    } else if (back && left) {
      // Apply camera rotation to character model
      modelEuler.y = followCameraRotation.rotation.y - Math.PI / 4 + Math.PI
    } else if (back && right) {
      // Apply camera rotation to character model
      modelEuler.y = followCameraRotation.rotation.y + Math.PI / 4 + Math.PI
    }

    // Rotate character model
    modelQuat.setFromEuler(modelEuler)
    characterCapsuleRef.current.quaternion.rotateTowards(
      modelQuat,
      delta * turnSpeed,
    )
  }

  useFrame((_state, delta) => {
    if (ready) {
      updateCameraPosition()
      updateCharacterRotation(delta)
      updateCharacterMovement(delta)
    }
  })

  useEffect(() => {
    const op = originalPosition.clone()
    characterModelRef.current.position.copy(originalPosition)
    placeCharacterOnPlanetFromNoise()
    orientCharacterToPlanetNormal()
    pivot.position.copy(op)
    // set camera offset
    camera.position.set(0, 0, 0)
    setReady(true)
    return () => {
      camera.position.copy(op)
      camera.lookAt(planet.position)
    }
  }, [])

  return (
    <group ref={characterModelRef} layers={2}>
      <group
        rotation={new Euler().setFromVector3(new Vector3(-Math.PI / 2, 0, 0))}
      >
        <group position={[0, characterDimensionHeight / 2, 0]} ref={raycastRef}>
          <group ref={characterCapsuleRef}>
            <Light />
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.1, 0.1, 0.1]} />
            </mesh>
            <mesh castShadow>
              <capsuleGeometry
                args={[characterDimensions.radius, characterCapsuleLength]}
              />
              <meshStandardMaterial color="mediumpurple" />
            </mesh>
            <mesh castShadow position={[0, 0.5, 0.5]}>
              <boxGeometry args={[0.5, 0.2, 0.3]} />
              <meshStandardMaterial color="mediumpurple" />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}
