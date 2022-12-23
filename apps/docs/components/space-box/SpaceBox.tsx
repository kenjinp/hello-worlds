import { useThree } from "@react-three/fiber"
import * as React from "react"
import { Color, CubeTextureLoader } from "three"

export const SpaceBox: React.FC<
  React.PropsWithChildren<{ hideBackground: boolean }>
> = ({ hideBackground, children }) => {
  const { scene } = useThree()
  React.useEffect(() => {
    let background: number = 4
    const back = `/img/spacebox-${background}/back.png`
    const bottom = `/img/spacebox-${background}/bottom.png`
    const front = `/img/spacebox-${background}/front.png`
    const left = `/img/spacebox-${background}/left.png`
    const right = `/img/spacebox-${background}/right.png`
    const top = `/img/spacebox-${background}/top.png`

    const urls = [right, left, top, bottom, front, back]

    const cube = new CubeTextureLoader().load(urls)
    if (hideBackground) {
      scene.background = new Color(0x000000)
      return
    }
    scene.castShadow = true
    scene.background = cube
  }, [hideBackground])

  return <>{children}</>
}
