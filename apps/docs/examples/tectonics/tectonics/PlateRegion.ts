import { Region } from "../voronoi/Voronoi";
import { Plate } from "./Plate";

export class PlateRegion {
  constructor(public readonly region: Region, public readonly plate: Plate) {}
}
