import { capitalize, random, randomRange, sample } from "@hello-worlds/core"
import { Language } from "@hello-worlds/tongues"
import Roll from "roll"
import Culture from "./Culture"
import { supportValues } from "./Demographics.values"

const MiToKM = (m: number) => m * 1.609344
const roll = new Roll(random)
const populationDensitionPerSquareKM = {
  min: MiToKM(30),
  max: MiToKM(120),
}
const fullDaysTravelByRoad = MiToKM(30)

const getDensityLevel = (density: number) => {
  if (density >= 100) {
    return "prosperous"
  }
  if (density >= 90) {
    return "burgeoning"
  }
  if (density >= 70) {
    return "middling"
  }
  if (density >= 40) {
    return "backwater"
  }
  return "devastated"
}

const kingdomPopulation = (sizeInMiles: number, density: number) =>
  Math.floor(sizeInMiles * density)

const populationLargestCity = (pop: number) => {
  const P = Math.sqrt(pop)
  const M = roll.roll("2d4").result + 10
  return Math.floor(P * M)
}

export interface City {
  name: string
  population: number
  guards: number
  isCapital: boolean
  kingdom: Kingdom
  amenities: {
    [key: string]: number
  }
}
export class Kingdom {
  public density: number
  public densityLevel: string
  public population: number
  public percentageCultivatedLand: number
  public urbanPopulation: number
  public urbanPopulationPercentage: number
  public urbanCentersPerSquareMile: number
  public cities: City[]
  public towns: City[]
  public age: number
  public castles: number
  public ruinedCastles: number
  culture = new Culture()
  language = new Language()
  languageName = capitalize(this.language.makeWord("Language"))
  public name: string
  public government: string
  capital: City
  constructor(sizeInMiles: number = 100_000) {
    this.density = this.rollPopulationDensity()
    this.densityLevel = getDensityLevel(this.density)
    this.population = kingdomPopulation(sizeInMiles, this.density)
    this.cities = this.createCities()
    this.towns = new Array(
      Math.floor(this.cities.length * roll.roll("2d8").result),
    )
      .fill(0)
      .map((_, index) => {
        const pop = randomRange(1_000, 8_000)
        return {
          isCapital: false,
          name: index.toString(), //this.language.makeName(index.toString()),
          population: pop,
          kingdom: this,
          guards: pop / 150, // slack cities will have half this
          amenities: Object.keys(supportValues).reduce((memo, key) => {
            return {
              ...memo,
              // @ts-ignore
              [key]: Math.floor(pop / supportValues[key]),
            }
          }, {} as City["amenities"]),
        }
      })
    this.urbanPopulation =
      this.cities.reduce((memo, element) => memo + element.population, 0) +
      this.towns.reduce((memo, element) => memo + element.population, 0)
    this.urbanPopulationPercentage =
      (this.urbanPopulation / this.population) * 100
    const howManySquareMilesNeededToSupportPopulation = this.population / 180
    this.percentageCultivatedLand =
      (howManySquareMilesNeededToSupportPopulation / sizeInMiles) * 100
    this.urbanCentersPerSquareMile =
      sizeInMiles / (this.cities.length + this.towns.length)
    this.age = 500
    this.ruinedCastles = Math.floor(
      (this.population / 5_000_000) * Math.sqrt(this.age),
    )
    this.castles = Math.floor(this.population / 50_000)
    this.government = this.makeGovernment()
    this.capital = this.cities.filter(city => city.isCapital)[0]
    this.name = this.makeName()
  }

  hasTrait(traitName: string) {
    return !!this.culture.traits.filter(({ name }) => name === traitName).length
  }

