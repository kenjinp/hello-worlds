/* eslint no-restricted-globals: 0 */

import { terra } from "@game/generators"
import { heightGenerator } from "@game/generators/all"
import { LatLong, remap } from "@hello-worlds/planets"
import { Color, Vector3 } from "three"
import { match } from "ts-pattern"

const _tempLatLong = new LatLong()
const _tempVec3 = new Vector3()
const _tempVec3B = new Vector3()

function makeMap({ ctx, width, height, planet }) {
  const color = new Color(Math.random() * 0xffffff)
  const planetPosition = new Vector3(
    planet.position.x,
    planet.position.y,
    planet.position.z,
  )
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = color.getStyle()
  ctx.fillRect(0, 0, width, height)
  const image = ctx.getImageData(0, 0, width, height)
  console.log({ planetInWorker: planet })
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
  const generators = {
    heightGenerator: heightGenerator({
      radius: planet.radius,
      data: planet.data,
      inverted: planet.inverted,
    }),
    colorGenerator: terra.colorGenerator({
      radius: planet.radius,
      data: planet.data,
      inverted: planet.inverted,
    }),
  }
  ctx.fillStyle = `#${color.getHexString()}`
  ctx.fillRect(0, 0, 500, 1000)
  const data = image.data
  // draw the map
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const i = x * 4 + y * 4 * width
      color.set(Math.random() * 0xffffff)
      const xPolar = remap(x, 0, width, -180, 180)
      const yPolar = remap(height - y, 0, height, -90, 90)
      _tempLatLong.set(yPolar, xPolar)
      const cartesian = _tempLatLong
        .toCartesian(planet.radius, _tempVec3)
        .sub(planet.position)
      const h = generators.heightGenerator({
        input: cartesian,
        worldPosition: cartesian,
        radius: planet.radius,
        offset: planetPosition,
        origin: planetPosition,
        inverted: planet.inverted,
      })
      const c = generators.colorGenerator({
        input: _tempVec3B.set(cartesian.x, cartesian.y, h),
        worldPosition: cartesian,
        radius: planet.radius,
        origin: planetPosition,
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
}

let canvas: HTMLCanvasElement
let canvasCtx: CanvasRenderingContext2D

self.onmessage = function (e) {
  match(e.data.msg)
    .with("init", () => {
      canvas = e.data.canvas
      canvasCtx = canvas.getContext("2d")
    })
    .with("paint", () => {
      console.time(`painting map for ${e.data.planet.name}`)
      makeMap({
        ctx: canvasCtx,
        width: canvas.width,
        height: canvas.height,
        planet: e.data.planet,
      })
      console.timeEnd(`painting map for ${e.data.planet.name}`)
      postMessage({
        msg: "done",
      })
    })
    .otherwise(() => {
      console.log(`No message handler for ${e.data.msg}`)
    })
}
