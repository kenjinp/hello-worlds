import { Crater, pyramidHeight } from "@game/generators/craters"
import { setRandomSeed } from "@hello-worlds/core"
import {
  ChunkGenerator3Initializer,
  ColorGeneratorInitializer,
  LatLong,
  Lerp,
  LinearSpline,
  NOISE_TYPES,
  Noise,
  Vector3Pool,
  remap,
} from "@hello-worlds/planets"
import { Color, Line3, Sphere, Vector2, Vector3 } from "three"
import { projectSquareOntoSphere } from "./Moon.math"
export type ThreadParams = {
  seed: string
  seaLevel?: number
  mountain: ImageData
  craters: Crater[]
  canyon: Vector3[]
}

function calculateUVCoordinates(
  center: Vector3,
  target: Vector3,
  squareSize: number,
  sphereRadius: number,
  orientationAngle: number, // Angle in degrees
): Vector2 | null {
  const { x: centerX, y: centerY, z: centerZ } = center
  const { x: targetX, y: targetY, z: targetZ } = target
  // Calculate the distance from the sphere's center to the center of the square
  const distanceToCenter = Math.sqrt(
    centerX * centerX + centerY * centerY + centerZ * centerZ,
  )

  // Check if the center point is on the sphere's surface
  if (Math.abs(distanceToCenter - sphereRadius) > 1e-6) {
    return null
  }

  // Calculate the corner displacements based on the square size and orientation
  const halfSquareSize = squareSize / 2
  const orientationAngleRad = (orientationAngle * Math.PI) / 180
  const cosAngle = Math.cos(orientationAngleRad)
  const sinAngle = Math.sin(orientationAngleRad)

  // const cornerDisplacements = [
  //   { x: halfSquareSize, y: halfSquareSize },
  //   { x: -halfSquareSize, y: halfSquareSize },
  //   { x: -halfSquareSize, y: -halfSquareSize },
  //   { x: halfSquareSize, y: -halfSquareSize },
  // ].map(({ x, y }) => ({
  //   x: x * cosAngle - y * sinAngle,
  //   y: y * cosAngle + x * sinAngle,
  //   z: 0, // The square is on the sphere's surface, so the z-coordinate is zero
  // }))

  // Calculate the corner positions by applying the displacements to the center position
  // const squareCorners = cornerDisplacements.map(({ x, y, z }) => ({
  //   x: centerX + x,
  //   y: centerY + y,
  //   z: centerZ + z,
  // }))

  // Check if the target point is inside the square
  const scaleFactor = squareSize / (2 * sphereRadius)
  const targetXProjected = (targetX - centerX) * scaleFactor
  const targetYProjected = (targetY - centerY) * scaleFactor

  if (
    Math.abs(targetXProjected) <= squareSize / 2 &&
    Math.abs(targetYProjected) <= squareSize / 2
  ) {
    // Calculate the UV coordinates based on the target position relative to the square's corners
    const uvU = (targetXProjected + squareSize / 2) / squareSize
    const uvV = (targetYProjected + squareSize / 2) / squareSize
    return new Vector2(uvU, uvV)
  } else {
    return null
  }
}

const pool = new Vector3Pool(500)
function calculateSquareCorners(
  center: Vector3,
  squareSize: number,
  sphereRadius: number,
  orientationAngle: number, // Angle in degrees
): Vector3[] | null {
  const { x: centerX, y: centerY, z: centerZ } = center
  // Calculate the distance from the sphere's center to the center of the square
  const distanceToCenter = Math.sqrt(
    centerX * centerX + centerY * centerY + centerZ * centerZ,
  )

  // Check if the center point is on the sphere's surface
  if (Math.abs(distanceToCenter - sphereRadius) > 1e-6) {
    return null
  }

  // Calculate the corner displacements based on the square size and orientation
  const halfSquareSize = squareSize / 2
  const orientationAngleRad = (orientationAngle * Math.PI) / 180
  const cosAngle = Math.cos(orientationAngleRad)
  const sinAngle = Math.sin(orientationAngleRad)

  const cornerDisplacements = [
    { x: halfSquareSize, y: halfSquareSize },
    { x: -halfSquareSize, y: halfSquareSize },
    { x: -halfSquareSize, y: -halfSquareSize },
    { x: halfSquareSize, y: -halfSquareSize },
  ].map(({ x, y }) => ({
    x: x * cosAngle - y * sinAngle,
    y: y * cosAngle + x * sinAngle,
    z: 0, // The square is on the sphere's surface, so the z-coordinate is zero
  }))

  // Calculate the corner positions by applying the displacements to the center position
  const squareCorners: Vector3[] = cornerDisplacements.map(({ x, y, z }) => {
    return pool.get().set(centerX + x, centerY + y, centerZ + z)
  })

  return squareCorners
}

