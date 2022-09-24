// @ts-nocheck
import * as THREE from "three"
import { BufferGeometry } from "three"

/**
 * Capsule Geometry
 * especially helpful in 3D games
 * original creator:
 * @author maximequiblier
 *
 * Modified for typescript (partially)
 * @author Kenneth Pirman <github@kenny.wtf>
 */
export class CapsuleBufferGeometry extends BufferGeometry {
  constructor(
    public radiusTop: number = 1,
    public radiusBottom: number = 1,
    public height: number = 2,
    public radialSegments: number = 8,
    public heightSegments: number = 2,
    public capsTopSegments: number = 2,
    public capsBottomSegments: number = 2,
    public thetaStart: number = 0.0,
    public thetaLength: number = 2.0 * Math.PI,
  ) {
    super()
    this.type = "CapsuleBufferGeometry"

    // Alpha is the angle such that Math.PI/2 - alpha is the cone part angle.
    const alpha = Math.acos((radiusBottom - radiusTop) / height)

    const vertexCount = calculateVertexCount()
    const indexCount = calculateIndexCount()

    // buffers
    const indices = new THREE.BufferAttribute(
      new (indexCount > 65535 ? Uint32Array : Uint16Array)(indexCount),
      1,
    )
    const vertices = new THREE.BufferAttribute(
      new Float32Array(vertexCount * 3),
      3,
    )
    const normals = new THREE.BufferAttribute(
      new Float32Array(vertexCount * 3),
      3,
    )
    const uvs = new THREE.BufferAttribute(new Float32Array(vertexCount * 2), 2)

    // helper letiables

    let index = 0,
      indexOffset = 0,
      indexArray: number[][] = [],
      halfHeight = height / 2

    // generate geometry
    generateTorso()

    // build geometry
    this.setIndex(indices)
    this.setAttribute("position", vertices)
    this.setAttribute("normal", normals)
    this.setAttribute("uv", uvs)

    // helper functions
    function calculateVertexCount() {
      let count =
        (radialSegments + 1) *
        (heightSegments + 1 + capsBottomSegments + capsTopSegments)
      return count
    }

    function calculateIndexCount() {
      let count =
        radialSegments *
        (heightSegments + capsBottomSegments + capsTopSegments) *
        2 *
        3
      return count
    }

    function generateTorso() {
      let x, y
      let normal = new THREE.Vector3()
      let vertex = new THREE.Vector3()

      let cosAlpha = Math.cos(alpha)
      let sinAlpha = Math.sin(alpha)

      let cone_length = new THREE.Vector2(
        radiusTop * sinAlpha,
        halfHeight + radiusTop * cosAlpha,
      )
        .sub(
          new THREE.Vector2(
            radiusBottom * sinAlpha,
            -halfHeight + radiusBottom * cosAlpha,
          ),
        )
        .length()

      // Total length for v texture coord
      const vl =
        radiusTop * alpha + cone_length + radiusBottom * (Math.PI / 2 - alpha)

      // generate vertices, normals and uvs
      let v = 0
      for (y = 0; y <= capsTopSegments; y++) {
        let indexRow = []

        let a = Math.PI / 2 - alpha * (y / capsTopSegments)

        v += (radiusTop * alpha) / capsTopSegments

        let cosA = Math.cos(a)
        let sinA = Math.sin(a)

        // calculate the radius of the current row
        let radius = cosA * radiusTop

        for (x = 0; x <= radialSegments; x++) {
          let u = x / radialSegments

          let theta = u * thetaLength + thetaStart

          let sinTheta = Math.sin(theta)
          let cosTheta = Math.cos(theta)

          // vertex
          vertex.x = radius * sinTheta
          vertex.y = halfHeight + sinA * radiusTop
          vertex.z = radius * cosTheta
          vertices.setXYZ(index, vertex.x, vertex.y, vertex.z)

          // normal
          normal.set(cosA * sinTheta, sinA, cosA * cosTheta)
          normals.setXYZ(index, normal.x, normal.y, normal.z)

          // uv
          uvs.setXY(index, u, 1 - v / vl)

          // save index of vertex in respective row
          indexRow.push(index)

          // increase index
          index++
        }

        // now save vertices of the row in our index array
        indexArray.push(indexRow)
      }

      let cone_height = height + cosAlpha * radiusTop - cosAlpha * radiusBottom
      let slope = (sinAlpha * (radiusBottom - radiusTop)) / cone_height
      for (y = 1; y <= heightSegments; y++) {
        let indexRow = []

        v += cone_length / heightSegments

        // calculate the radius of the current row
        let radius =
          sinAlpha *
          ((y * (radiusBottom - radiusTop)) / heightSegments + radiusTop)

        for (x = 0; x <= radialSegments; x++) {
          let u = x / radialSegments

          let theta = u * thetaLength + thetaStart

          let sinTheta = Math.sin(theta)
          let cosTheta = Math.cos(theta)

          // vertex
          vertex.x = radius * sinTheta
          vertex.y =
            halfHeight +
            cosAlpha * radiusTop -
            (y * cone_height) / heightSegments
          vertex.z = radius * cosTheta
          vertices.setXYZ(index, vertex.x, vertex.y, vertex.z)

          // normal
          normal.set(sinTheta, slope, cosTheta).normalize()
          normals.setXYZ(index, normal.x, normal.y, normal.z)

          // uv
          uvs.setXY(index, u, 1 - v / vl)

          // save index of vertex in respective row
          indexRow.push(index)

          // increase index
          index++
        }

        // now save vertices of the row in our index array
        indexArray.push(indexRow)
      }

      for (y = 1; y <= capsBottomSegments; y++) {
        let indexRow = []

        let a =
          Math.PI / 2 - alpha - (Math.PI - alpha) * (y / capsBottomSegments)

        v += (radiusBottom * alpha) / capsBottomSegments

        let cosA = Math.cos(a)
        let sinA = Math.sin(a)

        // calculate the radius of the current row
        let radius = cosA * radiusBottom

        for (x = 0; x <= radialSegments; x++) {
          let u = x / radialSegments

          let theta = u * thetaLength + thetaStart

          let sinTheta = Math.sin(theta)
          let cosTheta = Math.cos(theta)

          // vertex
          vertex.x = radius * sinTheta
          vertex.y = -halfHeight + sinA * radiusBottom
          vertex.z = radius * cosTheta
          vertices.setXYZ(index, vertex.x, vertex.y, vertex.z)

          // normal
          normal.set(cosA * sinTheta, sinA, cosA * cosTheta)
          normals.setXYZ(index, normal.x, normal.y, normal.z)

          // uv
          uvs.setXY(index, u, 1 - v / vl)

          // save index of vertex in respective row
          indexRow.push(index)

          // increase index
          index++
        }

        // now save vertices of the row in our index array
        indexArray.push(indexRow)
      }

      // generate indices

      for (x = 0; x < radialSegments; x++) {
        for (
          y = 0;
          y < capsTopSegments + heightSegments + capsBottomSegments;
          y++
        ) {
          // we use the index array to access the correct indices
          let i1 = indexArray[y][x]
          let i2 = indexArray[y + 1][x]
          let i3 = indexArray[y + 1][x + 1]
          let i4 = indexArray[y][x + 1]

          // face one
          indices.setX(indexOffset, i1)
          indexOffset++
          indices.setX(indexOffset, i2)
          indexOffset++
          indices.setX(indexOffset, i4)
          indexOffset++

          // face two
          indices.setX(indexOffset, i2)
          indexOffset++
          indices.setX(indexOffset, i3)
          indexOffset++
          indices.setX(indexOffset, i4)
          indexOffset++
        }
      }
    }
  }
}
