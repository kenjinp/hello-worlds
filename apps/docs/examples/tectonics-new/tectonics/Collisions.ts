export interface CollisionProps {
  distanceToPlateBoundary: number
  distanceToPlateRoot: number
  boundaryElevation: number
  plateElevation: number
  pressure: number
  shear: number
}

export function calculateCollidingElevation(
  distanceToPlateBoundary: number,
  distanceToPlateRoot: number,
  boundaryElevation: number,
  plateElevation: number,
  pressure: number,
  shear: number,
) {
  let t =
    distanceToPlateBoundary / (distanceToPlateBoundary + distanceToPlateRoot)
  if (t < 0.5) {
    t = t / 0.5
    return (
      plateElevation + Math.pow(t - 1, 2) * (boundaryElevation - plateElevation)
    )
  } else {
    return plateElevation
  }
}

export function calculateSuperductingElevation(
  distanceToPlateBoundary: number,
  distanceToPlateRoot: number,
  boundaryElevation: number,
  plateElevation: number,
  pressure: number,
  shear: number,
) {
  let t =
    distanceToPlateBoundary / (distanceToPlateBoundary + distanceToPlateRoot)
  if (t < 0.2) {
    t = t / 0.2
    return (
      boundaryElevation +
      t * (plateElevation - boundaryElevation + pressure / 2)
    )
  } else if (t < 0.5) {
    t = (t - 0.2) / 0.3
    return plateElevation + (Math.pow(t - 1, 2) * pressure) / 2
  } else {
    return plateElevation
  }
}

export function calculateSubductingElevation(
  distanceToPlateBoundary: number,
  distanceToPlateRoot: number,
  boundaryElevation: number,
  plateElevation: number,
  pressure: number,
  shear: number,
) {
  let t =
    distanceToPlateBoundary / (distanceToPlateBoundary + distanceToPlateRoot)
  return (
    plateElevation + Math.pow(t - 1, 2) * (boundaryElevation - plateElevation)
  )
}

export function calculateDivergingElevation(
  distanceToPlateBoundary: number,
  distanceToPlateRoot: number,
  boundaryElevation: number,
  plateElevation: number,
  pressure: number,
  shear: number,
) {
  let t =
    distanceToPlateBoundary / (distanceToPlateBoundary + distanceToPlateRoot)
  if (t < 0.3) {
    t = t / 0.3
    return (
      plateElevation + Math.pow(t - 1, 2) * (boundaryElevation - plateElevation)
    )
  } else {
    return plateElevation
  }
}

export function calculateShearingElevation(
  distanceToPlateBoundary: number,
  distanceToPlateRoot: number,
  boundaryElevation: number,
  plateElevation: number,
  pressure: number,
  shear: number,
) {
  let t =
    distanceToPlateBoundary / (distanceToPlateBoundary + distanceToPlateRoot)
  if (t < 0.2) {
    t = t / 0.2
    return (
      plateElevation + Math.pow(t - 1, 2) * (boundaryElevation - plateElevation)
    )
  } else {
    return plateElevation
  }
}

export function calculateDormantElevation(
  distanceToPlateBoundary: number,
  distanceToPlateRoot: number,
  boundaryElevation: number,
  plateElevation: number,
  pressure: number,
  shear: number,
) {
  let t =
    distanceToPlateBoundary / (distanceToPlateBoundary + distanceToPlateRoot)
  let elevationDifference = boundaryElevation - plateElevation
  // let a = 2 * elevationDifference
  // let b = -3 * elevationDifference
  return t * t * elevationDifference * (2 * t - 3) + boundaryElevation
}
