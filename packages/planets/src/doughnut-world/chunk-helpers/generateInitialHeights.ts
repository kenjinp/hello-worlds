import { Vector2, Vector3 } from "three"
import {
  ChunkGeneratorProps,
  ColorGenerator,
  HeightGenerator,
} from "../../chunk/types"
import { tempColor, tempVector3 } from "../../utils"

const _D = new Vector3()

const _P = new Vector3()

const _H = new Vector3()
const _W = new Vector3()
// const _S = new Vector3()
const _C = new Vector3()

const colorInputVector = new Vector3()
const _U = new Vector3()
const _Center = new Vector3()
const xy = new Vector2()

function getUpDirectionOnCylinder(
  position: Vector3,
  offset: Vector3,
): THREE.Vector3 {
  const up = _U
  const center = _Center.set(0, position.y, 0).add(offset)
  const direction = tempVector3.copy(position).sub(center)
  up.crossVectors(direction, tempVector3.set(0, 0, 1)).normalize()
  return up
}

export interface GenerateInitialHeightsProps<D> extends ChunkGeneratorProps<D> {
  heightGenerator: HeightGenerator<D>
  colorGenerator?: ColorGenerator<D>
}

export const generateInitialHeights = <D>(
  params: GenerateInitialHeightsProps<D> & { height: number },
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
  // const half = width / 2
  const resolution = params.resolution + 2
  const effectiveResolution = resolution - 2

  const positions = []
  const colors = []
  const coords = []
  const up = []
  const height = params.height
  const halfW = width / 2
  const halfH = height / 2

  for (let x = -1; x <= effectiveResolution + 1; x++) {
    const xp = (width * x) / effectiveResolution
    for (let y = -1; y <= effectiveResolution + 1; y++) {
      const yp = (width * y) / effectiveResolution

      // Compute position
      _P.set(xp - halfW, yp - halfH, radius)
      _P.add(offset)

      // bend cube into cylinder
      const cylinderLength = Math.sqrt(_P.x * _P.x + _P.z * _P.z)
      // this is esentially normalizing the vector, but without the y component
      _P.divide(tempVector3.set(cylinderLength, 1, cylinderLength))

      // for height offset later
      _D.copy(_P)

      // push out the points across the circle at radius
      _P.multiply(tempVector3.set(radius, 1, radius))

      _P.z -= radius

      _W.copy(_P)
      _W.applyMatrix4(localToWorld)

      // Purturb height along z-vector
      const heightInput = _W
      const terrainHeightOffset = heightGenerator({
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
        xy: xy.set(x, y),
      })
      const color = colorGenerator
        ? colorGenerator({
            input: colorInputVector.set(_W.x, _W.y, terrainHeightOffset),
            worldPosition: _W,
            radius,
            offset,
            width,
            worldMatrix: params.worldMatrix,
            resolution,
            inverted: params.inverted,
            origin: params.origin,
            height: terrainHeightOffset,
            data: params.data,
            xy: xy.set(x, y),
          })
        : tempColor.set(0xffffff)

      // Perturb height along the "normal", sticking out from the cylinder surface
      const signedTerrainHeightOffset =
        terrainHeightOffset * (params.inverted ? -1 : 1)
      _H.copy(_D)
      _H.multiply(
        tempVector3.set(
          signedTerrainHeightOffset,
          1,
          signedTerrainHeightOffset,
        ),
      )
      _P.setX(_H.x + _P.x)
      _P.setZ(_H.z + _P.z)

      // color has alpha from array
      if ("length" in color) {
        colors.push(...color)
      } else {
        colors.push(color.r, color.g, color.b, 1)
      }

      positions.push(_P.x, _P.y, _P.z)

      _C.copy(_W)
      _C.add(_H)
      coords.push(_C.x, _C.y, _C.z)

      up.push(_D.x, _D.y, _D.z)
    }
  }

  return {
    positions,
    colors,
    coords,
    up,
  }
}
