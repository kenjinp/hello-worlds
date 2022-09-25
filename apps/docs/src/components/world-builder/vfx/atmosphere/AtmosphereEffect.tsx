import { useThree } from "@react-three/fiber"
import { Effect, EffectAttribute } from "postprocessing"
import * as React from "react"
import { usePostProcessingEffect } from "render-composer"
import { Camera, Uniform, Vector2, Vector3 } from "three"
import fragment from "./Atmosphere.frag.glsl"

// Effect implementation
class MyCustomEffectImpl extends Effect {
  camera: Camera
  planetRadius: number
  atmosphereRadius: number
  planetOrigin: Vector3
  sunPosition: Vector3
  viewVector: Vector3
  constructor({
    camera,
    planetOrigin,
    planetRadius,
    sunPosition,
    atmosphereRadius,
    resolution,
  }: {
    camera: Camera
    planetOrigin: Vector3
    atmosphereRadius: number
    planetRadius: number
    sunPosition: Vector3
    resolution: Vector2
  }) {
    const viewVector = new Vector3()
    camera.getWorldDirection(viewVector)

    super("MyCustomEffect", fragment, {
      uniforms: new Map([
        ["uInverseProjection", new Uniform(camera.projectionMatrixInverse)],
        ["uInverseView", new Uniform(camera.matrixWorld.clone())],
        ["uCamMatrix", new Uniform(camera.matrixWorld)],
        ["uWorldspaceCameraPosition", new Uniform(camera.position)],
        ["uVV", new Uniform(viewVector)],
        ["uResolution", new Uniform(resolution)],
        ["uAtmosphereRadius", new Uniform(atmosphereRadius)],
        ["uPlanetOrigin", new Uniform(planetOrigin)],
        ["uPlanetRadius", new Uniform(planetRadius)],
        ["uSunPosition", new Uniform(sunPosition)],
      ]),
      attributes: EffectAttribute.DEPTH,
    })

    this.camera = camera
    this.planetRadius = planetRadius
    this.planetOrigin = planetOrigin
    this.atmosphereRadius = atmosphereRadius
    this.sunPosition = sunPosition
    this.viewVector = viewVector
  }

  update() {
    const viewVector = new Vector3()
    this.camera.getWorldDirection(viewVector)

    // viewVector.applyQuaternion(this.camera.quaternion)

    // const worldspace = new Vector3()
    // this.camera.getWorldPosition(worldspace)

    this.uniforms.get("uInverseProjection").value =
      this.camera.projectionMatrixInverse
    this.uniforms.get("uInverseView").value = this.camera.matrixWorld.clone()
    this.uniforms.get("uVV").value = viewVector
    this.uniforms.get("uWorldspaceCameraPosition").value = this.camera.position
    this.uniforms.get("uAtmosphereRadius").value = this.atmosphereRadius
    this.uniforms.get("uSunPosition").value = this.sunPosition
    this.uniforms.get("uPlanetOrigin").value = this.planetOrigin
    this.uniforms.get("uPlanetRadius").value = this.planetRadius
  }
}

// Effect component
export const AtmosphereEffect = React.forwardRef<
  ThreeElements.primitive,
  {
    planetOrigin: Vector3
    atmosphereRadius: number
    planetRadius: number
    sunPosition: Vector3
  }
>(({ planetOrigin, atmosphereRadius, planetRadius, sunPosition }, ref) => {
  const camera = useThree(store => store.camera)
  const dpr = Math.min(window.devicePixelRatio, 2)
  usePostProcessingEffect(
    () =>
      new MyCustomEffectImpl({
        camera,
        resolution: new Vector2(
          window.innerWidth * dpr,
          window.innerHeight * dpr,
        ),
        planetOrigin,
        atmosphereRadius,
        sunPosition,
        planetRadius,
      }),
    [camera, planetOrigin, atmosphereRadius],
  )

  return null
})
