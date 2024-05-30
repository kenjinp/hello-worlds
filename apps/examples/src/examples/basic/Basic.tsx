import { useTexture } from "@react-three/drei"
import { TerrainMaterial } from "three-landscape"

export default function BasicTerrain() {
  const [rock, cliff, mud, grass, splat1, splat2, heightmap, norm] = useTexture(
    [
      "/rock.png",
      "/cliff.png",
      "/mud.png",
      "/grass.png",
      "/splat_1.png",
      "/splat_2.png",
      "/heightmap.png",
      "/grass_norm.png",
    ],
  )

  const surfaces = [rock, cliff, mud, grass].map(diffuse => {
    return {
      diffuse,
      normal: norm,
    }
  })

  return (
    <mesh>
      <directionalLight position={[0, 100, 0]} intensity={2} />
      <mesh>
        <boxGeometry args={[200, 200, 200]} />
        <meshStandardMaterial color="red" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry
          args={[1024, 1024, 1024, 1024]}
          ref={geometry => {
            if (geometry) {
              geometry.attributes.uv2 = geometry.attributes.uv.clone()
              geometry.needsUpdate = true
            }
          }}
        />
        <TerrainMaterial
          far={500}
          splats={[splat1, splat2]}
          surfaces={surfaces}
          displacementMap={heightmap}
          displacementBias={1.0}
          normalMap={norm}
          meshSize={1024}
        />
      </mesh>
    </mesh>
  )
}
