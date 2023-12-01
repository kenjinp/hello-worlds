import {
  ChunkGenerator3Initializer,
  ColorArrayWithAlpha,
  createThreadedPlanetWorker,
  DEFAULT_NOISE_PARAMS,
  LatLong,
  Noise,
} from "@hello-worlds/planets"
import { cellToBoundary, latLngToCell } from "h3-js"
import { Color, Line3, Vector3 } from "three"

export type ThreadParams = {
  seed: string
}

const tempLine3 = new Line3()
const tempVec3 = new Vector3()
const distanceToSegment = (position: Vector3, a: Vector3, b: Vector3) => {
  const line = tempLine3.set(a, b)
  const d = line
    .closestPointToPoint(position, false, tempVec3)
    .distanceTo(position)

  if (Number.isNaN(d)) {
    throw new Error("NaN distance")
  }

  return d
}

const heightGenerator: ChunkGenerator3Initializer<ThreadParams, number> = ({
  radius,
  data: { seed },
}) => {
  const terrainNoise = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    seed,
    height: radius / 10,
    scale: radius / 2,
  })
  const size = 4

  const tempLatLongA = new LatLong()
  const tempLatLongB = new LatLong()
  const tempVector3A = new Vector3()
  const tempVector3B = new Vector3()
  return ({ input }) => {
    const latLong = LatLong.cartesianToLatLong(input)

    const h3Index = latLngToCell(latLong.lat, latLong.lon, size)

    // Get the vertices of the hexagon
    const hexBoundary = cellToBoundary(h3Index)
    let distance = Infinity
    for (let i = 0; i < hexBoundary.length; i++) {
      const hexBoundaryPoint = hexBoundary[i]
      tempLatLongA.set(hexBoundaryPoint[0], hexBoundaryPoint[1])

      const a = tempLatLongA.toCartesian(radius, tempVector3A)

      let next = hexBoundary[i + 1]

      if (!next) {
        next = hexBoundary[0]
      }

      const b = tempLatLongB
        .set(next[0], next[1])
        .toCartesian(radius, tempVector3B)

      const d = distanceToSegment(input, a, b)
      distance = Math.min(distance, d)
    }
    return distance
  }
  // return terrainNoise.getFromVector(input)
}

const colorGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  Color | ColorArrayWithAlpha
> = props => {
  const color = new Color(Math.random() * 0xffffff)
  return () => {
    return color
  }
}

createThreadedPlanetWorker<ThreadParams>({
  heightGenerator,
  colorGenerator,
})
