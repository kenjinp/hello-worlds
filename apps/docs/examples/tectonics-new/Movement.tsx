import { cellToLatLng } from "h3-js"
import * as React from "react"
import { Color, Float32BufferAttribute, Mesh, Vector3 } from "three"
import { LatLong } from "./tectonics/LatLong"
import { Plate, Tectonics } from "./tectonics/Tectonics"

function buildArrow(
  verts: number[],
  colors: number[],
  position: Vector3,
  direction: Vector3,
  normal: Vector3,
  baseWidth: number,
  color: Color,
) {
  if (direction.lengthSq() === 0) return
  const sideOffset = direction
    .clone()
    .cross(normal)
    .setLength(baseWidth / 2)
  const vec0 = position.clone().add(sideOffset)
  const vec1 = position.clone().add(direction)
  const vec2 = position.clone().sub(sideOffset)
  verts.push(
    vec0.x,
    vec0.y,
    vec0.z,
    vec1.x,
    vec1.y,
    vec1.z,
    vec2.x,
    vec2.y,
    vec2.z,
  )
  colors.push(
    color.r,
    color.g,
    color.b,
    color.r,
    color.g,
    color.b,
    color.r,
    color.g,
    color.b,
  )
}

// TODO will have to get this value from usePlanet();
const planetOrigin = new Vector3(0, 0, 0)
const tempLatLong = new LatLong(0, 0)
const _tempColor = new Color()
export const PlateMovement: React.FC<{ tectonics: Tectonics }> = ({
  tectonics,
}) => {
  const meshRef = React.useRef<Mesh>(null)

  React.useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) {
      return
    }

    console.log("generating movement markers", tectonics.uuid)
    const verts: number[] = []
    const colors: number[] = []
    const plates = Array.from(tectonics.plates.values())

    for (let p = 0; p < tectonics.plates.size; p++) {
      const plate = plates[p] as Plate
      if (!plate) {
        console.log("plate not found", p)
        continue
      }
      const regions = Array.from(plate.indices.values())
      for (let r = 0; r < regions.length; r++) {
        const plateRegion = regions[r]
        if (!plateRegion) {
          console.log("region not found", r)
          continue
        }
        const centerLatLong = cellToLatLng(plateRegion)
        tempLatLong.set(centerLatLong[0], centerLatLong[1])
        const cellOrigin = tempLatLong.toCartesian(
          plate.data.radius + 20_000,
          new Vector3(),
        )
        const movement = plate.calculateMovement(cellOrigin)
        const normal = new Vector3()
          .randomDirection()
          .clone()
          .subVectors(cellOrigin, planetOrigin)
        _tempColor.set(Math.random() * 0xffffff)
        const plateMovementColor = plate.data.color
          .clone()
          .lerp(_tempColor, 0.1)
        buildArrow(
          verts,
          colors,
          cellOrigin,
          movement.divideScalar(2),
          normal,
          movement.length() / 4,
          plateMovementColor,
        )
      }
    }

    meshRef.current.geometry.setAttribute(
      "position",
      new Float32BufferAttribute(verts, 3),
    )
    meshRef.current.geometry.setAttribute(
      "color",
      new Float32BufferAttribute(colors, 3),
    )

    return () => {
      if (!mesh) {
        return
      }
      mesh.children.forEach(child => child.removeFromParent())
    }
  }, [tectonics.uuid, meshRef])

  return (
    <mesh ref={meshRef}>
      <bufferGeometry />
      <meshBasicMaterial vertexColors />
    </mesh>
  )
}
