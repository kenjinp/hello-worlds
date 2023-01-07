import { Noise } from "@hello-worlds/planets"
import { useTexture } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import * as React from "react"
import { Material, MathUtils, Object3D, Points, Vector3 } from "three"
import { randFloat } from "three/src/math/MathUtils"

export class ParticleFieldImpl extends Object3D {
  constructor() {
    super()
  }

  update() {}
}

const tempVec3 = new Vector3()
const tempVec32 = new Vector3()

const SETTINGS = {
  amount: 8000,
  radius: 80,
  speed: 5,
  fogEnabled: true,
  elapsedTime: 0,
  // trails: true,
}

export const ParticleField: React.FC<{
  count: number
  size: number
  speed: number
}> = ({ count = 5_000, size = 10_000, speed = 3 }) => {
  const ref = React.useRef<Points>()
  const pointsMatRef = React.useRef<Material>()
  const camera = useThree(state => state.camera)

  const [noise] = React.useState(
    () =>
      new Noise({
        height: speed,
        scale: 5_000,
      }),
  )

  useFrame(() => {
    const points = ref.current as Points
    if (points) {
      points.position.copy(camera.position)
      const positions = points.geometry.getAttribute("position")
      positions.needsUpdate = true
    }
  })

  function getCameraVelocity(delta: number) {
    // Assume the camera's position is updated every frame using a constant time step
    const position = camera.getWorldPosition(tempVec3)
    const previousPosition = camera.userData.previousPosition
      ? camera.userData.previousPosition
      : position

    const velocity = position.clone().distanceTo(previousPosition) / delta

    return MathUtils.clamp(velocity, -100, 100)
  }

  useFrame((_, delta) => {
    const points = ref.current as Points
    if (points) {
      const positions = points.geometry.getAttribute("position")
      const velocity = camera
        .getWorldDirection(tempVec32)
        .negate()
        .multiplyScalar(getCameraVelocity(delta))

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i)
        const y = positions.getY(i)
        const z = positions.getZ(i)
        tempVec3.set(x, y, z)

        // moduloVector3(tempVec3, size * 2.0).subScalar(size)

        const halfSize = size / 2
        if (tempVec3.x > halfSize) tempVec3.x = -halfSize
        if (tempVec3.y > halfSize) tempVec3.y = -halfSize
        if (tempVec3.z > halfSize) tempVec3.z = -halfSize
        if (tempVec3.x < -halfSize) tempVec3.x = halfSize
        if (tempVec3.y < -halfSize) tempVec3.y = halfSize
        if (tempVec3.z < -halfSize) tempVec3.z = halfSize

        const noiseValue = noise.getFromVector(tempVec3)

        positions.setXYZ(
          i,
          tempVec3.x + noiseValue + velocity.x,
          tempVec3.y + noiseValue + velocity.y,
          tempVec3.z + noiseValue + velocity.z,
        )

        positions.needsUpdate = true
      }
    }
  })

  const CircleImg = useTexture("/img/circle.png")
  let positions = React.useMemo(() => {
    let positions = []
    for (let xi = 0; xi < count; xi++) {
      const halfSize = size / 2
      positions.push(
        randFloat(-halfSize, halfSize),
        randFloat(-halfSize, halfSize),
        randFloat(-halfSize, halfSize),
      )
    }
    return new Float32Array(positions)
  }, [count, size])

  return (
    <points ref={ref}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={pointsMatRef}
        attach="material"
        map={CircleImg}
        color={0x00aaff}
        size={10}
        sizeAttenuation
        transparent={false}
        alphaTest={0.5}
        opacity={1.0}
      />
    </points>
  )
}
