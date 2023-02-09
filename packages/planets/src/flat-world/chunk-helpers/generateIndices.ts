export const generateIndices = (resolution: number) => {
  const effectiveResolution = resolution + 2
  const indices = []
  for (let i = 0; i < effectiveResolution; i++) {
    for (let j = 0; j < effectiveResolution; j++) {
      indices.push(
        i * (effectiveResolution + 1) + j,
        (i + 1) * (effectiveResolution + 1) + j + 1,
        i * (effectiveResolution + 1) + j + 1,
      )
      indices.push(
        (i + 1) * (effectiveResolution + 1) + j,
        (i + 1) * (effectiveResolution + 1) + j + 1,
        i * (effectiveResolution + 1) + j,
      )
    }
  }
  return indices
}
