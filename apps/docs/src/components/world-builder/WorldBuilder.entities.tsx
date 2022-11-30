import * as React from "react"
import { Planets } from "./render/Planets"
// import { ExplorerEntity } from "./Explorers"
import { Stars } from "./render/Stars"
import { world } from "./WorldBuilder.ecs"
import { generateWorlds } from "./Worldbuilder.generator"

const calculatePolarCoordinateFromSpatialCoordinate = (x, y, z) => {
  //
}

export const RenderEntities: React.FC = () => {
  React.useEffect(() => {
    generateWorlds()
    return () => {
      world.clear()
    }
  })

  return (
    <>
      {/* Render them */}
      <Stars />
      <Planets />
    </>
  )
}
