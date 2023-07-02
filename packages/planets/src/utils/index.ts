import { Color, Vector3 } from "three"

export const dictIntersection = <T extends object>(dictA: T, dictB: T) => {
  const intersection = {} as T
  for (let k in dictB) {
    if (k in dictA) {
      intersection[k] = dictA[k]
    }
  }
  return intersection
}

export const dictDifference = <T = Record<string, any>>(dictA: T, dictB: T) => {
  const diff = { ...dictA }
  for (let k in dictB) {
    delete diff[k]
  }
  return diff
}

export const tempVector3 = new Vector3()
export const tempColor = new Color()

export const getLODTable = (radius: number, minCellSize: number) => {
  let LODRatio = 0
  let chunkWidth = radius
  const LODValuesIndex: Record<number, number> = {}
  while (LODRatio < 1) {
    LODRatio = minCellSize / chunkWidth
    LODValuesIndex[chunkWidth] = LODRatio
    chunkWidth /= 2
  }
  return LODValuesIndex
}

export const NOOP = () => {
  // noop, required sometimes by TS
}
