import { useThree } from "@react-three/fiber"
import { Effect, EffectAttribute } from "postprocessing"
import * as React from "react"
import { usePostProcessingEffect } from "render-composer"
import { Camera, Uniform, Vector2, Vector3, WebGLRenderer } from "three"
import fragment from "./Atmosphere.frag.glsl"

console.log({ fragment })

// Effect implementation
class MyCustomEffectImpl extends Effect {
  camera: Camera
  atmosphereRadius: number
  planetOrigin: Vector3
  sunPosition: Vector3
  constructor({
    camera,
    renderer,
    planetOrigin,
    planetRadius,
    sunPosition,
    atmosphereRadius,
  }: {
    camera: Camera
    renderer: WebGLRenderer
    planetOrigin: Vector3
    atmosphereRadius: number
    planetRadius: number
    sunPosition: Vector3
  }) {
    const height = renderer.domElement.clientHeight
    const width = renderer.domElement.clientWidth
    const viewVector = new Vector3()
    camera.getWorldDirection(viewVector)

    super("MyCustomEffect", fragment, {
      uniforms: new Map([
        ["uWorldspaceCameraPosition", new Uniform(camera.position)],
        ["uViewVector", new Uniform(viewVector)],
        ["uResolution", new Uniform(new Vector2(width, height))],
        ["uFov", new Uniform(camera?.fov || 45)],
        ["uAtmosphereRadius", new Uniform(atmosphereRadius)],
        ["uPlanetOrigin", new Uniform(planetOrigin)],
        ["uPlanetRadius", new Uniform(planetRadius)],
        ["uSunPosition", new Uniform(sunPosition)],
      ]),
      attributes: EffectAttribute.DEPTH,
    })

    this.camera = camera
    this.planetOrigin = planetOrigin
    this.atmosphereRadius = atmosphereRadius
    this.sunPosition = sunPosition
  }

  updateProps({
    atmosphereRadius,
    sunPosition,
  }: {
    atmosphereRadius: number
    sunPosition: Vector3
  }) {
    this.atmosphereRadius = atmosphereRadius
    this.sunPosition = sunPosition
  }

  update() {
    const viewVector = new Vector3()
    this.camera.getWorldDirection(viewVector)
    this.uniforms.get("uViewVector").value = viewVector
    this.uniforms.get("uWorldspaceCameraPosition").value = this.camera.position
    this.uniforms.get("uAtmosphereRadius").value = this.atmosphereRadius
    this.uniforms.get("uSunPosition").value = this.sunPosition
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
  const { camera, gl } = useThree()
  usePostProcessingEffect(
    () =>
      new MyCustomEffectImpl({
        camera,
        renderer: gl,
        planetOrigin,
        atmosphereRadius,
        sunPosition,
        planetRadius,
      }),
    [camera, gl, planetOrigin, atmosphereRadius],
  )

  return null
})
