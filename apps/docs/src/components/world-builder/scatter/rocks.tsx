import { Instance } from "@react-three/drei"
import * as React from "react"
import { MathUtils } from "three"
// lol prettier is busted sorry
// it keeps on deleting the react import ;[

const randomVector = r => [
  r / 2 - Math.random() * r,
  r / 2 - Math.random() * r,
  r / 2 - Math.random() * r,
]
const randomEuler = () => [
  Math.random() * Math.PI,
  Math.random() * Math.PI,
  Math.random() * Math.PI,
]

function r({ range }) {
  const randomData = React.useMemo(() =>
    Array.from({ length: MathUtils.clamp(range, 0, 50) }).map(
      () => ({
        position: randomVector(range),
        rotation: randomEuler(),
      }),
      [range],
    ),
  )
  return (
    <>
      {randomData.map((props, i) => (
        <Instance key={i} {...props} />
      ))}
    </>
  )
}

export const Rocks = React.memo(r)
