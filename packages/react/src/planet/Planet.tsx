import {
  Chunk,
  ChunkGeneratedEvent,
  ChunkPendingEvent,
  ChunkWillBeDisposedEvent,
  Planet as HelloPlanet,
  PlanetProps as HelloPlanetProps
} from "@hello-worlds/planets"
import { useRerender } from "@hmans/use-rerender"
import { useFrame } from "@react-three/fiber"
import * as React from "react"
import { Event, Vector3 } from "three"
import { concurrency } from "../defaults"
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
      autoUpdate?: boolean;
    }
>

export const usePlanetChunks = () => {
  const planet = usePlanet()
  const rerender = useRerender()
  const [chunks] = React.useState<Map<number, Chunk & { built: boolean }>>(
    new Map<number, Chunk & { built: boolean }>(),
  )

  React.useEffect(() => {
    const pendingListener = (e: Event) => {
      const { chunk } = e as unknown as ChunkPendingEvent
      const pendingChunk = chunk as Chunk & { built: boolean }
      pendingChunk.built = false
      chunks.set(chunk.id, pendingChunk)
      rerender()
    }
    const createdListener = (e: Event) => {
      const { chunk } = e as unknown as ChunkGeneratedEvent
      const builtChunk = chunk as Chunk & { built: boolean }
      builtChunk.built = false
      chunks.set(chunk.id, builtChunk)
      rerender()
    }
    const willDisposeListener = (e: Event) => {
      const { chunk } = e as unknown as ChunkWillBeDisposedEvent
      chunks.delete(chunk.id)
      rerender()
    }
    planet.addEventListener(ChunkPendingEvent.type, pendingListener)
    planet.addEventListener(ChunkGeneratedEvent.type, createdListener)
    planet.addEventListener(ChunkWillBeDisposedEvent.type, willDisposeListener)
    return () => {
      planet.removeEventListener(ChunkPendingEvent.type, pendingListener)
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
    numWorkers = concurrency,
    lodOrigin,
    position,
    worker,
    autoUpdate = true
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
    autoUpdate && helloPlanet.update(lodOrigin)
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
