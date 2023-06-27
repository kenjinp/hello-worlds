import { Node } from "./Node"

export class Graph {
  public nodes: Array<Node> = []

  public add(node: Node = null): Node {
    if (node == null) {
      node = new Node()
    }
    this.nodes.push(node)
    return node
  }

  public remove(node: Node) {
    node.unlinkAll()
    this.nodes = this.nodes.filter(n => n !== node)
  }

  public aStar(
    start: Node,
    goal: Node,
    exclude: Array<Node> = null,
  ): Array<Node> {
    if (!start) {
      throw new Error("no start!")
    }

    const closedSet: Array<Node> = exclude ? [...exclude] : []
    let openSet: Array<Node> = [start]
    const cameFrom: Map<Node, Node> = new Map()

    const gScore: Map<Node, number> = new Map()
    gScore.set(start, 0)

    while (openSet.length > 0) {
      let current = openSet.shift()
      if (current === goal) {
        return this.buildPath(cameFrom, current)
      }

      openSet = openSet.filter(n => n !== current)
      closedSet.push(current)
      if (!current) {
        throw new Error("current is null")
      }

      let curScore = gScore.get(current)
      for (let neighbor of current.links.keys()) {
        if (closedSet.includes(neighbor)) {
          continue
        }
        let score = curScore + current.links.get(neighbor)
        if (!openSet.includes(neighbor)) openSet.push(neighbor)
        else if (score >= gScore.get(neighbor)) continue

        cameFrom.set(neighbor, current)
        gScore.set(neighbor, score)
      }
    }

    return null
  }

  private buildPath(cameFrom: Map<Node, Node>, current: Node): Array<Node> {
    const path = [current]

    while (cameFrom.has(current)) {
      path.push((current = cameFrom.get(current)))
    }

    return path
  }

  public calculatePrice(path: Array<Node>) {
    if (path.length < 2) {
      return 0
    }

    let price = 0.0
    let current = path[0]
    let next = path[1]
    for (let i = 0; i < path.length - 1; i++) {
      if (current.links.has(next)) {
        price += current.links.get(next)
      } else {
        return NaN
      }
      current = next
      next = path[i + 1]
    }
    return price
  }
}
