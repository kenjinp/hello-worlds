import {
  Chunk,
  ChunkGeneratedEvent,
  ChunkWillBeDisposedEvent,
  Planet as HelloPlanet,
  PlanetProps as HelloPlanetProps,
} from "@hello-worlds/planets"
import { useRerender } from "@hmans/use-rerender"
import { useFrame } from "@react-three/fiber"
import * as React from "react"
import { Event, Vector3 } from "three"
import { PartialBy } from "../utils/types"

export const PlanetContext = React.createContext<HelloPlanet<any>>(
  {} as HelloPlanet<any>,
)

export const usePlanet = () => {
  return React.useContext(PlanetContext)
}

export type PlanetProps<D> = React.PropsWithChildren<
  Omit<HelloPlanetProps<D>, "material" | "workerProps"> &
    PartialBy<HelloPlanetProps<D>["workerProps"], "numWorkers"> & {
      lodOrigin: Vector3
    }
>

export const usePlanetChunks = () => {
  const planet = usePlanet()
  const rerender = useRerender()
  const [chunks] = React.useState<Map<number, Chunk>>(new Map<number, Chunk>())

  React.useEffect(() => {
    const createdListener = (e: Event) => {
      const { chunk } = e as unknown as ChunkGeneratedEvent
      chunks.set(chunk.id, chunk)
      rerender()
    }
    const willDisposeListener = (e: Event) => {
      const { chunk } = e as unknown as ChunkWillBeDisposedEvent
      chunks.delete(chunk.id)
      rerender()
    }
    planet.addEventListener(ChunkGeneratedEvent.type, createdListener)
    planet.addEventListener(ChunkWillBeDisposedEvent.type, willDisposeListener)
    return () => {
      planet.removeEventListener(ChunkGeneratedEvent.type, createdListener)
      planet.removeEventListener(
        ChunkWillBeDisposedEvent.type,
        willDisposeListener,
      )
      chunks.clear()
    }
  }, [planet])

  return Array.from(chunks.values())
}

export interface PlanetChunksProps {
  children: (chunks: Chunk, index: number) => React.ReactNode
}
export const PlanetChunks: React.FC<PlanetChunksProps> = ({ children }) => {
  const chunks = usePlanetChunks()
  return <>{chunks.map(children)}</>
}

function PlanetInner<D>(
  props: PlanetProps<D>,
  forwardedRef: React.ForwardedRef<HelloPlanet<D>>,
) {
  const {
    children,
    radius,
    inverted,
    minCellSize,
    minCellResolution,
    data,
    lodDistanceComparisonValue,
    numWorkers = navigator.hardwareConcurrency || 8,
    lodOrigin,
    position,
    worker,
  } = props

  const workerProps = React.useMemo(
    () => ({
      numWorkers,
      worker,
    }),
    [worker, numWorkers],
  )

  const helloPlanet = React.useMemo(() => {
    return new HelloPlanet<D>({
      radius,
      inverted,
      minCellSize,
      minCellResolution,
      data,
      workerProps,
      position,
    })
  }, [data, workerProps, radius])

  React.useEffect(() => {
    return () => {
      helloPlanet.dispose()
    }
  }, [])

  React.useEffect(() => {
    if (helloPlanet) {
      helloPlanet.inverted = !!inverted
      helloPlanet.minCellSize = minCellSize
      helloPlanet.minCellResolution = minCellResolution
      helloPlanet.position.copy(position)
      if (lodDistanceComparisonValue) {
        helloPlanet.lodDistanceComparisonValue = lodDistanceComparisonValue
      }
      helloPlanet.rebuild()
    }
  }, [
    inverted,
    minCellSize,
    minCellResolution,
    position,
    lodDistanceComparisonValue,
  ])

  useFrame(() => {
    helloPlanet.update(lodOrigin)
  })

  return (
    <PlanetContext.Provider value={helloPlanet}>
      <primitive ref={forwardedRef} object={helloPlanet}>
        {children}
      </primitive>
    </PlanetContext.Provider>
  )
}

export const Planet = React.forwardRef(PlanetInner) as <D>(
  props: PlanetProps<D> & {
    ref?: React.ForwardedRef<HelloPlanet<D>>
  },
) => ReturnType<typeof PlanetInner<D>>
