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

export interface AtmosphereEffectImplProps {
  camera: Camera
  suns: Sun[]
  planets: PlanetAtmosphere[]
  primarySteps: number
  lightSteps: number
}

// Effect implementation
class AtmosphereEffectImpl extends Effect {
  camera: Camera
  suns: Sun[]
  planets: PlanetAtmosphere[]
  constructor({
    camera,
    suns,
    planets,
    primarySteps,
    lightSteps,
  }: AtmosphereEffectImplProps) {
    const cameraDirection = new Vector3()
    console.log("rendering atmosphere")
    camera.getWorldDirection(cameraDirection)
    super(
      "MyCustomEffect",
      fragment
        .replace(/<planetsLength>/g, planets.length.toString())
        .replace(/<sunsLength>/g, suns.length.toString()),
      {
        // @ts-ignore
        uniforms: new Map<string, Uniform | { value: any }>([
          ["uCameraPosition", new Uniform(camera.position)],
          ["uCameraWorldDirection", new Uniform(cameraDirection)],
          ["uPrimarySteps", new Uniform(primarySteps)],
          ["uLightSteps", new Uniform(lightSteps)],
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
  React.PropsWithChildren<Omit<AtmosphereEffectImplProps, "camera">>
> = ({ children, ...props }) => {
  const camera = useThree(store => store.camera)

  usePostProcessingEffect(() => {
    console.log("creating atmosphere effect", props)
    return new AtmosphereEffectImpl({
      camera,
      ...props,
    })
  }, [camera, props])
  return children
}
