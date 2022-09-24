import {
  ChunkGenerator3Initializer,
  createThreadedPlanetWorker,
  DEFAULT_NOISE_PARAMS,
  Lerp,
  LinearSpline,
  Noise,
} from "@hello-worlds/planets"
import { Color, Vector3 } from "three"

// We're not doing anything with this yet
export type ThreadParams = {
  randomPoints: {
    center: Vector3
    radius: number
    floorHeight: number
  }[]
  rimWidth: number
  rimSteepness: number
  smoothness: number
}

// Smooth minimum of two values, controlled by smoothing factor k
// When k = 0, this behaves identically to min(a, b)
function smoothMin(a: number, b: number, k: number) {
  k = Math.max(0, k)
  // https://www.iquilezles.org/www/articles/smin/smin.htm
  const h = Math.max(0, Math.min(1, (b - a + k) / (2 * k)))
  return a * h + b * (1 - h) - k * h * (1 - h)
}

// Smooth maximum of two values, controlled by smoothing factor k
// When k = 0, this behaves identically to max(a, b)
function smoothMax(a: number, b: number, k: number) {
  k = Math.min(0, -k)
  // https://www.iquilezles.org/www/articles/smin/smin.htm
  const h = Math.max(0, Math.min(1, (b - a + k) / (2 * k)))
  return a * h + b * (1 - h) - k * h * (1 - h)
}

const simpleHeight: ChunkGenerator3Initializer<ThreadParams, number> = ({
  initialData: { randomPoints },
  radius,
}) => {
  // const noise = new Noise({
  //   octaves: 50,
  //   persistence: 0.707,
  //   lacunarity: 1.8,
  //   exponentiation: 4.5,
  //   height: 300.0,
  //   scale: radius / 2,
  //   seed: "🌱", // should set this at build time... or sync through net
  //   noiseType: NOISE_STYLES.simplex,
  // });

  const noise4 = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    seed: "banana", // <-important
    height: 1,
    scale: radius / 10,
  })

  const noise3 = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    seed: "banana", // <-important
    height: 5000,
    scale: 5000,
  })

  const noise2 = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    seed: "banana", // <-important
    height: 5000,
    scale: 20_000,
  })

  const noise = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    seed: "banana", // <-important
    height: 5000,
    scale: radius / 10,
  })

  const mountainNoise2 = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    octaves: 5,
    seed: "kiwi", // <-important
    height: 100,
    scale: radius / 2,
  })

  const mountainNoise = new Noise({
    ...DEFAULT_NOISE_PARAMS,
    octaves: 3,
    seed: "apple", // <-important
    height: 10000.0,
    scale: radius,
  })

  return ({ input, data: { rimWidth, rimSteepness, smoothness } }) => {
    const x = mountainNoise2.get(input.x, input.y, input.z)
    const m = mountainNoise.get(input.x * x, input.y * x, input.z * x)
    const n = noise.get(input.x + m, input.y + m, input.z + m) // warped
    const n4 = noise4.get(input.x, input.y, input.z)
    const n3 = noise3.get(input.x, input.y, input.z) * n4
    const n2 = noise2.get(input.x, input.y, input.z)
    let craterHeight = 0
    // TODO optimize by hemisphere, or something
    for (let i = 0; i < randomPoints.length; i++) {
      const currentPoint = randomPoints[i]
      const floorHeight = currentPoint.floorHeight
      const x = input.distanceTo(currentPoint.center) / currentPoint.radius

      const cavity = x * x - 1
      const rimX = Math.min(x - 1 - rimWidth, 0)
      const rim = rimSteepness * rimX * rimX
      let craterShape = smoothMax(cavity, floorHeight, smoothness)
      craterShape = smoothMin(craterShape, rim, smoothness)
      craterHeight += craterShape * currentPoint.radius
    }

    return n + craterHeight + m + x + n2 + n3
  }
}

const colorLerp: Lerp<THREE.Color> = (
  t: number,
  p0: THREE.Color,
  p1: THREE.Color,
) => {
  const c = p0.clone()
  return c.lerp(p1, t)
}

const colorSplines = [
  new LinearSpline<THREE.Color>(colorLerp),
  new LinearSpline<THREE.Color>(colorLerp),
  new LinearSpline<THREE.Color>(colorLerp),
]

// Temp / Aridity
colorSplines[0].addPoint(0.0, new Color(0x37a726))
colorSplines[0].addPoint(0.02, new Color(0x214711))
colorSplines[0].addPoint(0.05, new Color(0x526b48))
colorSplines[0].addPoint(0.1, new Color(0xab7916))
colorSplines[0].addPoint(1.0, new Color(0xbab3a2))

// Humid
// colorSplines[1].addPoint(0.0, new THREE.Color(this.params.humidLow));
// colorSplines[1].addPoint(0.5, new THREE.Color(this.params.humidMid));
// colorSplines[1].addPoint(1.0, new THREE.Color(this.params.humidHigh));

// sea
colorSplines[2].addPoint(0, new Color(0x10313e))
colorSplines[2].addPoint(0.98, new Color(0x1d5a67))
colorSplines[2].addPoint(0.995, new Color(0x469280))

export function remap(
  value: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  return ((value - x1) * (y2 - x2)) / (y1 - x1) + x2
}

const simpleColor: ChunkGenerator3Initializer<ThreadParams, Color> = () => {
  const chunkColor = new Color(Math.random() * 0xffffff)
  const groundColor = new Color(0x8c7961)
  return ({ input }) => {
    // return chunkColor;
    // return groundColor;
    const height = input.z
    const seaLevel = 100

    const c1 = colorSplines[0].get(remap(seaLevel + height, 0, 8_000, 0, 1))
    return c1
  }
}

createThreadedPlanetWorker<ThreadParams, {}>({
  heightGenerator: simpleHeight,
  colorGenerator: simpleColor,
})
