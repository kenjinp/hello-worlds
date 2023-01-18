import { Html } from "@react-three/drei"
import * as React from "react"
import { BufferAttribute, BufferGeometry, Color, Line, Vector3 } from "three"
import BoundaryPoint, { BoundaryTypes } from "./tectonics/Boundary"
import Edge from "./tectonics/Edge"
import { LatLong } from "./tectonics/LatLong"
import Plate from "./tectonics/Plate"
import { Tectonics } from "./tectonics/Tectonics"

// TODO will have to get this value from usePlanet();
const _tempVec3 = new Vector3(0, 0, 0)

export const PlateBoundaries: React.FC<{ tectonics: Tectonics }> = ({
  tectonics,
}) => {
  const edgeList = React.useMemo(
    () => Array.from(tectonics.edges.values()),
    [tectonics],
  )

  return (
    <>
      {edgeList.map(edge => {
        return (
          <EdgeDisplay key={edge.key} edge={edge} radius={tectonics.radius} />
        )
      })}
    </>
  )
}

const boundaryColors = {
  [BoundaryTypes.OCEAN_COLLISION]: new Color(0x2ff3e0),
  [BoundaryTypes.SUBDUCTION]: new Color(0xf51720),
  [BoundaryTypes.SUPERDUCTION]: new Color(0xfa26a0),
  [BoundaryTypes.DIVERGING]: new Color(0xf8d210),
  [BoundaryTypes.SHEARING]: new Color(0xbd90cb),
  [BoundaryTypes.DORMANT]: new Color(0x07bbfc),
}

export const PlateEdges: React.FC<{ tectonics: Tectonics }> = ({
  tectonics,
}) => {
  const plateList = React.useMemo(
    () => Array.from(tectonics.plates.values()),
    [tectonics],
  )

  return (
    <>
      {plateList.map(plate => {
        return <PlateEdgeLine key={plate.uuid} plate={plate} />
      })}
    </>
  )
}

const _tempLatLong = new LatLong()
export const PlateEdgeLine: React.FC<{ plate: Plate }> = ({ plate }) => {
  const lineRef = React.useRef<Line>(null)

  const lineGeometry = React.useMemo(() => {
    const points = []
    const latLongs = plate.polygon
    for (const latLong of latLongs) {
      points.push(latLong.toCartesian(plate.data.radius * 1.001, _tempVec3))
    }

    return new BufferGeometry().setFromPoints(points)
  }, [plate])

  return (
    <>
      <line ref={lineRef} geometry={lineGeometry}>
        <lineBasicMaterial
          attach="material"
          color={"#9c88ff"}
          linewidth={1000}
          linecap={"round"}
          linejoin={"round"}
        />
      </line>
    </>
  )
}

export const EdgeDisplay: React.FC<{ edge: Edge; radius: number }> = ({
  edge,
  radius,
}) => {
  const lineRef = React.useRef<Line>(null)

  const { points, colors } = React.useMemo(() => {
    const points = []
    const colors = []

    for (const [key, point] of edge.boundaryPoints) {
      points.push(
        ...(point as BoundaryPoint).latLong
          .toCartesian(radius * 1.001, _tempVec3)
          .toArray(),
      )
      const boundaryColor = boundaryColors[point.boundaryType]
      colors.push(...boundaryColor.toArray())
    }
    return {
      points: new BufferAttribute(new Float32Array(points), 3),
      colors: new BufferAttribute(new Float32Array(points), 3),
    }
  }, [edge])

  return (
    <>
      <Html>
        <div>
          <ul>
            {Object.keys(boundaryColors).map(key => {
              return (
                <li
                  key={key}
                  style={{
                    color: boundaryColors[key].getStyle(),
                  }}
                >
                  {key}
                </li>
              )
            })}
          </ul>
        </div>
      </Html>
      <points ref={lineRef}>
        <bufferGeometry>
          {points && (
            <>
              <bufferAttribute attach={"attributes-position"} {...points} />
              <bufferAttribute attach={"attributes-color"} {...colors} />
            </>
          )}
        </bufferGeometry>
        <pointsMaterial
          size={10_000}
          threshold={0.1}
          vertexColors
          sizeAttenuation={true}
        />
      </points>
    </>
  )
}
