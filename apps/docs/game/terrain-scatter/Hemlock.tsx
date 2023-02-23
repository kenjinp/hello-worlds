import { Chunk } from "@hello-worlds/planets"
import { usePlanet } from "@hello-worlds/react"
import { Merged, useGLTF } from "@react-three/drei"
import * as React from "react"
import { Euler, InstancedMesh, MathUtils, Object3D, Vector3 } from "three"
import { MeshSurfaceSampler } from "three-stdlib"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
const hemlockURL = "/models/hemlock.glb"
type HemlockGLTFResult = GLTF & {
  nodes: {
    Plane281: THREE.Mesh
    Plane281_1: THREE.Mesh
  }
  materials: {
    ["Material.PineBranch"]: THREE.MeshStandardMaterial
    ["Material.PineBark"]: THREE.MeshStandardMaterial
  }
}

export const Hemlock = React.forwardRef(function PineInner(
  props: { count },
  ref: React.Ref<any>,
) {
  const { nodes, materials } = useGLTF(hemlockURL, true) as HemlockGLTFResult

  return (
    <Merged meshes={nodes}>
      {({ Plane281, Plane281_1 }) => (
        <>
          <Plane281 />
          <Plane281_1 />
        </>
      )}
    </Merged>
  )
})

export const HemlockMeshGroup: React.FC = () => {
  // @ts-ignore
  const { nodes, materials } = useGLTF(hemlock, true) as HemlockGLTFResult

  return (
    <group>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Plane281.geometry}
        material={materials["Material.PineBranch"]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Plane281_1.geometry}
        material={materials["Material.PineBark"]}
      />
    </group>
  )
}

const rot = new Euler().setFromVector3(new Vector3(-Math.PI / 2, 0, 0))
const _position = new Vector3()
const _normal = new Vector3()
const _tempObject = new Object3D()
const _tempObjectInner = new Object3D()
// _tempObjectInner.rotation.copy(rot)
_tempObject.add(_tempObjectInner)
const origin = new Vector3()
export const HemlockInstances: React.FC<
  React.PropsWithChildren<{ chunk: Chunk }>
> = ({ chunk, children }) => {
  const refBark = React.useRef<InstancedMesh>(null!)
  const refBranch = React.useRef<InstancedMesh>(null!)
  const { nodes, materials } = useGLTF(hemlockURL, true) as HemlockGLTFResult
  const planet = usePlanet()
  const [sampler] = React.useState(() => {
    const sampler = new MeshSurfaceSampler(chunk)
    sampler.build()
    console.log({ chunk, sampler })
    // sampler.setRandomGenerator(() => MathUtils.seededRandom())
    return sampler
  })
  const limit = 20_000
  const count = MathUtils.clamp(chunk.width / 2, 0, limit)
  React.useLayoutEffect(() => {
    const instancedMesh = refBark.current
    if (!instancedMesh) return

    // Sample randomly from the surface, creating an instance of the sample
    // geometry at each sample point.
    for (let i = 0; i < count; i++) {
      sampler.sample(_position, _normal)
      _tempObject.position.copy(_position)
      _tempObject.lookAt(_normal)
      // _tempObject.scale.multiplyScalar(1_000)
      // _tempObject.rotation.copy(rot)
      _tempObject.rotateZ(90);
      _tempObject.updateMatrix()
      _tempObject.updateMatrixWorld()

      instancedMesh.setMatrixAt(i, _tempObjectInner.matrix)
      instancedMesh.instanceMatrix.needsUpdate = true
    }
  }, [sampler, planet, refBark])
  return (
    <>
      <instancedMesh ref={refBark} args={[null!, null!, count]}>
        <cylinderGeometry args={[100, 100, 1_000, 16]} />
        <meshNormalMaterial />
      </instancedMesh>
    </>
  )

  // return (
  //   <>
  //     <Instances
  //       ref={refBranch}
  //       castShadow
  //       receiveShadow
  //       limit={limit} // Optional: max amount of items (for calculating buffer size)
  //       range={count}
  //       material={materials["Material.PineBranch"]}
  //       geometry={nodes.Plane281.geometry}
  //     >
  //       {children}
  //     </Instances>
  //     <Instances
  //       ref={refBark}
  //       castShadow
  //       receiveShadow
  //       limit={limit} // Optional: max amount of items (for calculating buffer size)
  //       range={count}
  //       material={materials["Material.PineBark"]}
  //       geometry={nodes.Plane281_1.geometry}
  //     >
  //       {children}
  //     </Instances>
  //   </>
  // )
}
