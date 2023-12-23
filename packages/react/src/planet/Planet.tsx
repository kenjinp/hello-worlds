import {
  Chunk,
  ChunkGeneratedEvent,
  ChunkPendingEvent,
  ChunkWillBeDisposedEvent,
  Planet as HelloPlanet,
  PlanetProps as HelloPlanetProps,
} from "@hello-worlds/planets"
import { useRerender } from "@hmans/use-rerender"
import { createPortal, useFrame } from "@react-three/fiber"
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
      autoUpdate?: boolean
    }
>

export const usePlanetChunks = () => {
  const planet = usePlanet()
  const rerender = useRerender()
  const [chunks] = React.useState<Map<number, Chunk & { built: boolean }>>(
    new Map<number, Chunk & { built: boolean }>(),
  )
  const chunkArrayRef = React.useRef<Array<Chunk & { built: boolean }>>([])

  React.useEffect(() => {
    const pendingListener = (e: Event) => {
      const { chunk } = e as unknown as ChunkPendingEvent
      const pendingChunk = chunk as Chunk & { built: boolean }
      pendingChunk.built = false
      chunks.set(chunk.id, pendingChunk)
      chunkArrayRef.current = Array.from(chunks.values())
      rerender()
    }
    const createdListener = (e: Event) => {
      const { chunk } = e as unknown as ChunkGeneratedEvent
      const builtChunk = chunk as Chunk & { built: boolean }
      builtChunk.built = true
      chunks.set(chunk.id, builtChunk)
      chunkArrayRef.current = Array.from(chunks.values())
      rerender()
    }
    const willDisposeListener = (e: Event) => {
      const { chunk } = e as unknown as ChunkWillBeDisposedEvent
      chunks.delete(chunk.id)
      chunkArrayRef.current = Array.from(chunks.values())
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
      chunkArrayRef.current = Array.from(chunks.values())
    }
  }, [planet])

  return chunkArrayRef.current
}

export interface PlanetChunksProps {
  children: (chunks: Chunk, index: number) => React.ReactNode
  asChunkChild?: boolean
}

export const PlanetChunks: React.FC<PlanetChunksProps> = ({
  children,
  asChunkChild = true,
}) => {
  const chunks = usePlanetChunks()
  return (
    <>
      {chunks.map(function RenderPlanetChunkChildren(chunk) {
        return asChunkChild
          ? // @ts-ignore
            createPortal(children(chunk, chunk.id) as React.ReactNode, chunk)
          : children(chunk, chunk.id)
      })}
    </>
  )
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
    position = new Vector3(),
    worker,
    autoUpdate = true,
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
      helloPlanet?.dispose()
    }
  }, [helloPlanet])

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
