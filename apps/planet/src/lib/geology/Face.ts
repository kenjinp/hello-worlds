import { Line3, Plane, Triangle, Vector3 } from "three";

const Visible = 0;
const Deleted = 1;

const _v1 = new Vector3();
const _line3 = new Line3();
const _plane = new Plane();
const _closestPoint = new Vector3();
const _triangle = new Triangle();

export class Face {
  normal = new Vector3();
  midpoint = new Vector3();
  area = 0;

  constant = 0; // signed distance from face to the origin
  outside = null; // reference to a vertex in a vertex list this face can see
  mark = Visible;
  edge: HalfEdge;

  constructor(a: Vector3, b: Vector3, c: Vector3) {
    const e0 = new HalfEdge(a, this);
    const e1 = new HalfEdge(b, this);
    const e2 = new HalfEdge(c, this);

    // join edges

    e0.next = e2.prev = e1;
    e1.next = e0.prev = e2;
    e2.next = e1.prev = e0;

    // main half edge reference

    this.edge = e0;
  }

  getEdge(i: number) {
    let edge = this.edge;

    while (i > 0) {
      edge = edge.next!;
      i--;
    }

    while (i < 0) {
      edge = edge.prev!;
      i++;
    }

    return edge;
  }

  compute() {
    const a = this.edge.tail();
    const b = this.edge.head();
    const c = this.edge.next!.head();

    _triangle.set(a!, b, c);

    _triangle.getNormal(this.normal);
    _triangle.getMidpoint(this.midpoint);
    this.area = _triangle.getArea();

    this.constant = this.normal.dot(this.midpoint);

    return this;
  }

  distanceToPoint(point: Vector3) {
    return this.normal.dot(point) - this.constant;
  }
}

export class HalfEdge {
  prev: HalfEdge | null = null;
  next: HalfEdge | null = null;
  twin: HalfEdge | null = null;
  data: any = {};
  constructor(public vertex: Vector3, public face: Face) {}

  head() {
    return this.vertex;
  }

  tail() {
    return this.prev ? this.prev.vertex : null;
  }

  length() {
    const head = this.head();
    const tail = this.tail();

    if (tail !== null) {
      return tail.distanceTo(head);
    }

    return -1;
  }

  lengthSquared() {
    const head = this.head();
    const tail = this.tail();

    if (tail !== null) {
      return tail.distanceToSquared(head);
    }

    return -1;
  }

  setTwin(edge: HalfEdge) {
    this.twin = edge;
    edge.twin = this;

    return this;
  }
}
