import { LatLonCoordinates } from "@examples/tectonics/polar-spatial-hash/LatLongCoordinates"
import { polarToCartesian } from "@examples/tectonics/voronoi/math"
import { doFocusPlanet } from "@game/Actions"
import { world } from "@game/ECS"
import { archetypes, Entity } from "@game/Entity"
import { terra } from "@game/generators"
import { heightGenerator } from "@game/generators/all"
import { remap } from "@hello-worlds/planets"
import { useEntities } from "miniplex/react"
import * as React from "react"
import { Color, Vector3 } from "three"

const tempVector3 = new Vector3()

function PlanetMapInner(
  props: {
    entity: Entity
    // onMapMove?: (worldPosition: Vector3) => void
  },
  forwardedRef: React.ForwardedRef<HTMLCanvasElement>,
) {
  const { entities } = useEntities(archetypes.planetOrMoon)
  const { entity } = props
  const planet = entity.helloPlanet
  const ref = React.useRef<HTMLCanvasElement>(null)
  const [hovering, setHovering] = React.useState(false)
  const toolTipRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const canvasRef = ref.current
    if (canvasRef) {
      const ctx = canvasRef.getContext("2d") as CanvasRenderingContext2D
      const width = ctx.canvas.width
      const height = ctx.canvas.height
      const color = new Color(Math.random() * 0xffffff)
      ctx.clearRect(0, 0, width, height)
      const image = ctx.getImageData(0, 0, width, height)
      const data = image.data
      console.log("BLIP", {
        data,
        r: color.r,
        g: color.g,
        b: color.b,
      })

      const labels = [
        {
          label: "Arctic Circle",
          yPolar: 66.5,
        },
        {
          label: "Tropic of Cancer",
          yPolar: 23.5,
        },
        {
          label: "Equator",
          yPolar: 0,
        },
        {
          label: "Tropic of Capricorn",
          yPolar: -23.5,
        },
        {
          label: "Antarctic Circle",
          yPolar: -66.5,
        },
      ]

      if (ctx) {
        const generators = {
          heightGenerator: heightGenerator({
            radius: planet.radius,
            data: planet.data,
            inverted: planet.inverted,
          }),
          colorGenerator: terra.colorGenerator({
            radius: planet.radius,
            data: { ...planet.data, seaLevel: entity.seaLevel },
            inverted: planet.inverted,
          }),
        }

        ctx.fillStyle = `#${color.getHexString()}`
        ctx.fillRect(0, 0, 500, 1000)

        // draw the map
        for (let x = 0; x < width; x++) {
          for (let y = 0; y < height; y++) {
            const i = x * 4 + y * 4 * width
            color.set(Math.random() * 0xffffff)

            const xPolar = remap(x, 0, width, -180, 180)
            const yPolar = remap(height - y, 0, height, -90, 90)
            const cartesian = polarToCartesian(
              yPolar,
              xPolar,
              planet.radius,
            ).sub(planet.position)

            const h = generators.heightGenerator({
              input: cartesian,
              worldPosition: cartesian,
              radius: planet.radius,
              offset: planet.position,
              origin: planet.position,
              inverted: planet.inverted,
            })
            const c = generators.colorGenerator({
              input: tempVector3.set(cartesian.x, cartesian.y, h).clone(),
              worldPosition: cartesian,
              radius: planet.radius,
              origin: planet.position,
              height: h,
            })
            color.copy(c)

            // we don't need to draw the coordinate lines
            // if (Math.abs(xPolar % 10) <= 0.25) {
            //   color.set(0x000000)
            // }

            // if (Math.abs(yPolar % 10) <= 0.2) {
            //   color.set("blue")
            // }

            // labels.forEach(({ label, yPolar: yPolarLabel }) => {
            //   if (Math.abs(yPolar - yPolarLabel) <= 0.5) {
            //     color.set("red")
            //   }
            // })

            data[i] = color.r * 256 // I am the red
            data[i + 1] = color.g * 256 // I am the green
            data[i + 2] = color.b * 256 // I am the blue
            data[i + 3] = 1 * 256 // I am the alpha
          }
        }
        // draw the image
        ctx.putImageData(image, 0, 0)
        ctx.font = "14px Arial"
        ctx.fillStyle = "#000000"
        ctx.fillText(planet.name, width / 2, height / 2)

        // planet.data.tectonics.plates.forEach((plate: Plate) => {
        //   ctx.font = "14px Arial"
        //   const [x, y] = plate.startRegion.region.properties.sitecoordinates
        //   const xMap = remap(x, -180, 180, 0, width)
        //   const yMap = remap(-y, -90, 90, 0, height)
        //   ctx.fillText(plate.name, xMap, yMap)
        // })

        // assign labels
        // labels.forEach(({ label, yPolar }) => {
        //   const y = remap(yPolar, -90, 90, height, 0)
        //   ctx.font = "14px Arial"
        //   // console.log(label, y, yPolar)
        //   // ctx.strokeStyle = "#ffffff"
        //   // ctx.strokeText(label, width / 2, y)
        // ctx.fillStyle = "#ffffff"
        // ctx.fillText(label, 0, y)
        // })
      }
    }
  }, [planet.uuid, ref])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // if (toolTipRef.current) {
    //   if (!hovering) {
    //     toolTipRef.current.style.display = "none"
    //   } else {
    //     toolTipRef.current.style.display = "block"
    //     const rect = e.currentTarget.getBoundingClientRect()
    //     const x = e.clientX - rect.left
    //     const y = e.clientY - rect.top
    //     const width = rect.width
    //     const height = rect.height
    //     const xPolar = remap(x, 0, width, -180, 180)
    //     const yPolar = remap(height - y, 0, height, -90, 90)
    //     const cartesian = polarToCartesian(yPolar, xPolar, planet.radius).sub(
    //       planet.position,
    //     )
    //     const closestPlate = Tectonics.findPlateFromCartesian(
    //       planet.data.tectonics,
    //       cartesian,
    //     )
    //     onMapMove(cartesian)
    //     if (closestPlate) {
    //       toolTipRef.current.innerHTML = `x: ${xPolar} <br/> y: ${yPolar} </br>
    //       plate: ${closestPlate.plate.name} </br>
    //       region: ${closestPlate.region.properties.index} </br>
    //       site: ${closestPlate.plate.oceanic ? "oceanic" : "continental"}`
    //     } else {
    //       toolTipRef.current.innerHTML = `x: ${xPolar} <br/> y: ${yPolar}`
    //     }
    //   }
    // }
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // const entity = entities.find(e => (e.helloPlanet.uuid = planet.uuid))

    const canvasRef = ref.current
    if (canvasRef) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const width = rect.width
      const height = rect.height
      const xPolar = remap(x, 0, width, -180, 180)
      const yPolar = remap(height - y, 0, height, -90, 90)
      const latlong = new LatLonCoordinates(yPolar, xPolar)
      console.log("click", entity.longLat)
      world.removeComponent(entity, "longLat")
      world.addComponent(entity, "longLat", [latlong.lon, latlong.lat])
      if (!entity.isFocused) {
        doFocusPlanet(entity)
      }
    }
  }
  // const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
  // const canvasRef = ref.current
  // if (canvasRef) {
  //   const rect = e.currentTarget.getBoundingClientRect()
  //   const x = e.clientX - rect.left
  //   const y = e.clientY - rect.top
  //   const width = rect.width
  //   const height = rect.height
  //   const xPolar = remap(x, 0, width, -180, 180)
  //   const yPolar = remap(height - y, 0, height, -90, 90)
  //   const latlong = new LatLonCoordinates(yPolar, xPolar)
  //     const radius = sphericalSpatialHash.convertSearchRadiusToLatitude(
  //       planet.radius / 10,
  //     )
  //     sphericalSpatialHash.addAllByRadius(latlong, planet.radius / 1000, {
  //       coordinates: latlong,
  //       radius: planet.radius / 10,
  //     })
  //     console.log("things", x, y, xPolar, yPolar, latlong, radius)
  //     const ctx = canvasRef.getContext("2d") as CanvasRenderingContext2D
  //     ctx.beginPath()
  //     ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
  //     ctx.fillStyle = "green"
  //     ctx.fill()
  //     ctx.lineWidth = 5
  //     ctx.strokeStyle = "#003300"
  //     ctx.stroke()
  //     console.log(sphericalSpatialHash)
  //   }
  // }

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

// this is react component that creates a map of a planet using the canvas api
// it is a child of the world builder component
// export const Map: React.FC = () => {
//   const pointerRef = React.useRef<Mesh>(null)
//   const planet = usePlanet()

//   return (
//     <>
//       <mesh ref={pointerRef}>
//         <cylinderGeometry
//           args={[
//             (planet.radius / 100) * 0.95,
//             planet.radius / 100,
//             planet.radius / 10,
//             32,
//           ]}
//         />
//         <meshBasicMaterial color="red" />
//       </mesh>
//       <Html>
//         <Window width={500}>
//           <PlanetMap
//             planet={planet}
//             onMapMove={cartesian => {
//               pointerRef.current.position.copy(cartesian)
//               pointerRef.current.lookAt(planet.position)

//               pointerRef.current.rotateX(Math.PI / 2)
//             }}
//           />
//         </Window>
//       </Html>
//     </>
//   )
// }
