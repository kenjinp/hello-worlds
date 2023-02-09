import { PLANET_TYPES } from "@game/Entity"
import {
  ChunkGenerator3Initializer,
  ColorArrayWithAlpha,
} from "@hello-worlds/planets"
import { Color } from "three"
import { match } from "ts-pattern"
import { cloud, dwarf, ocean, simple, strange, terra } from "./index"

export type ThreadParams = {
  seed: string
  type: PLANET_TYPES
  seaLevel?: number
}

export const heightGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  number
> = props => {
  const {
    data: { type },
  } = props
  const generator = match(type)
    .with(PLANET_TYPES.TERRAN, () => terra.heightGenerator)
    .with(PLANET_TYPES.DWARF, () => dwarf.heightGenerator)
    .with(PLANET_TYPES.CLOUD, () => cloud.heightGenerator)
    .with(PLANET_TYPES.OCEAN, () => ocean.heightGenerator)
    .with(PLANET_TYPES.STRANGE, () => strange.heightGenerator)
    .otherwise(() => simple.heightGenerator)
  return generator(props)
}

export const colorGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  Color | ColorArrayWithAlpha
> = props => {
  const {
    data: { type },
  } = props
  const generator = match(type)
    .with(PLANET_TYPES.TERRAN, () => terra.colorGenerator)
    .with(PLANET_TYPES.DWARF, () => dwarf.colorGenerator)
    .with(PLANET_TYPES.CLOUD, () => cloud.colorGenerator)
    .with(PLANET_TYPES.OCEAN, () => ocean.colorGenerator)
    .with(PLANET_TYPES.STRANGE, () => strange.colorGenerator)
    .otherwise(() => simple.colorGenerator)
  return generator(props)
}
