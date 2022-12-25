import { Entity } from "@game/Entity"
import { World } from "miniplex"
import { createReactAPI } from "miniplex/react"

export const world = new World<Entity>()
export const ECS = createReactAPI(world)
