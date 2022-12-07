import {
  random,
  randomRange,
  randomRangeInt,
  setRandomSeed,
} from "@site/../../packages/core/dist/esm"
import { Language } from "@site/../../packages/tongues/dist/esm"
import { Color, MathUtils, Vector3 } from "three"
// import { ExplorerEntity } from "./Explorers"
import { getRandomBias, randomSkewNormal } from "@hello-worlds/planets"
import * as React from "react"
import { Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"
import { world } from "./WorldBuilder.ecs"
import {
  AU,
  EARTH_RADIUS,
  MARS_RADIUS,
  MOON_DISTANCE,
  MOON_RADIUS,
  SUN_RADIUS,
} from "./WorldBuilder.math"
import { PlANET_TYPES } from "./WorldBuilder.state"

setRandomSeed("WorldBuilder")
const language = new Language()

export const BiasRenderer: React.FC<{
  min: number
  max: number
  bias: number
  influence: number
  iterations: number
}> = ({ min, max, bias, influence, iterations }) => {
  const ref = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = ref.current
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext("2d")

    ;(function loop() {
      for (var i = 0; i < 5; i++) {
        ctx.fillStyle = "red"
        ctx.fillRect(399, 0, 2, 110) // draw bias target
        ctx.fillStyle = "rgba(1,1,1,0.07)"
        // just sub-frames (speedier plot)
        ctx.fillRect(getRandomBias(0, 600, 400, 1.0), 4, 2, 50)
        ctx.fillRect(randomSkewNormal(0, 600, 1), 55, 2, 50)
        ctx.fillRect(Math.random() * 600, 115, 2, 35)
      }
      requestAnimationFrame(loop)
    })()
  }, [ref, bias])

  return <canvas ref={ref} width={600}></canvas>
}

const moonSizeDistribution = () => {
  // 10k to
  // return randomSkewNormal(10_000, MARS_RADIUS, 10)
  return getRandomBias(10_000, MARS_RADIUS, MARS_RADIUS * 0.1, 1.0)
}

const moonAmountDistribution = () => {
  return Math.floor(randomSkewNormal(0, 50, 4))
}

export const makePlanetarySystem = () =>
  // distanceToSun: number,
  // sunMass: number,
  {
    console.log("generating planets")
    // lets go simple for now
    const numberOfMoons = moonAmountDistribution()
    const radius = randomRange(MOON_RADIUS, EARTH_RADIUS * 1.5)
    const planet = world.add({
      id: MathUtils.generateUUID(),
      radius,
      planet: true,
      planetType: PlANET_TYPES.TERRAN,
      atmosphereRadius:
        randomRangeInt(0, 2) >= 1
          ? randomRange(radius * 1.01, radius * 1.25)
          : undefined,
      position: new Vector3()
        .randomDirection()
        .setY(0)
        .normalize()
        .multiplyScalar(AU)
        .multiplyScalar(randomRange(0.3, 3)),
      name: language.makeWord("planetA"),
      labelColor: new Color(random() * 0xffffff),
      children: [],
    })
    for (let i = 0; i < numberOfMoons - 1; i++) {
      const moon = world.add({
        id: MathUtils.generateUUID(),
        radius: moonSizeDistribution(),
        moon: true,
        name: language.makeWord(`moon ${i}`),
        satelliteOf: planet,
        labelColor: new Color(random() * 0xffffff),
        planetType: PlANET_TYPES.LUNAR,
        position: new Vector3()
          .randomDirection()
          .setY(0)
          .normalize()
          .multiplyScalar(MOON_DISTANCE)
          .multiplyScalar(randomRange(0.1, 3)),
        children: [],
      })
      planet.children.push(moon)
    }

    return planet
  }

export const generateWorlds = () => {
  console.log("Generating solar system")

  const root = world.add({
    name: language.makeWord("System"),
    position: new Vector3(),
  })

  const color = new Color(0x81cbf5)

  const sun = world.add({
    radius: SUN_RADIUS,
    name: root.name,
    labelColor: color,
    color: color,
    emissive: color,
    lightIntensity: 0.4,
    star: true,
    satelliteOf: root,
    children: new Array(randomRangeInt(1, 4)).fill(0).map(makePlanetarySystem),
    position: new Vector3(),
  })

  sun.children.forEach((planet, index) => {
    planet.satelliteOf = sun
    planet.index = index
  })
}

export const calculateOrbitalRotationSpeed = (
  distance: number,
  mass: number,
) => {
  const G = 6.67408e-11
  const speed = Math.sqrt((G * mass) / distance) / AU
  return speed
}

export const Distribution: React.FC = () => {
  // let n = 10000
  // let step = 1
  // let max = 100
  // let min = 0
  // let data: Record<string, number> = {}

  // // const round_to_precision = (x, precision) => {
  // //   var y = +x + (precision === undefined ? 0.5 : precision / 2)
  // //   return y - (y % (precision === undefined ? 1 : +precision))
  // // }

  // // Seed data with a bunch of 0s
  // for (let j = min; j < max; j += step) {
  //   data[j] = 0
  // }

  // // Create n samples between min and max
  // for (let i = 0; i < n; i += step) {
  //   let rand_num = randomSkewNormal(min, max, 1)
  //   // let rounded = round_to_precision(rand_num, step)
  //   data[rand_num] += 1
  // }

  // // Count number of samples at each increment
  // let hc_data = []
  // for (const [key, val] of Object.entries(data)) {
  //   hc_data.push({ x: parseFloat(key), y: val / n })
  // }

  // // Sort
  // hc_data = hc_data.sort(function (a, b) {
  //   if (a.x < b.x) return -1
  //   if (a.x > b.x) return 1
  //   return 0
  // })

  let numberOfPoints = 1000
  const data = []

  for (let i = 0; i < numberOfPoints - 1; i++) {
    data.push({
      x: randomSkewNormal(0, 10_000, 0.25) + 10_000 / 2,
      // x1: randomNormals(),
    })
  }

  // data.sort(function (a, b) {
  //   if (a.x < b.x) return -1
  //   if (a.x > b.x) return 1
  //   return 0
  // })

  console.log({ data })

  return (
    <>
      <BiasRenderer />
      <LineChart
        title="Distribution"
        width={900}
        height={500}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <XAxis />
        <YAxis />
        <Tooltip />
        {/* <CartesianGrid stroke="#eee" strokeDasharray="5 5" /> */}
        <Line type="monotone" dataKey="x" stroke="#8884d8" dot={false} />
        {/* <Line type="monotone" dataKey="x" stroke="#82ca9d" dot={false} /> */}
        {/* <Line type="monotone" dataKey="pv" stroke="#82ca9d" /> */}
      </LineChart>
    </>
  )
}
