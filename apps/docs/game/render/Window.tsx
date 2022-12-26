import { Button } from "@components/button/Button"
import { Window as Container } from "@components/window/Window"
import { world } from "@game/ECS"
import { Entity } from "@game/Entity"
import theme from "@theme"
import { useEntities } from "miniplex/react"
import * as React from "react"
import { ThemeProvider } from "theme-ui"
import { doBringToFront } from "../Actions"

export const RenderWindow: React.FC<{ entity: Entity }> = ({
  entity: window,
}) => {
  const handleClose = window.closable
    ? () => {
        world.remove(window)
      }
    : undefined

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
  const { entities } = useEntities(renderWindowsQuery)
  return (
    <ThemeProvider theme={theme}>
      <div
        id="window-bounds"
        style={{
          zIndex: 101,
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          overflow: "hidden",
          color: "white",
        }}
      >
        {entities.map(window => {
          return <RenderWindow key={window.id} entity={window} />
        })}
      </div>
    </ThemeProvider>
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
  return entities.map((window, index) => {
    if (!window.id) {
      throw new Error("no id RenderMinimizedWindows")
    }
    return <RenderMinimizedWindow key={window.id} entity={window} />
  })
}
