import {
  Planet as HelloPlanet,
  PlanetProps as HelloPlanetProps,
} from "@hello-worlds/planets"
import { useFrame } from "@react-three/fiber"
import * as React from "react"
import { Mesh, Vector3 } from "three"
import { useFrameEffect } from "../utils/useFrameEffect"

// This should only be accessed through the Planet component, and therefore should always be defined
// if someone tries to access him outside of a context, it should error somehow
const PlanetContext = React.createContext<HelloPlanet<any, any>>(
  {} as HelloPlanet<any, any>,
)

export const usePlanet = () => {
  return React.useContext(PlanetContext)
}

export type PlanetProps<T, I> = React.PropsWithChildren<{
  planetProps: HelloPlanetProps
  numWorkers?: number
  data?: T
  initialData?: I
  lodOrigin: Vector3
  worker: new () => Worker
}>

function PlanetInner<T, I>(
  props: PlanetProps<T, I>,
  ref: React.ForwardedRef<HelloPlanet<T, I>>,
) {
  const {
    children,
    lodOrigin,
    worker,
    data,
    initialData,
    planetProps,
    numWorkers,
  } = props
  const planetGroupRef = React.useRef<Mesh>(null)
  const [planetEngine, setPE] = React.useState<HelloPlanet<T, I>>()

  React.useImperativeHandle(ref, () => planetEngine as HelloPlanet<T, I>, [
    planetEngine,
  ])

  React.useEffect(() => {
    if (!planetEngine) {
      return
    }
    planetEngine.planetProps = {
      ...planetEngine.planetProps,
      ...planetProps,
    }
    planetEngine.rebuild(data as T)
  }, [data, planetEngine])

  React.useEffect(() => {
    const pe = new HelloPlanet<T, I>(
      planetProps,
      initialData as I,
      worker,
      numWorkers,
    )
    setPE(pe)
    return () => {
      pe.destroy()
    }
  }, [planetProps, initialData])

  React.useEffect(() => {
    if (!planetEngine) {
      return
    }
    if (planetGroupRef.current) {
      planetGroupRef.current.add(planetEngine.rootGroup)
    }
    return () => {
      if (planetGroupRef.current) {
        planetGroupRef.current.remove(planetEngine.rootGroup)
      }
    }
  }, [planetEngine, planetGroupRef])

  useFrame(() => {
    if (!planetEngine) {
      return
    }
    if (planetEngine.planetProps) {
      planetEngine.update(lodOrigin, data as T)
    }
  })

  useFrameEffect(
    () => planetGroupRef.current?.material,
    mat => {
      if (!planetEngine || !mat || Array.isArray(mat)) {
        return
      }
      console.log("New Mat")
      planetEngine.material = mat
    },
  )

  return planetEngine ? (
    <PlanetContext.Provider value={planetEngine as HelloPlanet<T, I>}>
      <mesh ref={planetGroupRef}>{children}</mesh>
    </PlanetContext.Provider>
  ) : null
}

export const Planet = React.forwardRef(PlanetInner) as <T, I>(
  props: PlanetProps<T, I> & { ref?: React.ForwardedRef<HelloPlanet<T, I>> },
) => ReturnType<typeof PlanetInner<T, I>>
