import { useThree } from "@react-three/fiber"
import { Effect, EffectAttribute, WebGLExtension } from "postprocessing"
import * as React from "react"
import { usePostProcessingEffect } from "render-composer"
import { Camera, Color, Uniform, Vector3 } from "three"
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

export interface OceanEffectImplProps {
  camera: Camera
  suns: Sun[]
  planets: PlanetWithOcean[]
  planetScale: number
  alphaMultiplier: number
  smoothness: number
  depthMultiplier: number
  colorA: Color
  colorB: Color
}

// Effect implementation
class OceanEffectImpl extends Effect {
  camera: Camera
  suns: Sun[]
  planets: PlanetWithOcean[]
  planetScale: number
  alphaMultiplier: number
  smoothness: number
  depthMultiplier: number
  colorA: Color
  colorB: Color
  constructor({
    camera,
    suns,
    planets,
    planetScale,
    alphaMultiplier,
    smoothness,
    depthMultiplier,
    colorA,
    colorB,
  }: OceanEffectImplProps) {
    console.log("Ocean Effect rerender", {
      planetsWithOceans: planets,
      suns,
      colorA,
      colorB,
    })
    const cameraDirection = new Vector3()
    camera.getWorldDirection(cameraDirection)
    super(
      "MyCustomEffect",
      fragment
        .replace(/<planetsWithOceansLength>/g, planets.length)
        .replace(/<sunsLength>/g, suns.length),
      {
        uniforms: new Map<string, Uniform | { value: any }>([
          ["uPlanetScale", new Uniform(planetScale)],
          ["uAlphaMultiplier", new Uniform(alphaMultiplier)],
          ["uSmoothness", new Uniform(smoothness)],
          ["uDepthMultiplier", new Uniform(depthMultiplier)],
          ["uColorA", new Uniform([colorA.r, colorA.g, colorA.b, 1.0])],
          ["uColorB", new Uniform([colorB.r, colorB.g, colorB.b, 1.0])],

          ["uCameraPosition", new Uniform(camera.position)],
          ["uCameraWorldDirection", new Uniform(cameraDirection)],
          [
            "uPlanetsWithOceans",
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
    this.planetScale = planetScale
    this.alphaMultiplier = alphaMultiplier
    this.smoothness = smoothness
    this.depthMultiplier = depthMultiplier
    this.colorA = colorA
    this.colorB = colorB
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
    this.uniforms.get("uPlanetsWithOceans").value = this.planets
    this.uniforms.get("uSuns").value = this.suns

    this.uniforms.get("uPlanetScale").value = this.planetScale
    this.uniforms.get("uAlphaMultiplier").value = this.alphaMultiplier
    this.uniforms.get("uSmoothness").value = this.smoothness
    this.uniforms.get("uDepthMultiplier").value = this.depthMultiplier
    this.uniforms.get("uColorA").value = [
      this.colorA.r,
      this.colorA.g,
      this.colorA.b,
      1.0,
    ]
    this.uniforms.get("uColorB").value = [
      this.colorB.r,
      this.colorB.g,
      this.colorB.b,
      1.0,
    ]
  }
}

export const OceanEffect: React.FC<
  React.PropsWithChildren<Omit<OceanEffectImplProps, "camera">>
> = ({ children, ...props }) => {
  const camera = useThree(store => store.camera)
  const propValues = Object.values(props)

  usePostProcessingEffect(() => {
    return new OceanEffectImpl({
      ...props,
      camera,
    })
  }, propValues)

  return children
}
