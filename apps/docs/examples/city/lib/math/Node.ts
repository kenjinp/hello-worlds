export class Node {
  public links: Map<Node, number> = new Map()

  public link(node: Node, price = 1, symmetrical = true) {
    this.links.set(node, price)
    if (symmetrical) {
      node.links.set(this, price)
    }
  }

  public unlink(node: Node, symmetrical = true) {
    this.links.delete(node)
    if (symmetrical) {
      node.links.delete(this)
    }
  }

  public unlinkAll() {
    for (let node of this.links.keys()) {
      this.unlink(node)
    }
  }
}
