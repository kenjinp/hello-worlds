import { world } from "@game/ECS"
import { Entity, PLANET_TYPES } from "@game/Entity"
import {
  AU,
  EARTH_RADIUS,
  MOON_DISTANCE,
  MOON_RADIUS,
  SUN_RADIUS,
} from "@game/Math"
import {
  capitalize,
  random,
  randomRange,
  randomRangeInt,
  randomSign,
  setRandomSeed,
} from "@hello-worlds/core"
import { remap } from "@hello-worlds/planets"
import { Language } from "@hello-worlds/tongues"
import * as React from "react"
import { Color, MathUtils, Vector3 } from "three"

setRandomSeed("hello world again")

export function System() {
  React.useLayoutEffect(() => {
    const system = new SystemGenerator()
    return () => {
      system.destroy()
    }
  }, [])
  return null
}

export class SystemGenerator {
  language: Language = new Language()
  root: Entity
  constructor() {
    const language = this.language

    const makePlanetarySystem = () =>
      // distanceToSun: number,
      // sunMass: number,
      {
        // lets go simple for now
        const numberOfMoons = 4
        const radius = EARTH_RADIUS
        const planet = world.add({
          id: MathUtils.generateUUID(),
          radius,
          clouds: true,
          isFocused: true,
          seaLevel: 2_500,
          planet: true,
          planetType: PLANET_TYPES.TERRAN,
          atmosphereRadius: radius * 1.01,
          position: new Vector3(),
          name: capitalize(language.makeWord("planetA")),
          labelColor: new Color(random() * 0xffffff),
          children: [],
          gravity: 9.8,
        })
        for (let i = 0; i < numberOfMoons - 1; i++) {
          const position = new Vector3()
            .setX(random() * randomSign())
            .setZ(random() * randomSign())
            .setY(0)
            .normalize()
            .setY(0)
            .multiplyScalar((MOON_DISTANCE * randomRange(0.5, 3)) / 10)

          const moon = world.add({
            id: MathUtils.generateUUID(),
            radius: MOON_RADIUS,
            gravity: 1.62,
            moon: true,
            name: capitalize(language.makeWord(`moon ${i}`)),
            satelliteOf: planet,
            labelColor: new Color(random() * 0xffffff),
            planetType: PLANET_TYPES.LUNAR,
            parentIndex: i,
            atmosphereRadius:
              randomRangeInt(0, 2) >= 1
                ? randomRange(MOON_RADIUS * 1.01, MOON_RADIUS * 1.05)
                : undefined,
            position,
            children: [],
          })
          planet.children.push(moon)
        }

        return planet
      }

    const sunPosition = new Vector3(-1, 0, 1).multiplyScalar(AU)
    const root = world.add({
      id: MathUtils.generateUUID(),
      name: capitalize(language.makeWord("System")),
      type: "system",
      position: sunPosition,
      children: [],
    })
    this.root = root

    // const color = new Color(0x81cbf5)
    const color = new Color(0xffffff)

    const sun = world.add({
      radius: SUN_RADIUS,
      id: MathUtils.generateUUID(),
      name: capitalize(root.name),
      labelColor: color,
      color: color,
      emissive: color,
      lightIntensity: 0.6,
      star: true,
      satelliteOf: root,
      children: [makePlanetarySystem()],
      position: sunPosition,
    })

    root.children.push(sun)

    sun.children.forEach((child, index) => {
      child.satelliteOf = sun
      child.parentIndex = index
    })

    // create Player
    // Put the character between the planet and the sun
    // So that I don't go crazy thinking I didn't set up the lighting right :D

    const mainPlanetPosition = sun.children[0].position

    // const position = mainPlanetPosition
    //   .clone()
    //   .sub(sun.position)
    //   .normalize()
    //   .negate()
    //   .multiplyScalar(EARTH_RADIUS * 1.1)

    // world.add({
    //   isPlayer: true,
    //   isCurrentPlayer: true,
    //   affectedByGravity: true,
    //   position,
    //   closestAstronomicalObject: null,
    //   velocity: new Vector3(),
    //   focused: true,
    // })
  }

  destroy() {
    world.clear()
  }

  randomizeSuns() {
    const language = this.language
    const root = this.root
    const children = []
    // delete suns
    world.with("star").entities.forEach(entity => {
      if (entity.star) {
        if (entity.children) {
          children.push(...entity.children)
        }
        world.remove(entity)
      }
    })

    root.children = []

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

      const newSun = world.add({
        radius,
        name: capitalize(language.makeWord(`Sun ${i}`)),
        id: MathUtils.generateUUID(),
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
      if (i === 0) {
        children.forEach((child, index) => {
          child.satelliteOf = newSun
          child.parentIndex = index
        })
        newSun.children.push(...children)
      }
      root.children.push(newSun)
    }
  }
}
