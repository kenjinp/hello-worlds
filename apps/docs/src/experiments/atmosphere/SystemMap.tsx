import { capitalize } from "@site/../../packages/core/dist/esm"
import { Button } from "@site/src/components/button/Button"
import { romanize } from "@site/src/components/world-builder/JumpTo"
import { ECS } from "@site/src/components/world-builder/WorldBuilder.ecs"
import {
  archetypes,
  Entity,
} from "@site/src/components/world-builder/WorldBuilder.state"
import { useEntities } from "miniplex/react"
import * as React from "react"
import Tree, { useTreeState } from "react-hyper-tree"
import { Tooltip } from "./Tooltip"

const describeEntity = (entity: Entity) => {
  const parent = entity.satelliteOf
  if (parent) {
    const type = getType(parent)
    if (type === "planet" || type === "star") {
      const index = parent.children.indexOf(entity)
      return `${capitalize(parent.name)} ${romanize(index + 1)}`
    }
  }
  return null
}

export const getType = (entity: Entity) => {
  const type = entity.moon
    ? "moon"
    : entity.planet
    ? "planet"
    : entity.star
    ? "star"
    : "unknown"
  return type
}

export const SystemExplorerTreeSlow: React.FC<{ entities: Entity[] }> = ({
  entities,
}) => {
  const { required, handlers } = useTreeState({
    data: entities,
    id: "stystem Map",
    defaultOpened: true,
  })

  return (
    <Tree
      {...required}
      {...handlers}
      verticalLineStyles={{
        stroke: "black",
        strokeWidth: 1,
      }}
      horizontalLineStyles={{
        stroke: "black",
        strokeWidth: 1,
      }}
      renderNode={treeNode => {
        const {
          node: { data: entity },
        } = treeNode
        const type = getType(entity)
        return (
          <div>
            <Button>
              <Tooltip name="entity" entity={entity}></Tooltip>{" "}
              <span>{describeEntity(entity)}</span>{" "}
              <Tooltip name={type}></Tooltip>{" "}
              {!!treeNode.node.options.childrenCount && (
                <span className="children-length">
                  <span>
                    ({treeNode.node.options.childrenCount} orbiting bodies)
                  </span>
                </span>
              )}
            </Button>
          </div>
        )
      }}
    />
  )
}

export const SystemExplorerTree: React.FC<{ entities: Entity[] }> = ({
  entities,
}) => {
  console.log("rerender sysetm explorer tree")
  const RenderEntities = entity => {
    const type = getType(entity)
    return (
      <div key={entity.id}>
        <Button>
          <Tooltip name="entity" entity={entity}></Tooltip>{" "}
          <span>{describeEntity(entity)}</span> <Tooltip name={type}></Tooltip>{" "}
          {!!entity.children?.length && (
            <span className="children-length">
              <span>({entity.children?.length} orbiting bodies)</span>
            </span>
          )}
        </Button>
        <ul>{entity.children?.map(RenderEntities)}</ul>
      </div>
    )
  }

  return <ul>{entities.map(RenderEntities)}</ul>
}

export const SystemExplorer: React.FC = () => {
  const { entities } = useEntities(archetypes.star)
  console.log("I should like to re-render, you know")

  return <SystemExplorerTree entities={entities} key="nope" />
}

export const SystemMap: React.FC = () => {
  console.log("System MAP RERENDER OMG!")
  return (
    <ECS.Entity>
      <ECS.Component name="id" data="system map" />
      <ECS.Component name="window" data={true} />
      <ECS.Component name="header" data="System Map (m)" />
      <ECS.Component name="minimized" data={true} />
      <ECS.Component name="content" data={<SystemExplorer />} />
    </ECS.Entity>
  )
}
