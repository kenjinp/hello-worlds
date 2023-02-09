import { patchShaders } from "gl-noise/build/glNoise.m"
import * as THREE from "three"
import { DoubleSide, MeshPhongMaterial, TextureLoader } from "three"
import CustomShaderMaterial from "three-custom-shader-material/vanilla"
import * as oceanShader from "./shaders"
// import uvTest from "./uv-test.png";

const loader = new TextureLoader()

export default class GerstnerWaterMaterial {
  material: CustomShaderMaterial
  constructor() {
    // const diffuse = loader.load(uvTest);

    const waves = [
      { direction: 0, steepness: 0.15, wavelength: 100 },
      { direction: 30, steepness: 0.15, wavelength: 50 },
      { direction: 60, steepness: 0.15, wavelength: 25 },
    ]

    this.material = new CustomShaderMaterial({
      baseMaterial: MeshPhongMaterial,
      vertexShader: patchShaders(oceanShader.vert),
      fragmentShader: oceanShader.frag,
      side: DoubleSide,
      color: "blue",
      // roughness: 0.2,
      shininess: 100,
      // metalness: 0.1,
      flatShading: false,
      uniforms: {
        uWidth: {
          value: 0,
        },
        uSpeed: {
          value: 10,
        },
        uSize: {
          value: 10,
        },
        // diffuse: {
        //   value: diffuse,
        // },
        waveA: {
          value: [
            Math.sin((waves[0].direction * Math.PI) / 180),
            Math.cos((waves[0].direction * Math.PI) / 180),
            waves[0].steepness,
            waves[0].wavelength,
          ],
        },
        waveB: {
          value: [
            Math.sin((waves[2].direction * Math.PI) / 180),
            Math.cos((waves[2].direction * Math.PI) / 180),
            waves[2].steepness,
            waves[2].wavelength,
          ],
        },
        waveC: {
          value: [
            Math.sin((waves[2].direction * Math.PI) / 180),
            Math.cos((waves[2].direction * Math.PI) / 180),
            waves[2].steepness,
            waves[2].wavelength,
          ],
        },
        offsetX: {
          value: 0,
        },
        offsetY: {
          value: 0,
        },
        uTime: { value: 0 },
        waterColor: {
          value: new THREE.Color("#52a7f7").convertLinearToSRGB(),
        },
        waterHighlight: {
          value: new THREE.Color("#b3ffff").convertLinearToSRGB(),
        },
        offset: {
          value: 0.4,
        },
        contrast: {
          value: 1.0,
        },
        brightness: {
          value: 1,
        },
        uHeight: {
          value: 0.2,
        },
      },
    })
  }

  update(dt: number) {
    this.material.uniforms.uTime.value += dt
  }
}
