import Roll from "roll";
import { MathUtils } from "three";
import { supportValues } from "./Demographics.values";

const MiToKM = (m: number) => m * 1.609344;
const roll = new Roll();
const populationDensitionPerSquareKM = {
  min: MiToKM(30),
  max: MiToKM(120),
};
const fullDaysTravelByRoad = MiToKM(30);

const getDensityLevel = (density: number) => {
  if (density >= 100) {
    return "prosperous";
  }
  if (density >= 90) {
    return "burgeoning";
  }
  if (density >= 70) {
    return "middling";
  }
  if (density >= 40) {
    return "backwater";
  }
  return "devastated";
};

const kingdomPopulation = (sizeInMiles: number, density: number) =>
  Math.floor(sizeInMiles * density);

const populationLargestCity = (pop: number) => {
  const P = Math.sqrt(pop);
  const M = roll.roll("2d4").result + 10;
  return Math.floor(P * M);
};

export interface City {
  name: string;
  population: number;
  guards: number;
  amenities: {
    [key: string]: number;
  };
}
export default class Kingdom {
  public density: number;
  public densityLevel: string;
  public population: number;
  public percentageCultivatedLand: number;
  public urbanPopulation: number;
  public urbanPopulationPercentage: number;
  public urbanCentersPerSquareMile: number;
  public cities: City[];
  public towns: City[];
  public age: number;
  public castles: number;
  public ruinedCastles: number;
  constructor(sizeInMiles: number = 100_000) {
    this.density = this.rollPopulationDensity();
    this.densityLevel = getDensityLevel(this.density);
    this.population = kingdomPopulation(sizeInMiles, this.density);
    this.cities = this.createCities();
    this.towns = new Array(
      Math.floor(this.cities.length * roll.roll("2d8").result)
    )
      .fill(0)
      .map((_, index) => {
        const pop = MathUtils.randInt(1_000, 8_000);
        return {
          name: index.toString(),
          population: pop,
          guards: pop / 150, // slack cities will have half this
          amenities: Object.keys(supportValues).reduce((memo, key) => {
            return {
              ...memo,
              // @ts-ignore
              [key]: Math.floor(pop / supportValues[key]),
            };
          }, {} as City["amenities"]),
        };
      });
    this.urbanPopulation =
      this.cities.reduce((memo, element) => memo + element.population, 0) +
      this.towns.reduce((memo, element) => memo + element.population, 0);
    this.urbanPopulationPercentage =
      (this.urbanPopulation / this.population) * 100;
    const howManySquareMilesNeededToSupportPopulation = this.population / 180;
    this.percentageCultivatedLand =
      (howManySquareMilesNeededToSupportPopulation / sizeInMiles) * 100;
    this.urbanCentersPerSquareMile =
      sizeInMiles / (this.cities.length + this.towns.length);
    this.age = 500;
    this.ruinedCastles = Math.floor(
      (this.population / 5_000_000) * Math.sqrt(this.age)
    );
    this.castles = Math.floor(this.population / 50_000);
  }

  createCities() {
    const pop = this.population;
    let popDecrementer = pop;
    const smallestCitySize = 8_000;
    const cities: City[] = [];
    while (popDecrementer >= smallestCitySize) {
      const lastCity = cities[cities.length - 1];
      const thisCity = {
        name: cities.length.toString(),
        population: 0,
        amenities: {},
        guards: 0,
      };
      if (cities.length === 0) {
        thisCity.population = populationLargestCity(this.population);
      } else if (cities.length === 1) {
        thisCity.population = Math.floor(
          roll.roll("2d4").result * (lastCity.population * 0.1)
        );
      } else {
        thisCity.population = Math.floor(
          roll.roll("2d4").result * (lastCity.population * 0.05)
        );
      }
      thisCity.amenities = Object.keys(supportValues).reduce((memo, key) => {
        return {
          ...memo,
          // @ts-ignore
          [key]: Math.floor(thisCity.population / supportValues[key]),
        };
      }, {} as City["amenities"]);
      thisCity.guards = Math.floor(thisCity.population / 150);
      if (thisCity.population >= smallestCitySize) {
        cities.push(thisCity);
      }
      popDecrementer = thisCity.population;
    }
    return cities;
  }

  rollPopulationDensity(
    // 5 is a good number that gives sane resultss
    R: number | null = 5
  ) {
    let popModifier = roll.roll("d8").result;
    if (popModifier >= 5) {
      popModifier = 5;
    }

    return roll.roll("6d4").result * (R || popModifier);
  }
}
