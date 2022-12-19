import { Stars } from "@react-three/drei"
import * as React from "react"
import * as RC from "render-composer"
import { Color, Quaternion, Vector3 } from "three"

const AU = 149_597_870_700

export const LightRig: React.FC = () => {
  return (
    <>
      <mesh position={new Vector3(-1, 0.75, 1).multiplyScalar(AU / 20)}>
        <directionalLight color={0xffffff} intensity={0.8} castShadow />
        <sphereGeometry args={[600_000_000 / 4, 32, 16]}></sphereGeometry>
        <meshStandardMaterial
          color={0xfdfbd3}
          emissive={0xfdfbd3}
          emissiveIntensity={40.0}
        />
      </mesh>
    </>
  )
}

export const InvertedLightRig: React.FC = ({}) => {
  return (
    <group>
      <hemisphereLight
        intensity={0.3}
        color={new Color(0xffffff)}
        groundColor={new Color(0xffffff)}
        position={new Vector3(0, 0, 0)}
        // castShadow
      />
      <directionalLight
        color={0xffffff}
        intensity={1}
        position={new Vector3(-1, 0.75, 1).multiplyScalar(-50)}
        castShadow
        shadow-mapSize-height={512 * 3}
        shadow-mapSize-width={512 * 3}
      />
      {/* <mesh scale={new Vector3(10, 10, 10)}>
        <sphereGeometry></sphereGeometry>
        <meshStandardMaterial
          color={new Color("white")}
          emissive={new Color("white")}
        ></meshStandardMaterial>
      </mesh> */}

      {/* <group>
        <mesh
          castShadow
          receiveShadow
          scale={new Vector3(20, 20, 20)}
          position={new Vector3(-1, 0.75, 1).multiplyScalar(500)}
        >
          <sphereGeometry></sphereGeometry>
          <meshStandardMaterial
            color={new Color("blue")}
          ></meshStandardMaterial>
        </mesh>
      </group> */}
    </group>
  )
}

// new Vector3(0, 6_357 * 1_000, 6_357 * 1_000)
const small = new Vector3(0, 10_000, 10_000)
const cameraPosition = new Vector3(0, 6_357 * 1_000, 6_357 * 1_000)

// new Vector3(
//   355898.9978932907,
//   -16169.249553939484,
//   -181920.2108868533
// );
const cameraQuat = new Quaternion(
  0.3525209450519473,
  0.6189868049149101,
  -0.58773147927222,
  0.38360921119467495,
)

const PostProcessing: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  // Move this somewhere
  return (
    <RC.RenderPipeline>
      <RC.EffectPass>
        <RC.SMAAEffect />
        <RC.SelectiveBloomEffect intensity={5} luminanceThreshold={0.9} />
        {/* <RC.GodRaysEffect lightSource={sun} /> */}
        <RC.VignetteEffect />
        {/* <RC.LensDirtEffect
          texture={useTexture("/img/lensdirt.jpg")}
          strength={0.3}
        /> */}
        {children}
      </RC.EffectPass>
    </RC.RenderPipeline>
  )
}

export const BasicScene: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  return (
    <RC.Canvas
      gl={{ logarithmicDepthBuffer: true }}
      camera={{
        near: 0.01,
        far: Number.MAX_SAFE_INTEGER,
        // position: new Vector3(0, 6_357 * 1_000, 6_357 * 1_000),
        position: small,
        quaternion: cameraQuat,
      }}
      shadows
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1,
        background: "black",
      }}
      flat
    >
      <React.Suspense fallback={null}>
        <group
          scale={new Vector3(1, 1, 1).multiplyScalar(AU).multiplyScalar(10)}
        >
          <Stars saturation={1} />
        </group>
        {/* <SpaceBox /> */}
        {/* <LightRig /> */}
        <PostProcessing>{children}</PostProcessing>
      </React.Suspense>
    </RC.Canvas>
  )
}

export default BasicScene
