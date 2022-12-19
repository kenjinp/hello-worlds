import { Vector3 } from "three";
import { Plate } from "./Plate";
import { PlateRegion } from "./PlateRegion";
import { Tectonics } from "./Tectonics";
import { vectorTo } from "./utils";

const tempVector3 = new Vector3();

// export function calculateStressOnEdge(
//   movement0: Vector3,
//   movement1: Vector3,
//   boundaryVector: Vector3,
//   boundaryNormal: Vector3
// ) {
//   const relativeMovement = movement0.clone().sub(movement1);
//   const pressureVector = relativeMovement
//     .clone()
//     .projectOnVector(boundaryNormal);
//   let pressure = pressureVector.length();
//   if (pressureVector.dot(boundaryNormal) > 0) pressure = -pressure;
//   const shear = relativeMovement
//     .clone()
//     .projectOnVector(boundaryVector)
//     .length();
//   return {
//     pressure: 2 / (1 + Math.exp(-pressure / 30)) - 1,
//     shear: 2 / (1 + Math.exp(-shear / 30)) - 1,
//   };
// }

export function calculateRelativeMotionOnVertex(
  movement0: Vector3,
  movement1: Vector3
) {
  return movement0.clone().sub(movement1);
}

export function calculateStressOnEdge(
  movement0: Vector3,
  movement1: Vector3,
  boundaryVector: Vector3,
  boundaryNormal: Vector3
) {
  const relativeMovement = movement0.clone().sub(movement1);
  const pressureVector = relativeMovement
    .clone()
    .projectOnVector(boundaryNormal);
  let pressure = pressureVector.length();
  if (pressureVector.dot(boundaryNormal) > 0) pressure = -pressure;
  const shear = relativeMovement
    .clone()
    .projectOnVector(boundaryVector)
    .length();
  return {
    pressure: 2 / (1 + Math.exp(-pressure / 30)) - 1,
    shear: 2 / (1 + Math.exp(-shear / 30)) - 1,
  };
}
// MAX_ID should change with the planetSize + world coordinates
export const MAX_ID = 0x1f1f1f1f;
function edgeHashKey(tuple: [number, number]) {
  let [x, y] = tuple.sort();
  return x + y * MAX_ID;
}

function decomposeKeyLeft(x: number) {
  return Math.trunc(x / MAX_ID);
}

function decomposeKeyRight(x: number) {
  return x % MAX_ID;
}

const BOUNDARY_CONST = 0.3;

export enum BoundaryTypes {
  OCEAN_COLLISION = "OCEAN_COLLISION",
  SUBDUCTION = "SUBDUCTION",
  SUPERDUCTION = "SUPERDUCTION",
  DIVERGING = "DIVERGING",
  SHEARING = "SHEARING",
  DORMANT = "DORMANT",
}

export class Edge {
  plates: Map<number, Plate> = new Map();
  // regions: Map<number, PlateRegion> = new Map();
  coordinates: {
    coordinate: Vector3;
    regionPlateIndex: PlateRegion["plate"]["index"];
    regionRegionIndex: PlateRegion["region"]["properties"]["index"];
    neighborPlateIndex: PlateRegion["plate"]["index"];
    neighborRegionIndex: PlateRegion["region"]["properties"]["index"];
    elevation: number;
    pressure: number;
    shear: number;
    boundaryType: BoundaryTypes;
  }[] = [];
  // stress: Map<number, number> = new Map();
  constructor(plate1: Plate, plate2: Plate) {
    this.plates.set(plate1.index, plate1);
    this.plates.set(plate2.index, plate2);
  }
  calculateBoundaryStress(coordinate: Vector3) {
    // for (let i = 0; i < this.coordinates.length; i += 3) {
    //   const x = this.coordinates[i];
    //   const y = this.coordinates[i + 1];
    //   const z = this.coordinates[i + 2];
    //   const coordinates = tempVector3.clone().set(x,y,z);
    const relativeMovement = tempVector3.clone().set(0, 0, 0);
    this.plates.forEach((plate) => {
      const movement = Plate.calculateMovement(
        plate,
        tempVector3.clone().copy(coordinate),
        tempVector3.clone().set(0, 0, 0)
      );
      relativeMovement.sub(movement);
    });
    // this.stress.set(i, relativeMovement)
    return relativeMovement;
    // }
  }
  static edgeHashKey([x, y]: [number, number]) {
    return edgeHashKey([x, y]);
  }
}

