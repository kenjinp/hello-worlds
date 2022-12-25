import { Entity } from "@game/Entity"
import { capitalize } from "@hello-worlds/core"
import * as React from "react"
import { Color } from "three"
import {
  doClosePreviewTooltip,
  doFocusObjectDescription,
  doPreviewTooltip,
} from "../Actions"
import docs from "./index"

// const query = world.archetype("window").without("closed", "minimized")
// export const RenderWindows: React.FC = () => {
//   const [render, setRender] = React.useState(0)

//   const rerender = () => {
//     setRender(render + 1)
//   }
//   const { entities } = useEntities(query)

//   return (
//     <>
//       {entities.map(window => {
//         const handleClose = window.closable
//           ? () => {
//               world.remove(window)
//             }
//           : undefined
//         return (
//           <Container
//             key={window.id}
//             style={{
//               width: "500px",
//               height: "500px",
//               zIndex: window.zIndex || 0,
//             }}
//             header={window.header}
//             headerColor={window.headerColor}
//             center
//             onClose={handleClose}
//             onClick={() => {
//               doBringToFront(window)
//               rerender()
//             }}
//             onMinimize={() => {
//               world.addComponent(window, "minimized", true)
//               console.log("MINIMIZE", window)
//             }}
//           >
//             {window.content}
//           </Container>
//         )
//       })}
//     </>
//   )
// }

export const Tooltip: React.FC<
  React.PropsWithChildren<{ name: keyof typeof docs; entity?: Entity }>
> = ({ children, name, entity }) => {
  const handleClick: React.MouseEventHandler<HTMLSpanElement> = e => {
    doFocusObjectDescription(name, { x: e.clientX, y: e.clientY }, entity)
  }

  const handleMouseEnter: React.MouseEventHandler<HTMLSpanElement> = e => {
    doPreviewTooltip(name, { x: e.clientX, y: e.clientY }, entity)
  }

  const handleMouseLeave: React.MouseEventHandler<HTMLSpanElement> = e => {
    doClosePreviewTooltip(name, entity)
  }
  return (
    <span
      style={{
        cursor: "pointer",
        color: (entity?.labelColor as Color)?.getStyle() || "inherit",
        textDecorationColor:
          (entity?.labelColor as Color)?.getStyle() || "inherit",
      }}
      className={`tooltip ${name}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <b>{children || capitalize(entity?.name || name)}</b>
    </span>
  )
}
