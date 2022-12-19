import { Color, Vector3 } from "three";
import { Region } from "../voronoi/Voronoi";
import { Edge } from "./Edge";
import { PlateRegion } from "./PlateRegion";

export interface PlateProps {
  index: number;
  name: string;
  color: Color;
  driftAxis: Vector3;
  driftRate: number;
  spinRate: number;
  elevation: number;
  oceanic: boolean;
  startRegion: Region;
}

export class Plate {
  index: number;
  name: string;
  edges: Edge[] = [];
  color: Color;
  driftAxis: Vector3;
  driftRate: number;
  spinRate: number;
  elevation: number;
  oceanic: boolean;
  startRegion: PlateRegion;
  regions: Map<number, PlateRegion> = new Map<number, PlateRegion>();
  externalBorderRegions: Map<number, PlateRegion> = new Map<
    number,
    PlateRegion
  >();
  internalBorderRegions: Map<number, PlateRegion> = new Map<
    number,
    PlateRegion
  >();
  sides: Set<Vector3> = new Set();
  neighbors: Map<number, Plate> = new Map();
  constructor({
    index,
    name,
    color,
    driftAxis,
    driftRate,
    spinRate,
    elevation,
    oceanic,
    startRegion,
  }: PlateProps) {
    this.index = index;
    this.color = color;
    this.driftAxis = driftAxis;
    this.driftRate = driftRate;
    this.spinRate = spinRate;
    this.elevation = elevation;
    this.oceanic = oceanic;
    this.startRegion = new PlateRegion(startRegion, this);
    this.name = name;
    this.regions.set(startRegion.properties.index, this.startRegion);
  }

  calculateMovement(position: Vector3) {
    const movement = this.driftAxis
      .clone()
      .cross(position)
      .setLength(
        this.driftRate *
          position.clone().projectOnVector(this.driftAxis).distanceTo(position)
      );
    movement.add(
      this.startRegion.region.properties.siteXYZ
        .clone()
        .cross(position)
        .setLength(
          this.spinRate *
            position
              .clone()
              .projectOnVector(this.startRegion.region.properties.siteXYZ)
              .distanceTo(position)
        )
    );
    return movement;
  }

  static calculateMovement(
    plate: Plate,
    position: Vector3,
    tempVector3: Vector3
  ) {
    const driftAxis = tempVector3.copy(plate.driftAxis);
    const startRegionPosition = tempVector3
      .clone()
      .copy(plate.startRegion.region.properties.siteXYZ);
    const movement = tempVector3
      .copy(driftAxis)
      .cross(position)
      .setLength(
        plate.driftRate *
          position.clone().projectOnVector(driftAxis).distanceTo(position)
      );
    movement.add(
      startRegionPosition
        .cross(position)
        .setLength(
          plate.spinRate *
            position
              .clone()
              .projectOnVector(startRegionPosition)
              .distanceTo(position)
        )
    );
    return movement;
  }
}
