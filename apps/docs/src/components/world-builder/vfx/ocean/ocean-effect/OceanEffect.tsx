import { useThree } from "@react-three/fiber"
import { Effect, EffectAttribute, WebGLExtension } from "postprocessing"
import * as React from "react"
import { usePostProcessingEffect } from "render-composer"
import { Camera, Uniform, Vector3 } from "three"
import fragment from "./OceanEffect.frag.glsl"

export interface PlanetWithOcean {
  radius: number
  origin: Vector3
  seaLevel: number
}

export interface Sun {
  origin: Vector3
  color: Vector3
  intensity: number
}

// Effect implementation
class OceanEffectImpl extends Effect {
  camera: Camera
  suns: Sun[]
  planets: PlanetWithOcean[]
  constructor({
    camera,
    suns,
    planets,
  }: {
    camera: Camera
    suns: Sun[]
    planets: PlanetWithOcean[]
  }) {
    console.log({ planetsWithOceans: planets, suns })
    const cameraDirection = new Vector3()
    camera.getWorldDirection(cameraDirection)
    super(
      "MyCustomEffect",
      fragment
        .replace(/<planetsWithOceansLength>/g, planets.length)
        .replace(/<sunsLength>/g, suns.length),
      {
        uniforms: new Map<string, Uniform | { value: any }>([
          ["uCameraPosition", new Uniform(camera.position)],
          ["uCameraWorldDirection", new Uniform(cameraDirection)],
          [
            "uPlanets",
            {
              value: planets,
            },
          ],
          [
            "uSuns",
            {
              value: suns,
            },
          ],
          ["uViewMatrixInverse", new Uniform(camera.matrixWorld)],
          [
            "uProjectionMatrixInverse",
            new Uniform(camera.projectionMatrixInverse),
          ],
        ]),
        attributes: EffectAttribute.DEPTH,
        extensions: new Set([WebGLExtension.DERIVATIVES]),
      },
    )

    this.camera = camera
    this.planets = planets
    this.suns = suns
  }

  // UPDATE ALL OUR THINGS!
  update() {
    const cameraDirection = new Vector3()
    this.camera.getWorldDirection(cameraDirection)
    this.uniforms.get("uCameraWorldDirection")!.value = cameraDirection
    this.uniforms.get("uCameraPosition")!.value = this.camera.position
    this.uniforms.get("uViewMatrixInverse")!.value = this.camera.matrixWorld
    this.uniforms.get("uProjectionMatrixInverse")!.value =
      this.camera.projectionMatrixInverse
    this.uniforms.get("uPlanets").value = this.planets
    this.uniforms.get("uSuns").value = this.suns
  }
}

export const OceanEffect: React.FC<{
  suns: Sun[]
  planets: PlanetWithOcean[]
}> = ({ suns, planets }) => {
  const camera = useThree(store => store.camera)

  usePostProcessingEffect(() => {
    return new OceanEffectImpl({
      camera,
      suns,
      planets,
    })
  }, [camera, suns, planets])
  return null
}