// function insideProjectedSquare () {
//   var box = <Your non-aligned box>
// var point = <Your point>

// box.geometry.computeBoundingBox(); // This is only necessary if not allready computed
// box.updateMatrixWorld(true); // This might be necessary if box is moved

// var boxMatrixInverse = new THREE.Matrix4().getInverse(box.matrixWorld);

// var inverseBox = box.clone();
// var inversePoint = point.clone();

// inverseBox.applyMatrix(boxMatrixInverse);
// inversePoint.applyMatrix4(boxMatrixInverse);

// var bb = new THREE.Box3().setFromObject(inverseBox);

// var isInside = bb.containsPoint(inversePoint);
// }

function isTargetPositionInsideSquare(
  center: Vector3,
  target: Vector3,
  squareSize: number,
  sphereRadius: number,
  orientationAngle: number, // Angle in degrees
): boolean {
  const { x: centerX, y: centerY, z: centerZ } = center
  const { x: targetX, y: targetY, z: targetZ } = target

  // Calculate the distance between the target position and the center of the square
  const distanceX = targetX - centerX
  const distanceY = targetY - centerY
  const distanceZ = targetZ - centerZ
  const distanceToTarget = target.distanceTo(center)

  // Calculate the projection of the target point onto the square
  const scaleFactor = squareSize / (2 * sphereRadius)
  const targetXProjected = distanceX * scaleFactor
  const targetYProjected = distanceY * scaleFactor

  // Check if the projected target point is inside the square
  return (
    Math.abs(targetXProjected) <= squareSize / 2 &&
    Math.abs(targetYProjected) <= squareSize / 2
  )
}

async function applyTerrainStamp(bmp: ImageBitmap, radius: number) {
  const { width, height } = bmp
  const scaleFromRadius = radius * 2
  // Calculate the scaling ratio to maintain the aspect ratio
  const scaleX = scaleFromRadius / width
  const scaleY = scaleFromRadius / height
  const scale = Math.min(scaleX, scaleY)

  // Calculate the new scaled dimensions
  const newWidth = width * scale
  const newHeight = height * scale

  // Set the canvas size to the new dimensions
  const canvas = new OffscreenCanvas(width, height)

  const ctx = canvas.getContext("2d")
  ctx.drawImage(bmp, 0, 0)
  bmp.close()
  const imgData = ctx.getImageData(0, 0, newWidth, newHeight)
  return imgData
}

export const heightGenerator: Promise<
  ChunkGenerator3Initializer<ThreadParams, number>
