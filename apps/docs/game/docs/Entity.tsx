import { Button } from "@components/button/Button"
import { doFocusPlanet } from "@game/Actions"
import { Entity } from "@game/Entity"
import { AU, EARTH_RADIUS, km, SUN_RADIUS } from "@game/Math"
import * as React from "react"
import { match } from "ts-pattern"
import { getType } from "./SystemMap"
import { Tooltip } from "./Tooltip"

export const EntityDoc: React.FC<{ entity: Entity }> = ({ entity }) => {
  const type = getType(entity)

  return match(type)
    .with("planet", () => <PlanetDoc entity={entity} />)
    .with("star", () => <StarDoc entity={entity} />)
    .with("moon", () => <MoonDoc entity={entity} />)
    .otherwise(() => <OtherDoc entity={entity} />)
}

var special = [
  "zeroth",
  "first",
  "second",
  "third",
  "fourth",
  "fifth",
  "sixth",
  "seventh",
  "eighth",
  "ninth",
  "tenth",
  "eleventh",
  "twelfth",
  "thirteenth",
  "fourteenth",
  "fifteenth",
  "sixteenth",
  "seventeenth",
  "eighteenth",
  "nineteenth",
]
var deca = [
  "twent",
  "thirt",
  "fort",
  "fift",
  "sixt",
  "sevent",
  "eight",
  "ninet",
]

function stringifyNumber(n) {
  if (n < 20) return special[n]
  if (n % 10 === 0) return deca[Math.floor(n / 10) - 2] + "ieth"
  return deca[Math.floor(n / 10) - 2] + "y-" + special[n % 10]
}

export const PlanetDoc: React.FC<{ entity: Entity }> = ({ entity }) => {
  return (
    <div>
      <h1>
        <Tooltip name="entity" entity={entity} />
        {/* <Tooltip name="entity" entity={entity.satelliteOf} />{" "}
        {romanize(entity.parentIndex + 1)}) */}
      </h1>
      <p>
        <Tooltip name="entity" entity={entity} /> is a <Tooltip name="planet" />
        , the {stringifyNumber(entity.parentIndex + 1)} satellite of{" "}
        <Tooltip name="entity" entity={entity.satelliteOf} />
      </p>
      <Button
        onClick={() => {
          doFocusPlanet(entity)
        }}
      >
        Focus Object
      </Button>
      <hr />
      <p>Terrain generation type: {entity.planetType}</p>
      <p>
        Orbital distance:{" "}
        {(
          (entity.position.distanceTo(entity.satelliteOf.position) -
            entity.satelliteOf.radius) /
          AU
        ).toLocaleString()}
        AU
      </p>
      <p>Radius: {(entity.radius / EARTH_RADIUS).toFixed(2)} R🜨</p>
      <p>
        {entity.atmosphereRadius && (
          <>
            Atmospheric pressure{": "}
            {(entity.atmosphereRadius / EARTH_RADIUS).toFixed(2) + " Atmo🜨"}
          </>
        )}
      </p>
    </div>
  )
}

export const MoonDoc: React.FC<{ entity: Entity }> = ({ entity }) => {
  return (
    <div>
      <h1>
        <Tooltip name="entity" entity={entity} />
        {/* <Tooltip name="entity" entity={entity.satelliteOf} />{" "}
        {romanize(entity.parentIndex + 1)}) */}
      </h1>
      <p>
        <Tooltip name="entity" entity={entity} /> is a <Tooltip name="moon" />,
        the {stringifyNumber(entity.parentIndex + 1)} moon of{" "}
        <Tooltip name="entity" entity={entity.satelliteOf} />
      </p>
      <Button
        onClick={() => {
          doFocusPlanet(entity)
        }}
      >
        Focus Object
      </Button>
      <hr />
      <p>Terrain generation type: {entity.planetType}</p>
      <p>
        Orbital distance:{" "}
        {(
          (entity.position.distanceTo(entity.satelliteOf.position) -
            entity.satelliteOf.radius) /
          km
        ).toLocaleString()}
        km
      </p>
      <p>Radius: {(entity.radius / EARTH_RADIUS).toFixed(2)} R🜨</p>
      <p>
        {entity.atmosphereRadius && (
          <>
            Atmospheric pressure{": "}
            {(entity.atmosphereRadius / EARTH_RADIUS).toFixed(2) + " Atmo R🜨"}
          </>
        )}
      </p>
    </div>
  )
}

export const StarDoc: React.FC<{ entity: Entity }> = ({ entity }) => {
  return (
    <div>
      <h1>
        <Tooltip name="entity" entity={entity} />
      </h1>
      <p>
        <Tooltip name="entity" entity={entity} /> is a <Tooltip name="star" />
      </p>
      <p>Radius: {(entity.radius / SUN_RADIUS).toFixed(2)} R☉︎</p>
    </div>
  )
}

export const OtherDoc: React.FC<{ entity: Entity }> = ({ entity }) => {
  return (
    <div>
      <h1>
        <Tooltip name="entity" entity={entity} />
      </h1>
    </div>
  )
}
