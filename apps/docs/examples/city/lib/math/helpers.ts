import { Vector3 } from "three"

export function sign(value: number): number {
  return value == 0 ? 0 : value < 0 ? -1 : 1
}

export function getCardinalDirectionLabel(v1: Vector3, v2: Vector3) {
  const dx = v2.x - v1.x
  const dy = v2.y - v1.y

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "E" : "W"
  } else {
    return dy < 0 ? "N" : "S"
  }
}

export function createBezierCurvePath(vector3Array: THREE.Vector3[]): string {
  const numPoints = vector3Array.length
  if (numPoints < 2) {
    return ""
  }

  let path = "M " + vector3Array[0].x + " " + vector3Array[0].y + " "

  for (let i = 0; i < numPoints - 1; i++) {
    const p0 = vector3Array[i]
    const p1 = vector3Array[i + 1]
    const distance = p0.distanceTo(p1)

    const controlPoint1 = new Vector3(
      p0.x + distance / 20,
      p0.y + distance / 20,
      0,
    )
    const controlPoint2 = new Vector3(
      p1.x - distance / 20,
      p1.y - distance / 20,
      0,
    )

    path += `C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${p1.x} ${p1.y} `
  }

  return path
}
