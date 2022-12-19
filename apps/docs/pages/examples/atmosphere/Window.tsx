import { Button } from "@site/src/components/button/Button"
import { Container } from "@site/src/components/container/Container"
import { ECS, world } from "@site/src/components/world-builder/WorldBuilder.ecs"
import { Entity } from "@site/src/components/world-builder/WorldBuilder.state"
import { useEntities } from "miniplex/react"
import * as React from "react"
import { doBringToFront } from "./Actions"

export const RenderWindow: React.FC<{ entity: Entity }> = ({
  entity: window,
}) => {
  // const [animator] = React.useState(() =>
  //   anime({
  //     targets: `#${window.id}`,
  //     opacity: [0, 1],
  //     easing: "easeInOutExpo",
  //     update: anim => {
  //       console.log("update", anim)
  //     },
  //   }),
  // )
  const handleClose = window.closable
    ? () => {
        world.remove(window)
      }
    : undefined

  // React.useEffect(() => {
  //   animator.play()
  //   return () => {
  //     animator.reverse()
  //   }
  // }, [animator])
  // console.log("RenderWindow", window)
  // return <div>{window.id}</div>

  return (
    <Container
      id={window.id}
      style={{
        width: "500px",
        height: "500px",
        zIndex: window.zIndex || 0,
      }}
      defaultPosition={window.windowPosition}
      header={window.header}
      headerColor={window.headerColor}
      center={!window.windowPosition}
      onClose={handleClose}
      onClick={() => {
        doBringToFront(window)
      }}
      onMinimize={() => {
        world.addComponent(window, "minimized", true)
      }}
    >
      {window.content}
    </Container>
  )
}

const renderWindowsQuery = world
  .with("window")
  .without("closed")
  .without("minimized")
export const RenderWindows: React.FC = () => {
  return (
    <ECS.Entities in={renderWindowsQuery}>
      {window => {
        console.log("maxd window id", window.id)
        return <RenderWindow key={window.id} entity={window} />
      }}
    </ECS.Entities>
  )
}

const RenderMinimizedWindow: React.FC<{ entity: Entity }> = ({
  entity: window,
}) => {
  return (
    <Button
      onClick={() => {
        if (window.minimized) {
          world.removeComponent(window, "minimized")
        } else {
          world.addComponent(window, "minimized", true)
          world.addComponent(window, "lastUpdated", Date.now())
        }
      }}
    >
      {window.header}
    </Button>
  )
}

const notPreviewingWithMinimized = world
  .with("window")
  .without("previewing")
  .with("minimized")
export const RenderMinimizedWindows: React.FC = () => {
  const { entities } = useEntities(notPreviewingWithMinimized)
  console.log("wheee")
  return entities.map((window, index) => {
    if (!window.id) {
      throw new Error("no id RenderMinimizedWindows")
    }
    return <RenderMinimizedWindow key={window.id} entity={window} />
  })
}
