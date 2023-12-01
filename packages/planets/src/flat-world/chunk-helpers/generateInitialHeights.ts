import { Vector3 } from "three"
import {
  ChunkGeneratorProps,
  ColorGenerator,
  HeightGenerator,
} from "../../chunk/types"
import { tempColor } from "../../utils"

const _D = new Vector3()

const _P = new Vector3()

const _H = new Vector3()
const _W = new Vector3()
// const _S = new Vector3()
const _C = new Vector3()

const colorInputVector = new Vector3()

export interface GenerateInitialHeightsProps<D> extends ChunkGeneratorProps<D> {
  heightGenerator: HeightGenerator<D>
  colorGenerator?: ColorGenerator<D>
}

// function calculateUVCoordinates(x: number, y: numbe, width: number, height: number): [number, number] {
//   // Normalize the coordinates to range [0, 1]
//   const u = x / (this.width - 1);
//   const v = y / (this.height - 1);

//   return { u, v };
// }

export const generateInitialHeights = <D>(
  params: GenerateInitialHeightsProps<D>,
) => {
  const {
    radius,
    worldMatrix,
    offset,
    width,
    origin,
    data,
    inverted,
    heightGenerator,
    colorGenerator,
  } = params

  const localToWorld = worldMatrix
  const half = width / 2
  const resolution = params.resolution + 2
  const effectiveResolution = resolution - 2

  const positions = []
  const colors = []
  const coords = []
  const localCoords = []
  const up = []
  const heights = []
  let heightsMax = 0
  let heightsMin = Infinity
  let minY = 0
  let minX = 0

  for (let x = -1; x <= effectiveResolution + 1; x++) {
    const xp = (width * x) / effectiveResolution
    for (let y = -1; y <= effectiveResolution + 1; y++) {
      const notInSkirt =
        x >= 0 && x <= effectiveResolution && y >= 0 && y <= effectiveResolution
      const yp = (width * y) / effectiveResolution

      _P.set(xp - half, yp - half, 0)
      _P.add(offset)
      if (x === -1 && y === -1) {
        minX = _P.x
        minY = _P.y
      }

      // Compute a world space position to sample noise
      _W.copy(_P)
      _W.applyMatrix4(localToWorld)

      // Purturb height along z-vector
      const heightInput = _W.clone()
      const height = heightGenerator({
        input: heightInput,
        worldPosition: heightInput,
        radius,
        offset,
        width,
        worldMatrix,
        resolution,
        origin,
        inverted,
        data,
      })
      if (notInSkirt) {
        heights.push(height)
        heightsMax = Math.max(heightsMax, height)
        heightsMin = Math.min(heightsMin, height)
      }

      const color = colorGenerator
        ? colorGenerator({
            input: colorInputVector.set(_W.x, _W.y, height).clone(),
            worldPosition: _W.clone(),
            radius,
            offset,
            width,
            worldMatrix: params.worldMatrix,
            resolution,
            inverted: params.inverted,
            origin: params.origin,
            height,
            data: params.data,
          })
        : tempColor.set(0xffffff).clone()

      // Purturb height along z-vector
      _P.z += height * (params.inverted ? -1 : 1)

      // color has alpha from array
      if ("length" in color) {
        colors.push(...color)
      } else {
        colors.push(color.r, color.g, color.b, 1)
      }

      _H.copy(_D)
      _H.multiplyScalar(height * (params.inverted ? -1 : 1))
      _P.add(_H)

      positions.push(_P.x, _P.y, _P.z)

      const scale = (2 * radius) / effectiveResolution
      const uvOffset = radius
      const ux = (_P.x + uvOffset) / scale
      const uy = (_P.y + uvOffset) / scale

      const u = 1 - ux / effectiveResolution
      const v = 1 - uy / effectiveResolution
      const localU = 1 - x / effectiveResolution
      const localV = 1 - y / effectiveResolution
      localCoords.push(localU, localV)

      coords.push(u, v)
      up.push(0, 0, 1)
    }
  }

  return {
    positions,
    colors,
    coords,
    up,
    heights,
    heightsMax,
    heightsMin,
    localCoords,
  }
}
