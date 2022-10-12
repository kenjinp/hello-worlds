import { useThree } from "@react-three/fiber"
import { Effect, EffectAttribute } from "postprocessing"
import * as React from "react"
import { usePostProcessingEffect } from "render-composer"
import { Camera, Uniform, Vector3 } from "three"
import fragment from "./Atmosphere.frag.glsl"

export interface PlanetAtmosphere {
  radius: number
  origin: Vector3
  atmosphereRadius: number
}

export interface Sun {
  origin: Vector3
  color: Vector3
  intensity: number
}

// Effect implementation
class MyCustomEffectImpl extends Effect {
  camera: Camera
  suns: Sun[]
  planets: PlanetAtmosphere[]
  constructor({
    camera,
    suns,
    planets,
  }: {
    camera: Camera
    suns: Sun[]
    planets: PlanetAtmosphere[]
  }) {
    console.log({ planets, suns })
    super(
      "MyCustomEffect",
      fragment
        .replace(/<planetsLength>/g, planets.length)
        .replace(/<sunsLength>/g, suns.length),
      {
        uniforms: new Map<string, Uniform | { value: any }>([
          ["uCameraPosition", new Uniform(camera.position)],
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
      },
    )

    this.camera = camera
    this.planets = planets
    this.suns = suns
  }

  // UPDATE ALL OUR THINGS!
  update() {
    this.uniforms.get("uCameraPosition")!.value = this.camera.position
    this.uniforms.get("uViewMatrixInverse")!.value = this.camera.matrixWorld
    this.uniforms.get("uProjectionMatrixInverse")!.value =
      this.camera.projectionMatrixInverse
    this.uniforms.get("uPlanets").value = this.planets
    this.uniforms.get("uSuns").value = this.suns
  }
}

export const AtmosphereEffect: React.FC<{
  suns: Sun[]
  planets: PlanetAtmosphere[]
}> = ({ suns, planets }) => {
  const camera = useThree(store => store.camera)

  usePostProcessingEffect(
    () =>
      new MyCustomEffectImpl({
        camera,
        suns,
        planets,
      }),
    [camera, suns, planets],
  )
  return null
}
