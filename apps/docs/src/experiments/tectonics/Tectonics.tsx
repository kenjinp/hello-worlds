import { OrbitCamera, Planet as HelloPlanet } from "@hello-worlds/react"
import { Html } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { randomSpherePoint } from "@site/../../packages/planets/dist/esm"
import { Leva, useControls } from "leva"
import * as React from "react"
import {
  BackSide,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Mesh,
  MeshBasicMaterial,
  Sphere,
  Vector3,
} from "three"
import planetWorker from "./Planet.worker"
import { PlateMovement } from "./tectonics/Movement"
import { PlateLabels } from "./tectonics/PlateLabel"
import {
  TectonicsComponent,
  useTectonics,
} from "./tectonics/TectonicsComponent"
import { VoronoiSphere } from "./voronoi/Voronoi"

const material = new MeshBasicMaterial({ vertexColors: true, side: BackSide })

// const MemoPlanet = React.memo(HelloPlanet);

const TectonicPlanet: React.FC<
  React.PropsWithChildren<{ radius: number; seaLevel: number }>
> = ({ radius, seaLevel, children }) => {
  const { camera } = useThree()
  const tectonics = useTectonics()
  const subduction = useControls("subduction", {
    exponential: 0.005,
    modifier: 100,
  })

  const [randomTestPoint] = React.useState(() => {
    return randomSpherePoint(0, 0, 0, radius)
  })

  const data = React.useMemo(
    () => ({
      tectonics,
      seaLevel,
      subductionConstants: subduction,
      randomTestPoint,
    }),
    [subduction, seaLevel, tectonics],
  )

  const planetProps = React.useMemo(
    () => ({
      radius,
      minCellSize: 25,
      minCellResolution: 125,
    }),
    [radius],
  )

  return (
    <HelloPlanet
      position={new Vector3(0, 0, 0)}
      radius={planetProps.radius}
      minCellSize={planetProps.minCellSize}
      minCellResolution={planetProps.minCellResolution}
      lodOrigin={camera.position}
      worker={planetWorker}
      data={data}
    >
      {children}
    </HelloPlanet>
  )
}

