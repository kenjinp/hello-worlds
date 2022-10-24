import {
  ChunkGenerator3Initializer,
  ColorArrayWithAlpha,
  createThreadedPlanetWorker,
} from "@hello-worlds/planets"
import { Color } from "three"
import { match } from "ts-pattern"
import { cloud, dwarf, simple, terra } from "./generators"
import { PlANET_TYPES } from "./WorldBuilder.state"

export type ThreadParams = {
  seed: string
  type: PlANET_TYPES
}

const heightGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  number
> = props => {
  const {
    data: { type },
  } = props
  const generator = match(type)
    .with(PlANET_TYPES.TERRAN, () => terra.heightGenerator)
    .with(PlANET_TYPES.DWARF, () => dwarf.heightGenerator)
    .with(PlANET_TYPES.CLOUD, () => cloud.heightGenerator)
    .otherwise(() => simple.heightGenerator)
  return generator(props)
}

const colorGenerator: ChunkGenerator3Initializer<
  ThreadParams,
  Color | ColorArrayWithAlpha
> = props => {
  const {
    data: { type },
  } = props
  const generator = match(type)
    .with(PlANET_TYPES.TERRAN, () => terra.colorGenerator)
    .with(PlANET_TYPES.DWARF, () => dwarf.colorGenerator)
    .with(PlANET_TYPES.CLOUD, () => cloud.colorGenerator)
    .otherwise(() => simple.colorGenerator)
  return generator(props)
}

createThreadedPlanetWorker<ThreadParams>({
  heightGenerator,
  colorGenerator,
})
