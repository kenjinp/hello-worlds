import { BufferGeometry, Float32BufferAttribute, Vector3 } from "three";

function slerp(p0, p1, t) {
  var omega = Math.acos(p0.dot(p1));
  return p0
    .clone()
    .multiplyScalar(Math.sin((1 - t) * omega))
    .add(p1.clone().multiplyScalar(Math.sin(t * omega)))
    .divideScalar(Math.sin(omega));
}

export function generateIcosahedron() {
  var phi = (1.0 + Math.sqrt(5.0)) / 2.0;
  var du = 1.0 / Math.sqrt(phi * phi + 1.0);
  var dv = phi * du;

  const nodes = [
    { p: new Vector3(0, +dv, +du), e: [], f: [] },
    { p: new Vector3(0, +dv, -du), e: [], f: [] },
    { p: new Vector3(0, -dv, +du), e: [], f: [] },
    { p: new Vector3(0, -dv, -du), e: [], f: [] },
    { p: new Vector3(+du, 0, +dv), e: [], f: [] },
    { p: new Vector3(-du, 0, +dv), e: [], f: [] },
    { p: new Vector3(+du, 0, -dv), e: [], f: [] },
    { p: new Vector3(-du, 0, -dv), e: [], f: [] },
    { p: new Vector3(+dv, +du, 0), e: [], f: [] },
    { p: new Vector3(+dv, -du, 0), e: [], f: [] },
    { p: new Vector3(-dv, +du, 0), e: [], f: [] },
    { p: new Vector3(-dv, -du, 0), e: [], f: [] },
  ];

  const edges = [
    { n: [0, 1], f: [] },
    { n: [0, 4], f: [] },
    { n: [0, 5], f: [] },
    { n: [0, 8], f: [] },
    { n: [0, 10], f: [] },
    { n: [1, 6], f: [] },
    { n: [1, 7], f: [] },
    { n: [1, 8], f: [] },
    { n: [1, 10], f: [] },
    { n: [2, 3], f: [] },
    { n: [2, 4], f: [] },
    { n: [2, 5], f: [] },
    { n: [2, 9], f: [] },
    { n: [2, 11], f: [] },
    { n: [3, 6], f: [] },
    { n: [3, 7], f: [] },
    { n: [3, 9], f: [] },
    { n: [3, 11], f: [] },
    { n: [4, 5], f: [] },
    { n: [4, 8], f: [] },
    { n: [4, 9], f: [] },
    { n: [5, 10], f: [] },
    { n: [5, 11], f: [] },
    { n: [6, 7], f: [] },
    { n: [6, 8], f: [] },
    { n: [6, 9], f: [] },
    { n: [7, 10], f: [] },
    { n: [7, 11], f: [] },
    { n: [8, 9], f: [] },
    { n: [10, 11], f: [] },
  ];

  const faces = [
    { n: [0, 1, 8], e: [0, 7, 3] },
    { n: [0, 4, 5], e: [1, 18, 2] },
    { n: [0, 5, 10], e: [2, 21, 4] },
    { n: [0, 8, 4], e: [3, 19, 1] },
    { n: [0, 10, 1], e: [4, 8, 0] },
    { n: [1, 6, 8], e: [5, 24, 7] },
    { n: [1, 7, 6], e: [6, 23, 5] },
    { n: [1, 10, 7], e: [8, 26, 6] },
    { n: [2, 3, 11], e: [9, 17, 13] },
    { n: [2, 4, 9], e: [10, 20, 12] },
    { n: [2, 5, 4], e: [11, 18, 10] },
    { n: [2, 9, 3], e: [12, 16, 9] },
    { n: [2, 11, 5], e: [13, 22, 11] },
    { n: [3, 6, 7], e: [14, 23, 15] },
    { n: [3, 7, 11], e: [15, 27, 17] },
    { n: [3, 9, 6], e: [16, 25, 14] },
    { n: [4, 8, 9], e: [19, 28, 20] },
    { n: [5, 11, 10], e: [22, 29, 21] },
    { n: [6, 9, 8], e: [25, 28, 24] },
    { n: [7, 10, 11], e: [26, 29, 27] },
  ];

  for (var i = 0; i < edges.length; ++i)
    for (var j = 0; j < edges[i].n.length; ++j) nodes[j].e.push(i);

  for (var i = 0; i < faces.length; ++i)
    for (var j = 0; j < faces[i].n.length; ++j) nodes[j].f.push(i);

  for (var i = 0; i < faces.length; ++i)
    for (var j = 0; j < faces[i].e.length; ++j) edges[j].f.push(i);

  return { nodes: nodes, edges: edges, faces: faces };
}

