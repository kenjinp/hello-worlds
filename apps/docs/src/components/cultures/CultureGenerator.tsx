import { Kingdom } from "@hello-worlds/cultures"
import * as React from "react"
import { MathUtils, Vector3 } from "three"
import { ECS } from "../../state/ecs"

export const CultureGenerator: React.FC<{ numberOfKingdoms?: number }> = ({
  numberOfKingdoms = MathUtils.randInt(30, 50),
}) => {
  React.useEffect(() => {
    Array(numberOfKingdoms)
      .fill(0)
      .map(() =>
        ECS.world.createEntity({
          position: new Vector3(),
          kingdom: new Kingdom(),
        }),
      )
  }, [])

  return null
}

export default CultureGenerator
