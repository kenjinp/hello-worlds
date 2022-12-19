import { useThree } from "@react-three/fiber"
import { Effect, EffectAttribute, WebGLExtension } from "postprocessing"
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
    const cameraDirection = new Vector3()
    camera.getWorldDirection(cameraDirection)
    console.log("I am rerendering the atmosphere shader")
    super(
      "MyCustomEffect",
      fragment
        .replace(/<planetsLength>/g, planets.length)
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

export const AtmosphereEffect: React.FC<
  React.PropsWithChildren<{
    suns: Sun[]
    planets: PlanetAtmosphere[]
  }>
> = ({ suns, planets, children }) => {
  const camera = useThree(store => store.camera)

  usePostProcessingEffect(() => {
    return new MyCustomEffectImpl({
      camera,
      suns,
      planets,
    })
  }, [camera, suns, planets])
  return children
}