export function findEdges(tectonics: Tectonics) {
  tectonics.plates.forEach((plate) => {
    // lets go through all the plate neighbors
    plate.neighbors.forEach((neighborPlate) => {
      const edgeKey = edgeHashKey([neighborPlate.index, plate.index]);
      if (!tectonics.edges.has(edgeKey)) {
        // we have not yet created this edge pair, lets do it!
        const edge = new Edge(plate, neighborPlate);
        const coordinates = new Map<
          string,
          {
            coordinate: Vector3;
            regionPlateIndex: PlateRegion["plate"]["index"];
            regionRegionIndex: PlateRegion["region"]["properties"]["index"];
            neighborPlateIndex: PlateRegion["plate"]["index"];
            neighborRegionIndex: PlateRegion["region"]["properties"]["index"];
          }
        >();

        // now let's prowl the internal border regions
        const internalMatchingRegions = Array.from(
          plate.internalBorderRegions.values()
        ).filter(
          ({
            region: {
              properties: { index },
            },
          }) => neighborPlate.externalBorderRegions.has(index)
        );

        const assembleVerts = (verts: number[]) => {
          const tempVector3 = new Vector3();
          const vertsAssembled: Vector3[] = [];
          for (let i = 0; i < verts.length; i += 3) {
            const x = verts[i];
            const y = verts[i + 1];
            const z = verts[i + 2];
            vertsAssembled.push(tempVector3.set(x, y, z).clone());
          }
          return vertsAssembled;
        };

        // We should sort the regions
        // by who has what neighbor
        // A, B, C
        // if B has a neihbor of both A and C, he should be in the middle
        // const sorted = [];
        // for (let i = 0; i < internalMatchingRegions.length; i++) {
        //   const currentRegion = internalMatchingRegions[i];
        //   if (!sorted.length) {
        //     sorted.push(currentRegion);
        //     continue;
        //   }
        //   const neighbor = sorted.findIndex(region => region.region.properties.neighbors.includes(currentRegion.region.properties.index));
        //   if (neighbor) {
        //     // we have a neighbor boy, let's prepend
        //     continue;
        //   }
        //   // we dont' have a neighbor, just add to tail
        //   sorted.push(currentRegion);

        // }

        internalMatchingRegions.forEach((plateRegion) => {
          const { region } = plateRegion;
          region.properties.neighbors.forEach((neighborIndex) => {
            const neighborRegion =
              neighborPlate.internalBorderRegions.get(neighborIndex);
            if (neighborRegion) {
              assembleVerts(region.geometry.vertices).forEach((vec3) => {
                assembleVerts(neighborRegion.region.geometry.vertices).forEach(
                  (nVec3) => {
                    if (vec3.equals(nVec3)) {
                      coordinates.set(JSON.stringify(vec3), {
                        coordinate: vec3,
                        regionPlateIndex: plateRegion.plate.index,
                        regionRegionIndex: plateRegion.region.properties.index,
                        neighborRegionIndex:
                          neighborRegion.region.properties.index,
                        neighborPlateIndex: neighborRegion.plate.index,
                      });
                    }
                  }
                );
              });
            }
          });
        });

        // // Let's sort the coordinates so we can make a line connecting them
        // const sortedEdgeRegions =  []
        // const blah = Array.from(coordinates.values());
        // const occupiedNeighbors = new Map<number,
        // for (let i = 0; i < blah.length; i ++ ) {
        //   const { region, coordinate } = blah[i];

        // }

        edge.coordinates = Array.from(coordinates.values());

        for (let j = 0; j < edge.coordinates.length; j++) {
          const {
            coordinate,
            regionPlateIndex,
            regionRegionIndex,
            neighborRegionIndex,
            neighborPlateIndex,
          } = edge.coordinates[j];
          const plate = tectonics.plates.get(regionPlateIndex)!;
          const neighborPlate = tectonics.plates.get(neighborPlateIndex)!;
          const movementPlate0 = plate.calculateMovement(coordinate);
          const movementPlate1 = neighborPlate.calculateMovement(coordinate);
          const region = plate.regions.get(regionRegionIndex)!;
          const neighborRegion =
            neighborPlate.regions.get(neighborRegionIndex)!;
          const boundaryNormal = vectorTo(
            region.region.properties.siteXYZ,
            neighborRegion.region.properties.siteXYZ
          );
          const boundaryVector = boundaryNormal.cross(coordinate);

          const { pressure, shear } = calculateStressOnEdge(
            movementPlate0,
            movementPlate1,
            boundaryVector,
            boundaryNormal
          );

          let elevation = plate.elevation;
          let boundaryType = BoundaryTypes.DORMANT;

          if (pressure > BOUNDARY_CONST) {
            elevation =
              Math.max(region.plate.elevation, neighborRegion.plate.elevation) +
              pressure;
            if (region.plate.oceanic && neighborRegion.plate.oceanic) {
              // calculateElevation = calculateCollidingElevation;
              // oceanCollision
              boundaryType = BoundaryTypes.OCEAN_COLLISION;
            } else if (region.plate.oceanic) {
              // subduction
              // tectonicBoundaryType.copy(tectonicTypeColorMap.subduction);
              boundaryType = BoundaryTypes.SUBDUCTION;
            } else {
              // superduction
              // tectonicBoundaryType.copy(tectonicTypeColorMap.superduction);
              boundaryType = BoundaryTypes.SUPERDUCTION;
            }
          } else if (pressure < -BOUNDARY_CONST) {
            elevation =
              Math.max(region.plate.elevation, neighborRegion.plate.elevation) -
              pressure / 4;
            // calculateElevation = calculateDivergingElevation;
            // diverging elevation
            // tectonicBoundaryType.copy(tectonicTypeColorMap.diverging);
            boundaryType = BoundaryTypes.DIVERGING;
          } else if (shear > BOUNDARY_CONST) {
            elevation =
              Math.max(region.plate.elevation, neighborRegion.plate.elevation) +
              shear / 8;
            // calculateElevation = calculateShearingElevation;
            // shearing elevation
            // tectonicBoundaryType.copy(tectonicTypeColorMap.shearing);
            boundaryType = BoundaryTypes.SHEARING;
          } else {
            elevation =
              (region.plate.elevation + neighborRegion.plate.elevation) / 2;
            // calculateElevation = calculateDormantElevation;
            // Dormant Elevation
            // tectonicBoundaryType.copy(tectonicTypeColorMap.dormant);
            boundaryType = BoundaryTypes.DORMANT;
          }
          edge.coordinates[j].boundaryType = boundaryType;
          edge.coordinates[j].elevation = elevation;
          edge.coordinates[j].pressure = pressure;
          edge.coordinates[j].shear = shear;
        }
        edge.plates.forEach(plate => plate.edges.push(edge))
        // make sure to add him to the main class
        tectonics.edges.set(edgeKey, edge);
      }
    });
  });
}
