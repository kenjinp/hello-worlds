import { PlanetChunks } from "@hello-worlds/react"
import { Vector4 } from "three"
import { TerrainMaterial, useProgressiveTextures } from "three-landscape"

function UpdateChunks() {
  return (
    <PlanetChunks>
      {chunk => {
        const geometry = chunk.geometry
        if (geometry && geometry.attributes.uv) {
          geometry.attributes.uv2 = geometry.attributes.uv.clone()
        }
        return null
      }}
    </PlanetChunks>
  )
}

export function PlanetTexture() {
  const [q, textures] = useProgressiveTextures([
    [
      "/texture-stuff/aomap.png",
      "/texture-stuff/Grass_02/ground_Grass1_col.jpg",
      "/texture-stuff/Grass_02/ground_Grass1_norm.jpg",
      "/texture-stuff/Mud_03/Ground_WetBumpyMud_col.jpg",
      "/texture-stuff/Mud_03/Ground_WetBumpyMud_norm.jpg",
      "/texture-stuff/Cliffs_02/Rock_DarkCrackyCliffs_col.jpg",
      "/texture-stuff/Cliffs_02/Rock_DarkCrackyCliffs_norm.png",
      "/texture-stuff/Rock_04/Rock_sobermanRockWall_col.jpg",
      "/texture-stuff/Rock_04/Rock_sobermanRockWall_norm.jpg",
      `/texture-stuff/heightmap@0.5.png`,
      `/texture-stuff/normalmap.png`,
      `/texture-stuff/splatmap_00.png`,
      `/texture-stuff/splatmap_01.png`,
      "/texture-stuff/DebugTexture/debug.jpg",
      "/texture-stuff/DebugTexture/debug_norm.png",
    ],
  ])

  const t = textures[q]

  const gridless = true
  const noiseBlend = true
  const triplanar = true

  const grass2 = {
    diffuse: t[1],
    normal: t[2],
    normalStrength: 0.2,
    repeat: 200,
    gridless: gridless,
    saturation: 0.7,
    tint: new Vector4(0.8, 1.0, 0.8, 1),
  }

  const grass1 = {
    diffuse: t[1],
    normal: t[2],
    normalStrength: 0.2,
    repeat: 200,
    saturation: 0.6,
    gridless: gridless,
    tint: new Vector4(0.8, 1.0, 0.8, 1),
  }

  const octaves = [
    {
      blur: 0.5,
      amplitude: 1.25,
      wavelength: 1024.0 * 16.0,
      accuracy: 1.25,
    },
    {
      blur: 1.0,
      amplitude: 1.0,
      wavelength: 1024.0 * 64.0,
      accuracy: 1.0,
    },
  ]

  if (noiseBlend) {
    //@ts-ignore
    grass1.blend = {
      mode: "noise",
      octaves,
    }
    //@ts-ignore
    grass2.blend = {
      mode: "noise",
      octaves,
    }
  }

  const mud = {
    diffuse: t[3],
    normal: t[4],
    normalStrength: 0.5,
    repeat: 200,
    saturation: 0.5,
  }

  const clif = {
    diffuse: t[7],
    normal: t[8],
    normalStrength: 0.4,
    tint: new Vector4(1.5, 1.5, 1.5, 1),
    triplanar: triplanar,
    gridless: gridless,
    repeat: 150,
    saturation: 0.5,
  }

  const rock = {
    diffuse: t[5],
    normal: t[6],
    normalStrength: 0.5,
    tint: new Vector4(1.5, 1.5, 1.5, 1),
    triplanar: triplanar,
    gridless: gridless,
    repeat: 150,
    saturation: 0.3,
  }

  return (
    <>
      <UpdateChunks />
      <TerrainMaterial
        splats={[t[11], t[12]]}
        surfaces={[rock, clif, mud, grass1, grass2, mud, mud]}
        displacementScale={100.0}
        displacementMap={t[9]}
        anisotropy={1}
      />
    </>
  )
}
