import { LatLonCoordinates } from "@examples/tectonics/polar-spatial-hash/LatLongCoordinates"
import { doFocusPlanet } from "@game/Actions"
import { archetypes, Entity } from "@game/Entity"
import { remap } from "@hello-worlds/planets"
import { useEntities } from "miniplex/react"
import * as React from "react"
import { match } from "ts-pattern"
const MapWorkerMaker = () =>
  new Worker(new URL("./Map.worker", import.meta.url))

function PlanetMapInner(
  props: {
    entity: Entity
    // onMapMove?: (worldPosition: Vector3) => void
  },
  forwardedRef: React.ForwardedRef<HTMLCanvasElement>,
) {
  const offscreen = React.useRef<OffscreenCanvas>(null)
  const [mapWorker] = React.useState(() => MapWorkerMaker())
  const { entities } = useEntities(archetypes.godCamera)
  const { entity } = props
  const planet = entity.helloPlanet
  const ref = React.useRef<HTMLCanvasElement>(null)
  const [hovering, setHovering] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const toolTipRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const canvasRef = ref.current
    const offscreenRef = offscreen.current
    console.log({ planet, entity })
    if (canvasRef) {
      if (!offscreenRef) {
        offscreen.current = canvasRef.transferControlToOffscreen()
        mapWorker.postMessage(
          {
            msg: "init",
            canvas: offscreen.current,
          },
          [offscreen.current],
        )
      }
      setLoading(true)
      mapWorker.postMessage({
        msg: "paint",
        planet: {
          radius: planet.radius,
          position: planet.position,
          inverted: planet.inverted,
          name: entity.name,
          data: { ...planet.data, seaLevel: entity.seaLevel, isMap: true },
        },
      })
      mapWorker.onmessage = e => {
        match(e.data.msg)
          .with("done", () => {
            setLoading(false)
          })
          .otherwise(() => {
            console.log(`unknown message: ${e.data.msg}`)
          })
      }
    }
  }, [planet.uuid])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {}

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cameraEntity = entities[0]

    const canvasRef = ref.current
    if (canvasRef) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const width = rect.width
      const height = rect.height
      const xPolar = remap(x, 0, width, -180, 180)
      const yPolar = remap(height - y, 0, height, -90, 90)
      const latlong = new LatLonCoordinates(xPolar, yPolar)
      console.log(latlong)
      cameraEntity.lat = latlong.lat
      cameraEntity.long = latlong.lon
      if (!entity.isFocused) {
        doFocusPlanet(entity)
      }
    }
  }

  return (
    <div>
      <div
        style={{
          position: "relative",
          minHeight: "250px",
          minWidth: "500px",
          width: "100%",
          height: "100%",
        }}
      >
        <div
          style={{
            color: "black",
            position: "absolute",
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {loading && <div>Loading...</div>}
        </div>
        <canvas
          width="500"
          height="250"
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "white",
            boxSizing: "border-box",
          }}
          ref={canvasRef => {
            ref.current = canvasRef
            if (forwardedRef) {
              forwardedRef.current = canvasRef
            }
          }}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
        />
      </div>

      <div ref={toolTipRef} style={{ padding: "1em", width: "500px" }}></div>
    </div>
  )
}

export const PlanetMap = React.forwardRef(PlanetMapInner) as <D>(
  props: {
    entity: Entity
    // onMapMove?: (worldPosition: Vector3) => void
    // onClick?: (worldPosition: Vector3) => void
  } & {
    ref?: React.ForwardedRef<HTMLCanvasElement>
  },
) => ReturnType<typeof PlanetMapInner>
