import { usePlanet } from "@hello-worlds/react"
import { useCallback, useMemo } from "react"
import { Vector3 } from "three"
import { heightGenerator } from "./Moonworker.generators"

// TODO: find a way to generalize this
// TODO: this should be cached somehow?

class Vector3Cache<T> {
  private cache: Map<string, T>
  private maxSize: number

  constructor(maxSize: number) {
    this.cache = new Map<string, T>()
    this.maxSize = maxSize
  }

  getValue(key: Vector3): T | undefined {
    const cacheKey = this.getCacheKey(key)
    return this.cache.get(cacheKey)
  }

  setValue(key: Vector3, value: T): void {
    const cacheKey = this.getCacheKey(key)

    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(cacheKey, value)
  }

  private getCacheKey(key: Vector3): string {
    return `${key.x}-${key.y}-${key.z}`
  }
}

const tempPosition = new Vector3()
const tempElevation = new Vector3()
const tempDir = new Vector3()
const cacheLimit = 50
const cache = new Vector3Cache<{
  elevation: number
  pointOnPlanet: Vector3
}>(cacheLimit)
export function useGetExactPlanetaryElevation() {
  const planet = usePlanet()
  const elevationFunc = useMemo(() => {
    return heightGenerator(planet)
  }, [planet])
  const getExactPlanetaryElevation = useCallback(
    function getExactPlanetaryElevation(fromPosition: Vector3) {
      const val = cache.getValue(fromPosition)
      if (val) {
        return val
      }
      // get direction (normalized vector) from core to character
      // then multiply it by distance

      const dirToPlanet = tempPosition
        .copy(fromPosition)
        .sub(planet.position)
        .normalize()

      const pointOnPlanetDatumSphere = tempDir
        .copy(dirToPlanet)
        .multiplyScalar(planet.radius)

      // @ts-ignore
      const elevation = elevationFunc({
        radius: planet.radius,
        inverted: planet.inverted,
        data: planet.data,
        input: pointOnPlanetDatumSphere,
      })

      const pointOnPlanet = tempElevation
        .copy(dirToPlanet)
        .multiplyScalar(planet.radius + elevation)

      const returnValue = {
        elevation,
        pointOnPlanet,
        pointOnPlanetDatumSphere,
      }

      cache.setValue(fromPosition, returnValue)

      // TODO I need better types for the HeightGenerator output function params!
      return returnValue
    },
    [elevationFunc],
  )

  return getExactPlanetaryElevation
}
