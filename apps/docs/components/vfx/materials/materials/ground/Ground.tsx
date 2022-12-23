// @ts-nocheck
import { useTexture } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { patchShaders } from "gl-noise"
import * as React from "react"
import { MeshStandardMaterial, NearestFilter, RepeatWrapping } from "three"
import CustomShaderMaterial from "three-custom-shader-material"
import frag from "./Ground.frag.glsl"
import vert from "./Ground.vert.glsl"
import dirt from "./textures/dirt_albedo.png"
import dirtN from "./textures/dirt_normal.png"
import grass from "./textures/grass_albedo.png"
import rock from "./textures/rock_albedo.png"
// import normalMap from "./textures/rock_normal.png"
import { usePlanet } from "@hello-worlds/react"
import noiseMap from "./textures/noise.png"
import uvTest from "./textures/uv-test.png"
import { useLoadTextureArray } from "./useLoadTextureArray"

export const Ground: React.FC = () => {
  const planet = usePlanet()
  planet.castShadow = true
  planet.receiveShadow = true

  const materialRef = React.useRef()
  const props = useTexture({
    map: rock,
    uvTest,
    noiseMap,
    // normalMap,
    // displacementMap: 'PavingStones092_1K_Displacement.jpg',
    // normalMap: 'PavingStones092_1K_Normal.jpg',
    // roughnessMap: 'PavingStones092_1K_Roughness.jpg',
    // aoMap: 'PavingStones092_1K_AmbientOcclusion.jpg',
  })

  const whatever = useLoadTextureArray([rock, grass, dirt, dirtN], {
    dimensions: 64,
  })

  props.map.magFilter = NearestFilter
  props.map.wrapS = RepeatWrapping
  props.map.wrapT = RepeatWrapping

  props.noiseMap.wrapS = RepeatWrapping
  props.noiseMap.wrapT = RepeatWrapping

  // props.normalMap.magFilter = NearestFilter
  // props.normalMap.wrapS = RepeatWrapping
  // props.normalMap.wrapT = RepeatWrapping

  const camera = useThree(store => store.camera)

  useFrame(state => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <CustomShaderMaterial
      ref={materialRef}
      baseMaterial={MeshStandardMaterial}
      vertexShader={patchShaders(vert)}
      fragmentShader={frag}
      uniforms={{
        noiseMap: {
          value: props.noiseMap,
        },
        uTextures: {
          // value: [props.map, props.uvTest, props.map, props.uvTest],
          value: whatever,
        },
        uWidth: { value: 0 },
        uRadius: { value: 0 },
        uResolution: { value: 0 },
        uTime: { value: 0 },
        // uModelMatrix: {
        //   value:
        // },
        // uModelViewMatrix: {
        //   value:
        // },
        uCameraPosition: {
          value: camera.position,
        },
      }}
      // vertexColors
      // {...props}
    />
  )
}
