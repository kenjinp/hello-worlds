import { usePlanet } from "@hello-worlds/react"
import { useFrame } from "@react-three/fiber"
import { useControls } from "leva"
import { useEffect, useRef, useState } from "react"
import { Matrix4, Raycaster, Vector3 } from "three"

const raycaster = new Raycaster()
const origVec = new Vector3()
const dirVec = new Vector3()
const tempVec3 = new Vector3()
const invMat = new Matrix4()

export const AddRaycaster = ({ grp }) => {
  const planet = usePlanet()
  const pointDist = planet.radius * 2
  // Objects
  const objRef = useRef(null)
  const origMesh = useRef(null)
  const hitMesh = useRef(null)
  const cylinderMesh = useRef(null)

  // set transforms
  useEffect(() => {
    hitMesh.current.scale.multiplyScalar(0.5)
    origMesh.current.position.set(pointDist, 0, 0)
    objRef.current.rotation.x = Math.random() * 10
    objRef.current.rotation.y = Math.random() * 10
  }, [])

  const xDir = Math.random() - 0.5
  const yDir = Math.random() - 0.5

  useFrame(({ scene }, delta) => {
    if (!grp) {
      return
    }
    const obj = objRef.current

    obj.rotation.x += xDir * delta
    obj.rotation.y += yDir * delta

    origMesh.current.updateMatrixWorld()
    origVec.setFromMatrixPosition(origMesh.current.matrixWorld)
    dirVec.copy(origVec).negate().normalize()

    raycaster.set(origVec, dirVec)
    raycaster.firstHitOnly = true

    // this is actually very slow
    // console.time("sort")
    // planet.chunks.sort((a, b) => {
    //   a.getWorldPosition(tempVec3)
    //   const aDist = tempVec3.distanceToSquared(origMesh.current.position)
    //   b.getWorldPosition(tempVec3)
    //   const bDist = tempVec3.distanceToSquared(origMesh.current.position)
    //   return bDist - aDist
    // })
    // console.timeEnd("sort")

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
    if (hit && hit.point) {
      // const res = raycaster.intersectObject(grp, true)
      const length = hit?.distance
      hitMesh.current.position.set(pointDist - length, 0, 0)
      cylinderMesh.current.position.set(pointDist - length / 2, 0, 0)
      cylinderMesh.current.scale.set(1, length, 1)
      cylinderMesh.current.rotation.z = Math.PI / 2
    }
  })

  return (
    <group ref={objRef}>
      <mesh ref={origMesh}>
        <sphereGeometry args={[10, 20, 20]} />
        <meshBasicMaterial color={0xffffff} />
      </mesh>
      <mesh ref={hitMesh}>
        <sphereGeometry args={[20, 20, 20]} />
        <meshBasicMaterial color={"red"} />
      </mesh>
      <mesh ref={cylinderMesh}>
        <cylinderGeometry args={[5, 5]} />
        <meshBasicMaterial color={0xffffff} transparent opacity={0.25} />
      </mesh>
    </group>
  )
}

export const DebugRayCast = ({ grp }) => {
  console.log("DebugRayCast")
  const [arr, set] = useState([])
  const { count } = useControls({
    count: {
      value: 100,
      min: 0,
      max: 300,
    },
  })

  useEffect(() => {
    set(new Array(count).fill({}))
  }, [count])

  return (
    <>
      {arr.map((_, id) => {
        return <AddRaycaster key={id} grp={grp} />
      })}
    </>
  )
}