  makeName() {
    let culturalName = this.languageName
    const dynasticName = capitalize(this.language.makeWord("Dynasty"))
    if (this.hasTrait("City State")) {
      culturalName = this.capital.name
    }
    const adjectives = [
      "Tourmaline",
      "Azure",
      "Iron",
      "Glass",
      "Golden",
      "Ruby",
      "Vermillion",
      "Amethyst",
      "Black",
      "Elemental",
      "Honorable",
      "Pearl",
      "Amber",
      "Diamond",
      "Jade",
      "Emerald",
      "Opal",
      "Rose",
    ]

    if (!this.hasTrait("Reavers") && randomRange(1, 20) >= 18) {
      const features = [
        "Court",
        "Realm",
        "Thrones",
        "Throne",
        "Cities",
        "Seat",
        "See",
        "Chamber",
        "Conclave",
        "Circle",
        "Palace",
        "Monestaries",
      ]

      return `The ${sample(adjectives)} ${sample(features)} of ${culturalName}`
    }

    if (this.hasTrait("City State") && this.hasTrait("Refuge")) {
      return `The Free City of ${this.capital.name}`
    }

    if (this.government === "Republic") {
      if (randomRange(1, 20) <= 15) {
        return `The Republic of ${culturalName}`
      }
      return `The Senate and People of ${culturalName}`
    }

    if (this.hasTrait("Mageocracy")) {
      if (this.government === "Arcane Empire") {
        return `The Arcane Empire of ${culturalName}`
      }
      if (randomRange(1, 20) <= 15) {
        return `The Mageocracy of ${culturalName}`
      }
      return `The Sourcerous Realm of ${culturalName}`
    }
    if (this.government === "Shogunate") {
      if (randomRange(1, 20) <= 15) {
        return `The ${sample(adjectives)} Shogunate`
      }
      return `The ${culturalName} Shogunate`
    }

    if (this.government === "Knightly Order") {
      if (this.hasTrait("Venerated Priesthood")) {
        return `The ${sample(adjectives)} Templars`
      }

      if (randomRange(1, 20) <= 15) {
        return `The ${sample(adjectives)} Order`
      }

      return `The ${culturalName} Order`
    }

    if (this.government === "Khanate") {
      if (randomRange(1, 20) <= 15) {
        return `The ${sample(adjectives)} Khanate`
      }
      return `The ${culturalName} Khanate`
    }
    if (this.government === "Horde") {
      if (randomRange(1, 20) <= 15) {
        return `The ${sample(adjectives)} Horde`
      }
      return `The ${culturalName} Horde`
    }
    if (this.government === "Kingdom") {
      if (randomRange(1, 20) <= 15) {
        return `The ${sample(adjectives)} Kingdom`
      }
      return `The ${culturalName} Kingdom`
    }
    if (this.government === "Dominion") {
      return `The ${culturalName} Dominion`
    }
    if (this.government === "Merchant Council") {
      if (randomRange(1, 20) <= 10) {
        return `The ${culturalName} League`
      }
      return `The ${culturalName} Council`
    }
    if (this.government === "Theocratic Republic") {
      if (randomRange(1, 20) <= 10) {
        return `The Holy ${culturalName} Republic`
      }
      return `The Theocratic Republic of ${culturalName}`
    }

    if (this.government === "Viking Moot") {
      if (randomRange(1, 20) <= 10) {
        return `The ${culturalName} Moot`
      }
      return `The ${culturalName} Reavers`
    }
    if (this.culture.hasValue("Autocracy")) {
      if (randomRange(1, 20) <= 15) {
        return `The ${culturalName} Empire`
      }
      if (randomRange(1, 20) <= 15) {
        return `The ${culturalName} Kingdom`
      }
      return `The ${dynasticName} Dynasty`
    }
    if (randomRange(1, 20) <= 15) {
      return `The ${culturalName} Domain`
    }
    return `The ${culturalName} State`
  }

