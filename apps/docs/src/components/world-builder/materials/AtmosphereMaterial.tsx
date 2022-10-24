import { DoubleSide, MeshPhysicalMaterial, TextureLoader } from "three"
import CustomShaderMaterial from "three-custom-shader-material/vanilla"
import frag from "./AtmosphereMaterial.frag.glsl"

const loader = new TextureLoader()

export default class AtmosphereMaterial {
  material: CustomShaderMaterial
  constructor() {
    // const diffuse = loader.load(uvTest);

    const waves = [
      { direction: 0, steepness: 0.15, wavelength: 100 },
      { direction: 30, steepness: 0.15, wavelength: 50 },
      { direction: 60, steepness: 0.15, wavelength: 25 },
    ]

    this.material = new CustomShaderMaterial({
      baseMaterial: MeshPhysicalMaterial,
      // vertexShader: patchShaders(vert),
      fragmentShader: frag,
      side: DoubleSide,
      color: "blue",
      flatShading: false,
      uniforms: {},
    })
  }

  update(dt: number) {}
}
