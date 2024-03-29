import { world } from "@game/ECS"
import { archetypes, Entity } from "@game/Entity"
import { capitalize } from "@hello-worlds/core"
import * as React from "react"
import docs from "./docs"

export const doFocusObjectDescription = (
  name: keyof typeof docs,
  windowPosition: { x: number; y: number },
  entity?: Entity,
) => {
  const label = entity?.name || name
  const Content = docs[name]
  const objectDescriptionKey = `${label}-description`
  // does window already exist?
  const current = world
    .archetype("window")
    .entities.find(e => e.id === objectDescriptionKey)
  if (current) {
    if (current.previewing) {
      world.removeComponent(current, "previewing")
    }
    if (current.closed) {
      world.removeComponent(current, "closed")
    }
    return
  } else {
    world.add({
      id: objectDescriptionKey,
      window: true,
      header: label,
      closable: true,
      zIndex: 100,
      windowPosition,
      headerColor: entity?.labelColor?.getStyle(),
      content: (<Content entity={entity} />) as React.ReactElement,
    })
  }
}

// TODO if current camera is FlyCamera, switch to GodCamera
export const doFocusPlanet = (entity: Entity) => {
  const camera = world.archetype("isCamera", "sceneObject").entities[0]
    .sceneObject
  world.archetype("planet").entities.forEach(e => {
    world.removeComponent(e, "isFocused")
  })
  world.archetype("moon").entities.forEach(e => {
    world.removeComponent(e, "isFocused")
  })
  world.addComponent(entity, "isFocused", true)
  archetypes.godCamera.entities.forEach(cameraEntity => {
    cameraEntity.target = entity
    camera.lookAt(entity.position)
  })
  world.update(entity)
}

export const doSetWindowPosition = (entity: Entity, x: number, y: number) => {
  world.addComponent(entity, "windowPosition", { x, y })
}

export const doBringToFront = (entity: Entity) => {
  world.addComponent(entity, "lastUpdated", Date.now())
  world.archetype("window").entities.forEach(e => {
    world.addComponent(e, "zIndex", 0)
    e.zIndex = 0
  })
  entity.zIndex = 100
  world.addComponent(entity, "zIndex", 100)
  // world.update(entity)
  // world.update(entity, e => void (e.zIndex = 100))
}

export const doPreviewTooltip = (
  name: keyof typeof docs,
  windowPosition: { x: number; y: number },
  entity?: Entity,
) => {
  const label = entity?.name || name
  const Content = docs[name]
  const objectDescriptionKey = `${label}-description`
  let tooltipEntity: Entity

  // does window already exist?
  tooltipEntity = world
    .archetype("window")
    .entities.find(e => e.id === objectDescriptionKey)
  if (tooltipEntity) {
    return
  }
  tooltipEntity ==
    world.add({
      id: objectDescriptionKey,
      window: true,
      header: capitalize(label),
      closable: true,
      zIndex: 100,
      windowPosition,
      headerColor: entity?.labelColor?.getStyle() || "white",
      content: (<Content entity={entity} />) as React.ReactElement,
      previewing: true,
    })
}

export const doClosePreviewTooltip = (
  name: keyof typeof docs,
  entity?: Entity,
) => {
  const label = entity?.name || name
  const objectDescriptionKey = `${label}-description`
  // does window already exist?
  const current = world
    .archetype("window", "previewing")
    .entities.find(e => e.id === objectDescriptionKey)

  if (current) {
    world.remove(current)
  }
}