  makeGovernment() {
    if (this.culture.power[0].name === "Democracy") {
      if (this.hasTrait("Reavers")) {
        if (this.hasTrait("Thalassocracy")) {
          return "Pirate Republic"
        }
        return "Viking Moot"
      }
      if (this.hasTrait("Venerated Priesthood")) {
        return "Theocratic Republic"
      }
      if (this.hasTrait("Mageocracy")) {
        return "Thaumocratic Republic"
      }
      if (this.hasTrait("Thalassocracy")) {
        return "Serene Republic"
      }
      return "Republic"
    }
    if (this.culture.power[0].name === "Autocracy") {
      if (this.hasTrait("Steppe Nomads")) {
        if (this.hasTrait("Reavers")) {
          return "Horde"
        }
        return "Khanate"
      }
      if (this.hasTrait("Venerated Priesthood")) {
        if (this.hasTrait("Feudalism")) {
          return "Divine Empire"
        }
        return "Theocratic Empire"
      }
      if (this.hasTrait("Kritarchy")) {
        return "Imperial Kritarchy"
      }
      if (this.hasTrait("Ruler Cult")) {
        return "Celestial Empire"
      }
      if (this.hasTrait("Feudalism")) {
        if (this.hasTrait("Mageocracy")) {
          return "Feudal Magedom"
        }
        return "Kingdom"
      }
      if (this.hasTrait("Way of the Warrior")) {
        if (this.hasTrait("Kritarch")) {
          return "Police State"
        }
        if (this.hasTrait("Mageocracy")) {
          return "Arcane Shogunate"
        }
        return "Shogunate"
      }
      if (this.hasTrait("Mageocracy")) {
        return "Arcane Empire"
      }
      if (this.hasTrait("Corvee Labor")) {
        return "Pharaonic Kingdom"
      }
      return "Dominion"
    }
    if (this.culture.power[0].name === "Oligarchy") {
      if (this.hasTrait("Reavers")) {
        if (this.hasTrait("Thalassocracy")) {
          return "Pirate Parlayment"
        }
        return "Bandit Circle"
      }

      if (this.hasTrait("Venerated Priesthood")) {
        return "Holy Conclave"
      }
      if (this.hasTrait("Way of the Warrior")) {
        if (this.hasTrait("Mageocracy")) {
          return "Spellknight Oathdom"
        }
        return "Knightly Order"
      }
      if (this.hasTrait("Mageocracy")) {
        if (this.hasTrait("Naturalists")) {
          return "Circle of Druids"
        }
        return "Brotherhood of Mages"
      }
      if (this.hasTrait("Merchant Guilds")) {
        return "Merchant Council"
      }
      if (this.hasTrait("Thalassocracy")) {
        return "Serene Plutocracy"
      }
      return "Oligarchy"
    }
    return "Anarchy"
  }

  createCities() {
    const pop = this.population
    let popDecrementer = pop
    const smallestCitySize = 8_000
    const cities: City[] = []
    while (popDecrementer >= smallestCitySize) {
      const lastCity = cities[cities.length - 1]
      const thisCity = {
        name: this.language.makeName(cities.length.toString() + "-city"),
        population: 0,
        amenities: {},
        guards: 0,
        kingdom: this,
        isCapital: false,
      }
      if (cities.length === 0) {
        thisCity.population = populationLargestCity(this.population)
      } else if (cities.length === 1) {
        thisCity.population = Math.floor(
          roll.roll("2d4").result * (lastCity.population * 0.1),
        )
      } else {
        thisCity.population = Math.floor(
          roll.roll("2d4").result * (lastCity.population * 0.05),
        )
      }
      thisCity.amenities = Object.keys(supportValues).reduce((memo, key) => {
        return {
          ...memo,
          // @ts-ignore
          [key]: Math.floor(thisCity.population / supportValues[key]),
        }
      }, {} as City["amenities"])
      thisCity.guards = Math.floor(thisCity.population / 150)
      if (thisCity.population >= smallestCitySize) {
        cities.push(thisCity)
      }
      popDecrementer = thisCity.population
    }

    const capitalCity = (sample(
      sample(cities, randomRange(3, 5)),
    )[0].isCapital = true)

    return cities
  }

  rollPopulationDensity(
    // 5 is a good number that gives sane resultss
    R: number | null = 5,
  ) {
    let popModifier = roll.roll("d8").result
    if (popModifier >= 5) {
      popModifier = 5
    }

    return roll.roll("6d4").result * (R || popModifier)
  }
}
