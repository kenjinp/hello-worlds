import { RootChunkProps } from "./types"

export const makeRootChunkKey = (child: RootChunkProps) => {
  return (
    child.position.x +
    "/" +
    child.position.y +
    " [" +
    child.size +
    "]" +
    " [" +
    child.index +
    "]"
  )
}