> = async ({ radius, data: { craters, seed, canyon, mountain } }) => {
  // const loadStuff = async () => {
  //   const resp = await fetch("/img/terrain-stamps/ridged-00.png")
  //   if (!resp.ok) {
  //     throw "network error"
  //   }
  //   const blob = await resp.blob()
  //   const bmp = await createImageBitmap(blob)
  //   return bmp
  // }
  // const bmp = await loadStuff()
  // const blah = craters.map(async ({ radius }) => {
  //   return await applyTerrainStamp(await createImageBitmap(mountain), radius)
  // })

  const latLong = new LatLong()
  setRandomSeed(seed)
  const sizeConst = 12
  const scaleConst = 15
  const glacierHeightConstant = 10

  const noiseM = new Noise({
    octaves: 5,
    seed,
    height: 2,
    scale: radius * 1.5 * scaleConst,
  })

  const noiseW = new Noise({
    octaves: 2,
    seed: "oh no",
    height: 3,
    scale: (radius / 20) * scaleConst,
  })

  const noiseB = new Noise({
    octaves: 3,
    seed: "blah",
    height: 0.2,
    scale: (radius / 2) * scaleConst,
  })

  const billow = new Noise({
    noiseType: NOISE_TYPES.BILLOWING,
    seed: "strange!",
    height: 40 * sizeConst,
    scale: (radius / 20) * scaleConst,
  })

  const rigid = new Noise({
    noiseType: NOISE_TYPES.RIGID,
    seed: "bizarre!",
    height: 10 * sizeConst,
    scale: (radius / 30) * scaleConst,
  })

  const abs = new Noise({
    noiseType: NOISE_TYPES.FBM,
    seed: "strange!",
    height: 5 * sizeConst,
    scale: (radius / 4) * scaleConst,
  })

  const craterNoise = new Noise({
    seed: "yarg",
    height: 2,
    scale: 1000 * sizeConst,
    noiseType: NOISE_TYPES.RIGID,
  })

  const glacierNoise = new Noise({
    seed: "banana", // <-important
    height: 10.0,
    scale: (radius / 10) * scaleConst,
  })

  const gWarp = new Noise({
    seed: "banana", // <-important
    height: 1 * sizeConst,
    scale: (radius / 2) * scaleConst,
  })

  const oceanMask = new Noise({
    octaves: 3,
    seed: "ocean",
    height: 2,
    scale: radius * 2 * scaleConst,
  })

  return ({ input }) => {
    // const v = craterHeight(input, craters, craterNoise)
    const v = pyramidHeight(input, craters, craterNoise)

    const n = noiseM.getFromVector(input)
    const warp = noiseW.getFromVector(input)
    const dunelandsHeight = billow.getFromVector(input)
    const rigidLandsHeight = rigid.get(
      input.x + n * warp,
      input.y + n * warp,
      input.z + n * warp,
    )
    const absV = abs.get(input.x + warp, input.y + warp, input.z + warp)

    const mask = noiseM.getFromVector(input)
    const maskB = noiseB.getFromVector(input)
    const oceanMaskValue = oceanMask.getFromVector(input)

    latLong.cartesianToLatLong(input)

    const g = gWarp.getFromVector(input)
    const glWarp = glacierNoise.get(input.x + g, input.y + g, input.z + g)
    let glacierFactor = 0
    if (latLong.lat > 75 + glWarp) {
      glacierFactor = glacierHeightConstant
    }
    if (latLong.lat < -75 + glWarp) {
      glacierFactor = glacierHeightConstant
    }

    const craterHeightHeights = v //Math.max(v, -1000)

    return (
      rigidLandsHeight * mask +
      dunelandsHeight * maskB +
      Math.abs(absV) * -oceanMaskValue +
      craterHeightHeights +
      glacierFactor
    )
  }
}

const oceanColor = new Color(0x33495d)
const glacierColor = new Color(0xffffff)

const colorLerp: Lerp<THREE.Color> = (
  t: number,
  p0: THREE.Color,
  p1: THREE.Color,
) => {
  const c = p0.clone()
  return c.lerp(p1, t)
}

const colorSpline = new LinearSpline<THREE.Color>(colorLerp)
const tropicalSpline = new LinearSpline<THREE.Color>(colorLerp)
const algea = new Color(0x4b692f)

// Temp / Aridity
colorSpline.addPoint(0, algea)
colorSpline.addPoint(0.02, new Color(0xdf7126))
colorSpline.addPoint(0.03, new Color(0xd9a066))
colorSpline.addPoint(0.15, new Color(0xeec39a))
colorSpline.addPoint(0.5, new Color(0x696a6a))
colorSpline.addPoint(0.7, new Color(0x323c39))
colorSpline.addPoint(1.0, new Color(0xbab3a2))

