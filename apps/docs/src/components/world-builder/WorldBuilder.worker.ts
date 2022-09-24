import {
  ChunkGenerator3Initializer,
  createThreadedPlanetWorker,
} from "@hello-worlds/planets"
import { Color } from "three"
import { match } from "ts-pattern"
import { dwarf, simple, terra } from "./generators"
import { PlANET_TYPES } from "./WorldBuilder.state"

export type ThreadParams = {
  seed: string
  type: PlANET_TYPES
}

export type InitialData = {
  initialData: ThreadParams
}

const heightGenerator: ChunkGenerator3Initializer<
  {},
  number,
  InitialData
> = props => {
  const {
    initialData: { type },
  } = props
  const generator = match(type)
    .with(PlANET_TYPES.TERRAN, () => terra.heightGenerator)
    .with(PlANET_TYPES.DWARF, () => dwarf.heightGenerator)
    .otherwise(() => simple.heightGenerator)
  return generator(props)
}

const colorGenerator: ChunkGenerator3Initializer<
  {},
  Color,
  InitialData
> = props => {
  const {
    initialData: { type },
  } = props
  const generator = match(type)
    .with(PlANET_TYPES.TERRAN, () => terra.colorGenerator)
    .with(PlANET_TYPES.DWARF, () => dwarf.colorGenerator)
    .otherwise(() => simple.colorGenerator)
  return generator(props)
}

createThreadedPlanetWorker<ThreadParams, {}>({
  heightGenerator,
  colorGenerator,
})