export function generateSubdividedIcosahedron(degree: number) {
  var icosahedron = generateIcosahedron();

  var nodes = [];
  for (var i = 0; i < icosahedron.nodes.length; ++i) {
    nodes.push({ p: icosahedron.nodes[i].p, e: [], f: [] });
  }

  var edges = [];
  for (var i = 0; i < icosahedron.edges.length; ++i) {
    var edge = icosahedron.edges[i];
    edge.subdivided_n = [];
    edge.subdivided_e = [];
    var n0 = icosahedron.nodes[edge.n[0]];
    var n1 = icosahedron.nodes[edge.n[1]];
    var p0 = n0.p;
    var p1 = n1.p;
    var delta = p1.clone().sub(p0);
    nodes[edge.n[0]].e.push(edges.length);
    var priorNodeIndex = edge.n[0];
    for (var s = 1; s < degree; ++s) {
      var edgeIndex = edges.length;
      var nodeIndex = nodes.length;
      edge.subdivided_e.push(edgeIndex);
      edge.subdivided_n.push(nodeIndex);
      edges.push({ n: [priorNodeIndex, nodeIndex], f: [] });
      priorNodeIndex = nodeIndex;
      nodes.push({
        p: slerp(p0, p1, s / degree),
        e: [edgeIndex, edgeIndex + 1],
        f: [],
      });
    }
    edge.subdivided_e.push(edges.length);
    nodes[edge.n[1]].e.push(edges.length);
    edges.push({ n: [priorNodeIndex, edge.n[1]], f: [] });
  }

  var faces = [];
  for (var i = 0; i < icosahedron.faces.length; ++i) {
    var face = icosahedron.faces[i];
    var edge0 = icosahedron.edges[face.e[0]];
    var edge1 = icosahedron.edges[face.e[1]];
    var edge2 = icosahedron.edges[face.e[2]];
    var point0 = icosahedron.nodes[face.n[0]].p;
    var point1 = icosahedron.nodes[face.n[1]].p;
    var point2 = icosahedron.nodes[face.n[2]].p;
    var delta = point1.clone().sub(point0);

    var getEdgeNode0 =
      face.n[0] === edge0.n[0]
        ? function (k) {
            return edge0.subdivided_n[k];
          }
        : function (k) {
            return edge0.subdivided_n[degree - 2 - k];
          };
    var getEdgeNode1 =
      face.n[1] === edge1.n[0]
        ? function (k) {
            return edge1.subdivided_n[k];
          }
        : function (k) {
            return edge1.subdivided_n[degree - 2 - k];
          };
    var getEdgeNode2 =
      face.n[0] === edge2.n[0]
        ? function (k) {
            return edge2.subdivided_n[k];
          }
        : function (k) {
            return edge2.subdivided_n[degree - 2 - k];
          };

    var faceNodes = [];
    faceNodes.push(face.n[0]);
    for (var j = 0; j < edge0.subdivided_n.length; ++j)
      faceNodes.push(getEdgeNode0(j));
    faceNodes.push(face.n[1]);
    for (var s = 1; s < degree; ++s) {
      faceNodes.push(getEdgeNode2(s - 1));
      var p0 = nodes[getEdgeNode2(s - 1)].p;
      var p1 = nodes[getEdgeNode1(s - 1)].p;
      for (var t = 1; t < degree - s; ++t) {
        faceNodes.push(nodes.length);
        nodes.push({ p: slerp(p0, p1, t / (degree - s)), e: [], f: [] });
      }
      faceNodes.push(getEdgeNode1(s - 1));
    }
    faceNodes.push(face.n[2]);

    var getEdgeEdge0 =
      face.n[0] === edge0.n[0]
        ? function (k) {
            return edge0.subdivided_e[k];
          }
        : function (k) {
            return edge0.subdivided_e[degree - 1 - k];
          };
    var getEdgeEdge1 =
      face.n[1] === edge1.n[0]
        ? function (k) {
            return edge1.subdivided_e[k];
          }
        : function (k) {
            return edge1.subdivided_e[degree - 1 - k];
          };
    var getEdgeEdge2 =
      face.n[0] === edge2.n[0]
        ? function (k) {
            return edge2.subdivided_e[k];
          }
        : function (k) {
            return edge2.subdivided_e[degree - 1 - k];
          };

    var faceEdges0 = [];
    for (var j = 0; j < degree; ++j) faceEdges0.push(getEdgeEdge0(j));
    var nodeIndex = degree + 1;
    for (var s = 1; s < degree; ++s) {
      for (var t = 0; t < degree - s; ++t) {
        faceEdges0.push(edges.length);
        var edge = {
          n: [faceNodes[nodeIndex], faceNodes[nodeIndex + 1]],
          f: [],
        };
        nodes[edge.n[0]].e.push(edges.length);
        nodes[edge.n[1]].e.push(edges.length);
        edges.push(edge);
        ++nodeIndex;
      }
      ++nodeIndex;
    }

    var faceEdges1 = [];
    nodeIndex = 1;
    for (var s = 0; s < degree; ++s) {
      for (var t = 1; t < degree - s; ++t) {
        faceEdges1.push(edges.length);
        var edge = {
          n: [faceNodes[nodeIndex], faceNodes[nodeIndex + degree - s]],
          f: [],
        };
        nodes[edge.n[0]].e.push(edges.length);
        nodes[edge.n[1]].e.push(edges.length);
        edges.push(edge);
        ++nodeIndex;
      }
      faceEdges1.push(getEdgeEdge1(s));
      nodeIndex += 2;
    }

    var faceEdges2 = [];
    nodeIndex = 1;
    for (var s = 0; s < degree; ++s) {
      faceEdges2.push(getEdgeEdge2(s));
      for (var t = 1; t < degree - s; ++t) {
        faceEdges2.push(edges.length);
        var edge = {
          n: [faceNodes[nodeIndex], faceNodes[nodeIndex + degree - s + 1]],
          f: [],
        };
        nodes[edge.n[0]].e.push(edges.length);
        nodes[edge.n[1]].e.push(edges.length);
        edges.push(edge);
        ++nodeIndex;
      }
      nodeIndex += 2;
    }

    nodeIndex = 0;
    edgeIndex = 0;
    for (var s = 0; s < degree; ++s) {
      for (t = 1; t < degree - s + 1; ++t) {
        var subFace = {
          n: [
            faceNodes[nodeIndex],
            faceNodes[nodeIndex + 1],
            faceNodes[nodeIndex + degree - s + 1],
          ],
          e: [
            faceEdges0[edgeIndex],
            faceEdges1[edgeIndex],
            faceEdges2[edgeIndex],
          ],
        };
        nodes[subFace.n[0]].f.push(faces.length);
        nodes[subFace.n[1]].f.push(faces.length);
        nodes[subFace.n[2]].f.push(faces.length);
        edges[subFace.e[0]].f.push(faces.length);
        edges[subFace.e[1]].f.push(faces.length);
        edges[subFace.e[2]].f.push(faces.length);
        faces.push(subFace);
        ++nodeIndex;
        ++edgeIndex;
      }
      ++nodeIndex;
    }

    nodeIndex = 1;
    edgeIndex = 0;
    for (var s = 1; s < degree; ++s) {
      for (t = 1; t < degree - s + 1; ++t) {
        var subFace = {
          n: [
            faceNodes[nodeIndex],
            faceNodes[nodeIndex + degree - s + 2],
            faceNodes[nodeIndex + degree - s + 1],
          ],
          e: [
            faceEdges2[edgeIndex + 1],
            faceEdges0[edgeIndex + degree - s + 1],
            faceEdges1[edgeIndex],
          ],
        };
        nodes[subFace.n[0]].f.push(faces.length);
        nodes[subFace.n[1]].f.push(faces.length);
        nodes[subFace.n[2]].f.push(faces.length);
        edges[subFace.e[0]].f.push(faces.length);
        edges[subFace.e[1]].f.push(faces.length);
        edges[subFace.e[2]].f.push(faces.length);
        faces.push(subFace);
        ++nodeIndex;
        ++edgeIndex;
      }
      nodeIndex += 2;
      edgeIndex += 1;
    }
  }

  return { nodes: nodes, edges: edges, faces: faces };
}

export const generateIcosahedronBufferGeometry = (nodes: { p: Vector3 }[]) => {
  console.log(nodes);
  const geometry = new BufferGeometry();
  const positions = new Float32Array(nodes.length * 3);
  for (let i = 0, n = nodes.length; i < n; i++) {
    const {
      p: { x, y, z },
    } = nodes[i];
    const p = i * 3;
    positions[p] = x * 1000;
    positions[p + 1] = y * 1000;
    positions[p + 2] = z * 1000;
  }
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  return geometry;
};
