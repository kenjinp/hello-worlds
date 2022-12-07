import {
  random,
  randomRange,
  randomRangeInt,
  setRandomSeed,
} from "@site/../../packages/core/dist/esm"
import { remap } from "@site/../../packages/planets/dist/esm"
import { Language } from "@site/../../packages/tongues/dist/esm"
import { world } from "@site/src/components/world-builder/WorldBuilder.ecs"
import {
  AU,
  EARTH_RADIUS,
  MOON_DISTANCE,
  MOON_RADIUS,
  SUN_RADIUS,
} from "@site/src/components/world-builder/WorldBuilder.math"
import { PlANET_TYPES } from "@site/src/components/world-builder/WorldBuilder.state"
import * as React from "react"
import { Color, MathUtils, Vector3 } from "three"
import FlyCamera from "./FlyCamera"

setRandomSeed("AtmosphereExperiment")
const language = new Language()

export class AtmosphereGenerator {
  constructor() {
    const makePlanetarySystem = () =>
      // distanceToSun: number,
      // sunMass: number,
      {
        console.log("generating planets")
        // lets go simple for now
        const numberOfMoons = 4
        const radius = EARTH_RADIUS
        const planet = world.add({
          id: MathUtils.generateUUID(),
          radius,
          focused: true,
          // camera: (<OrbitCamera />) as React.ReactElement,
          camera: (<FlyCamera />) as React.ReactElement,
          planet: true,
          planetType: PlANET_TYPES.TERRAN,
          atmosphereRadius: radius * 1.2,
          position: new Vector3(),
          name: language.makeWord("planetA"),
          labelColor: new Color(random() * 0xffffff),
          children: [],
        })
        for (let i = 0; i < numberOfMoons - 1; i++) {
          const moon = world.add({
            id: MathUtils.generateUUID(),
            radius: MOON_RADIUS,
            moon: true,
            name: language.makeWord(`moon ${i}`),
            satelliteOf: planet,
            labelColor: new Color(random() * 0xffffff),
            planetType: PlANET_TYPES.LUNAR,
            atmosphereRadius:
              randomRangeInt(0, 2) >= 1
                ? randomRange(radius * 1.01, radius * 1.25)
                : undefined,
            position: new Vector3()
              .randomDirection()
              .setY(0)
              .normalize()
              .multiplyScalar(MOON_DISTANCE / 10)
              .multiplyScalar(randomRange(0.1, 3)),
            children: [],
          })
          planet.children.push(moon)
        }

        return planet
      }

    const sunPosition = new Vector3(-1, 0, 1).multiplyScalar(AU)
    const root = world.add({
      name: language.makeWord("System"),
      position: sunPosition,
    })

    const color = new Color(0x81cbf5)
    // const color = new Color(0xffffff)
    // const color = new Color(0xf48037)

    world.add({
      radius: SUN_RADIUS,
      name: root.name,
      labelColor: color,
      color: color,
      emissive: color,
      lightIntensity: 0.4,
      star: true,
      satelliteOf: root,
      children: [makePlanetarySystem()],
      position: sunPosition,
    })

    const color2 = new Color(0xf48037)

    // world.add({
    //   radius: SUN_RADIUS * 0.18,
    //   name: root.name,
    //   labelColor: color2,
    //   color: color2,
    //   emissive: color2,
    //   lightIntensity: 0.4,
    //   star: true,
    //   satelliteOf: root,
    //   children: [],
    //   position: new Vector3(-1, 0, 1.2).multiplyScalar(AU),
    // })

    console.log(world.entities)
  }

  destroy() {
    world.clear()
  }

  randomizeSuns() {
    // delete suns
    world.entities.forEach(entity => {
      if (entity.star) {
        world.remove(entity)
      }
    })
    // randomize a new amount of suns
    const numberOfSuns = randomRangeInt(1, 3)
    for (let i = 0; i < numberOfSuns; i++) {
      // create some new suns
      const sunPosition = new Vector3(
        -randomRange(0.5, 2),
        0,
        randomRange(0.5, 2),
      ).multiplyScalar(AU)
      const color = new Color(random() * 0xffffff)
      // const color = new Color(0xffffff)
      // const color = new Color(0xf48037)
      const radius = randomRange(SUN_RADIUS * 0.12, SUN_RADIUS * 3)

      world.add({
        radius,
        name: language.makeWord(`Sun ${i}`),
        labelColor: color,
        color: color,
        emissive: color,
        lightIntensity: remap(
          radius,
          SUN_RADIUS * 0.12,
          SUN_RADIUS * 3,
          0.1,
          1.2,
        ),
        star: true,
        children: [],
        position: sunPosition,
      })
    }
  }
}