export const Planet: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const planet = useControls("planet", {
    planetRadius: {
      min: 100,
      max: 6_000_000,
      value: 20_000,
      step: 10,
    },
    jitter: {
      min: -10.0,
      max: 10.0,
      value: 1.0,
      step: 0.01,
    },
    numberPoints: {
      min: 32,
      // max: 50_000,
      value: 10_000,
      step: 10,
    },
    pointsColor: "#000000",
    pointsSize: 100,
    showPlanet: true,
    seaLevel: 0,
  })

  const tectonic = useControls("tectonics", {
    numberOfPlates: {
      min: 2,
      max: 100,
      value: 36,
      step: 1,
    },
    showPlates: false,
    showLabels: false,
    showMovementVectors: false,
    showInternalBorders: false,
    // showPlateEdges: false,
    showPoints: false,
  })

  const { camera } = useThree()

  const meshRef = React.useRef<Mesh>(null)
  const [sphere, setSphere] = React.useState<Sphere | null>(null)
  const [target, setTarget] = React.useState(new Vector3())
  const pointsRef = React.useRef<BufferGeometry>(null)
  const [selected, setSelected] = React.useState<number>()
  const sphereRef = React.useRef<Mesh>(null)

  const [voronoi, setVoronoi] = React.useState(() =>
    VoronoiSphere.createFromFibonacciSphere(
      planet.numberPoints,
      planet.jitter,
      planet.planetRadius,
      Math.random,
    ),
  )

  React.useEffect(() => {
    setVoronoi(
      VoronoiSphere.createFromFibonacciSphere(
        planet.numberPoints,
        planet.jitter,
        planet.planetRadius,
        Math.random,
      ),
    )
  }, [planet.planetRadius, planet.jitter, planet.numberPoints])

  React.useEffect(() => {
    if (meshRef.current && sphereRef.current) {
      setSphere(new Sphere(meshRef.current.position, planet.planetRadius))

      const tmpColor = new Color()
      const pointsColor = new Color().setStyle(planet.pointsColor)
      const regions = voronoi.regions

      const points = []
      const pointsColors = []
      const regionColors = []
      const regionVerts = []

      for (let i = 0; i < regions.length; i++) {
        const feature = regions[i]

        const { x, y, z } = feature.properties.siteXYZ
        const featureColor = tmpColor.setHex(Math.random() * 0xffffff).clone()

        points.push(x, y, z)
        pointsColors.push(pointsColor.r, pointsColor.g, pointsColor.b)

        regionVerts.push(...feature.geometry.vertices)

        for (let c = 0; c < feature.geometry.vertices.length; c += 3) {
          regionColors.push(featureColor.r, featureColor.g, featureColor.b)
        }
      }

      meshRef.current.geometry.setAttribute(
        "position",
        new Float32BufferAttribute(regionVerts, 3),
      )
      meshRef.current.geometry.setAttribute(
        "color",
        new Float32BufferAttribute(regionColors, 3),
      )

      meshRef.current.geometry.computeVertexNormals()

      if (pointsRef.current) {
        pointsRef.current.setAttribute(
          "position",
          new Float32BufferAttribute(points, 3),
        )
        pointsRef.current.setAttribute(
          "color",
          new Float32BufferAttribute(pointsColors, 3),
        )
      }
    }
  }, [meshRef, planet, pointsRef, sphereRef, voronoi])

  React.useEffect(() => {
    camera.position.copy(
      new Vector3(planet.planetRadius * 3, 0, planet.planetRadius * 3),
    )
    camera.lookAt(new Vector3(0, 0, 0))
  }, [planet.planetRadius])

  const handlePointer = e => {
    e.ray.intersectSphere(sphere, target)
    const intersection = target.clone()
    setTarget(intersection)
    const selection = voronoi.find.fromCartesian(intersection)
    setSelected(selection)
  }

  const selectedPosition = new Vector3()
  if (selected) {
    selectedPosition.copy(voronoi.regions[selected].properties.siteXYZ)
  }

  return (
    <group>
      <Html>
        <Leva />
      </Html>
      <mesh frustumCulled={false}>
        <mesh
          scale={
            new Vector3(
              planet.planetRadius,
              planet.planetRadius,
              planet.planetRadius,
            )
          }
          ref={sphereRef}
          onClick={handlePointer}
        >
          <icosahedronGeometry args={[1, 15]} />
          <meshBasicMaterial vertexColors visible={false} />
        </mesh>
        <points visible={tectonic.showPoints}>
          <pointsMaterial size={planet.pointsSize} vertexColors />
          <bufferGeometry ref={pointsRef} />
        </points>
        {/* 
        {Number.isFinite(selected) && (
          <mesh scale={new Vector3(500, 500, 500)} position={selectedPosition}>
            <sphereGeometry />
            <meshBasicMaterial color="pink" />
          </mesh>
        )}

        <mesh scale={new Vector3(500, 500, 500)} position={target}>
          <sphereGeometry />
          <meshBasicMaterial color="blue" />
        </mesh> */}

        <TectonicsComponent
          numberOfPlates={tectonic.numberOfPlates}
          voronoiSphere={voronoi}
          visible={tectonic.showPlates}
          showInternalBorders={tectonic.showInternalBorders}
        >
          {tectonic.showLabels && <PlateLabels occludeRef={[sphereRef]} />}
          {planet.showPlanet && (
            <TectonicPlanet
              radius={planet.planetRadius}
              seaLevel={planet.seaLevel}
            >
              <meshStandardMaterial vertexColors side={2} />
              <OrbitCamera />
            </TectonicPlanet>
          )}

          {tectonic.showMovementVectors && <PlateMovement />}
          {/* {tectonic.showPlateEdges && <EdgePoints />} */}
        </TectonicsComponent>

        <mesh ref={meshRef}>
          <bufferGeometry />
          <meshStandardMaterial vertexColors visible={false} />
        </mesh>
      </mesh>
    </group>
  )
}

export default Planet
