import { Region } from "../voronoi/Voronoi";
import { Plate } from "./Plate";
import { PlateRegion } from "./PlateRegion";
import { Queue } from "./Queue";
import { Tectonics } from "./Tectonics";

function shuffle<T>(array: T[], randomFloat: () => number) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(randomFloat() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export function randomFloodFill(
  tectonics: Tectonics,
  randomInteger: (min: number, max: number) => number,
  randomFloat: (min: number, max: number) => number
) {
  const { plates, voronoiSphere } = tectonics;
  // We have already established our plate starting regions
  // We will treat these as "fronts" each of which will be a queue
  // that can gobble up it's neighboring regions

  const assignedRegions = new Array(voronoiSphere.regions.length).fill(-1);

  const regionIsAlreadyAssigned = (region: Region) => {
    return assignedRegions[region.properties.index] > -1;
  };

  const assignRegionToPlate = (region: Region, plate: Plate) => {
    assignedRegions[region.properties.index] = plate.index;
    plate.regions.set(region.properties.index, new PlateRegion(region, plate));
  };

  const fronts: Queue<{ region: Region; plate: Plate }>[] = new Array(
    plates.size
  )
    .fill(0)
    .map((_) => new Queue<{ region: Region; plate: Plate }>());

  plates.forEach((plate, index) => {
    assignedRegions[plate.startRegion.region.properties.index] =
      plate.startRegion.region.properties.index;
    // we will prime the fronts with a random neighbor of the plates starting region
    fronts[index].enqueue({
      plate,
      region:
        voronoiSphere.regions[
          plate.startRegion.region.properties.neighbors[
            randomInteger(
              0,
              plate.startRegion.region.properties.neighbors.length - 1
            )
          ]
        ],
    });
  });

  // while the fronts still have enqueued Regions to process, we will continue
  while (fronts.reduce((memo, q) => memo || !q.isEmpty, false)) {
    // iterate through all the fronts randomly

    // shuffle our fronts
    shuffle<Queue<{ region: Region; plate: Plate }>>(fronts, () =>
      randomFloat(0, 1)
    );

    // deal our fronts
    for (let i = 0; i < fronts.length; i++) {
      const queue = fronts[i];

      const item = queue.dequeue();

      if (!item) {
        continue;
      }
      const { region, plate } = item;

      if (!regionIsAlreadyAssigned(region)) {
        assignRegionToPlate(region, plate);

        // shuffly neighbors to avoid Slovakia syndrome

        shuffle<number>(region.properties.neighbors, () =>
          randomFloat(0, 1)
        ).forEach((regionIndex) => {
          const region = voronoiSphere.regions[regionIndex];
          // if (!regionIsAlreadyAssigned(region)) {
          queue.enqueue({ region, plate });
          // }
        });
      } else {
        const occupyingPlateIndex = assignedRegions[region.properties.index];
        if (occupyingPlateIndex !== plate.index) {
          const occupyingPlate = plates.get(occupyingPlateIndex);
          const externalRegion = occupyingPlate?.regions.get(
            region.properties.index
          );
          if (!externalRegion) {
            continue;
          }
          if (!occupyingPlate) {
            console.warn(
              "no occuplying plate, even though it as assigned",
              occupyingPlateIndex
            );
            continue;
          }
          plate.externalBorderRegions.set(
            region.properties.index,
            externalRegion
          );
          plate.neighbors.set(occupyingPlate.index, occupyingPlate);
          occupyingPlate.neighbors.set(plate.index, plate);
          occupyingPlate?.internalBorderRegions.set(
            region.properties.index,
            externalRegion
          );
        }
      }
    }
  }
}