tropicalSpline.addPoint(0, algea)
tropicalSpline.addPoint(0.1, new Color(0xdf7126))
tropicalSpline.addPoint(0.12, new Color(0xd9a066))
tropicalSpline.addPoint(0.15, new Color(0xeec39a))
tropicalSpline.addPoint(0.5, new Color(0x696a6a))
tropicalSpline.addPoint(0.7, new Color(0x323c39))
tropicalSpline.addPoint(1.0, new Color(0xbab3a2))

export const colorGenerator: ColorGeneratorInitializer<ThreadParams> = ({
  radius,
  data: { craters, seed },
}) => {
  const latLong = new LatLong()

  const warp = new Noise({
    octaves: 8,
    seed: "apple", // <-important
    height: 200.0,
    scale: 1000,
  })

  const glacierNoise = new Noise({
    seed: "banana", // <-important
    height: 10.0,
    scale: radius / 10,
  })

  const gWarp = new Noise({
    seed: "banana", // <-important
    height: 1000.0,
    scale: radius / 2,
  })
  const tempLatLong1 = new LatLong()
  const tempLatLong2 = new LatLong()
  const tempV = new Vector3()
  const tempV2 = new Vector3()
  const lines = [new Line3(), new Line3(), new Line3(), new Line3()]
  const sphere = new Sphere(new Vector3(), radius)
  return ({ height, input, worldPosition }) => {
    for (let i = 0; i < craters.length; i++) {
      const crater = craters[i]
      if (worldPosition.distanceTo(crater.center) <= crater.radius) {
        const blah = projectSquareOntoSphere(
          tempV.copy(worldPosition),
          Math.sqrt(2 * crater.radius),
          sphere,
          tempV2.copy(crater.center),
        )
        if (blah) {
          return crater.debugColor
        }
        // const center = LatLong.cartesianToLatLong(crater.center, tempLatLong1)
        // const target = LatLong.cartesianToLatLong(worldPosition, tempLatLong2)
        // const blah = calculateSquareCorners(
        //   tempV.copy(crater.center),
        //   Math.sqrt(2 * crater.radius),
        //   radius,
        //   45,
        // )

        // if (blah) {
        //   // get lines from corners
        //   // for (let i = 0; i <= blah.length; i++) {
        //   //   let a = blah[i]
        //   //   let b = blah[i + 1]
        //   //   if (!b) {
        //   //     b = blah[0]
        //   //   }
        //   //   lines[i].set(a, b)
        //   // }

        //   for (const v of blah) {
        //     if (worldPosition.distanceTo(v) <= crater.radius / 10) {
        //       return crater.debugColor
        //     }

        //     // const p = v.closestPointToPoint(worldPosition, false, tempV2)
        //   }
        // }
      }
    }
    // take inputPosition
    // convert to LatLon
    latLong.cartesianToLatLong(worldPosition)

    const g = gWarp.getFromVector(worldPosition)
    // const warp01Value = warp01.getFromVector(worldPosition)
    const noiseWarpValue = glacierNoise.get(
      worldPosition.x + g,
      worldPosition.y + g,
      worldPosition.z + g,
    )

    // const isTropics =
    //   latLong.lat < 20 + warp01Value && latLong.lat > -(20 + warp01Value)

    if (latLong.lat > 75 + noiseWarpValue) {
      return glacierColor
    }
    if (latLong.lat < -75 + noiseWarpValue) {
      return glacierColor
    }

    const warpedHeight = height + warp.getFromVector(worldPosition)
    const highlats = colorSpline.get(remap(warpedHeight, -100, 4_000, 0, 1))
    const tropics = tropicalSpline.get(remap(warpedHeight, -100, 4_000, 0, 1))

    return warpedHeight > -100 // "sealevel"
      ? tropics.lerp(highlats, remap(Math.abs(latLong.lat), 0, 90, 0, 4))
      : oceanColor
  }
}
