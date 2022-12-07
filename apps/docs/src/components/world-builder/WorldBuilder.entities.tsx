import * as React from "react"
import { Planets } from "./render/Planets"
import { Stars } from "./render/Stars"
import { world } from "./WorldBuilder.ecs"
import { generateWorlds } from "./Worldbuilder.generator"

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
