import {
  Chunk,
  FlatWorld as HelloFlatWorld,
  FlatWorldProps as HelloFlatWorldProps,
} from "@hello-worlds/planets"
import {
  ChunkGeneratedEvent,
  ChunkWillBeDisposedEvent,
} from "@hello-worlds/planets/src/chunk/Events"
import { useRerender } from "@hmans/use-rerender"
import { useFrame } from "@react-three/fiber"
import * as React from "react"
import { Event, Vector3 } from "three"
import { PartialBy } from "../utils/types"

export const FlatWorldContext = React.createContext<HelloFlatWorld<any>>(
  {} as HelloFlatWorld<any>,
)

export const useFlatWorld = () => {
  return React.useContext(FlatWorldContext)
}

export type FlatWorldProps<D> = React.PropsWithChildren<
  Omit<HelloFlatWorldProps<D>, "material" | "workerProps"> &
    PartialBy<HelloFlatWorldProps<D>["workerProps"], "numWorkers"> & {
      lodOrigin: Vector3
    }
>

export const useFlatWorldChunks = () => {
  const planet = useFlatWorld()
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

export interface FlatWorldChunksProps {
  children: (chunks: Chunk, index: number) => React.ReactNode
}
export const FlatWorldChunks: React.FC<FlatWorldChunksProps> = ({
  children,
}) => {
  const chunks = useFlatWorldChunks()
  return <>{chunks.map(children)}</>
}

function FlatWorldInner<D>(
  props: FlatWorldProps<D>,
  forwardedRef: React.ForwardedRef<HelloFlatWorld<D>>,
) {
  const {
    children,
    inverted,
    minCellSize,
    minCellResolution,
    data,
    numWorkers = navigator.hardwareConcurrency || 8,
    lodOrigin,
    position,
    worker,
    size,
    lodDistanceComparisonValue,
  } = props

  const workerProps = React.useMemo(
    () => ({
      numWorkers,
      worker,
    }),
    [worker, numWorkers],
  )

  const helloFlatWorld = React.useMemo(() => {
    return new HelloFlatWorld<D>({
      inverted,
      minCellSize,
      minCellResolution,
      data,
      workerProps,
      position,
      size,
    })
  }, [data, workerProps, size])

  React.useEffect(() => {
    return () => {
      helloFlatWorld.dispose()
    }
  }, [])

  React.useEffect(() => {
    if (helloFlatWorld) {
      helloFlatWorld.inverted = !!inverted
      helloFlatWorld.minCellSize = minCellSize
      helloFlatWorld.minCellResolution = minCellResolution
      helloFlatWorld.position.copy(position)
      if (lodDistanceComparisonValue) {
        helloFlatWorld.lodDistanceComparisonValue = lodDistanceComparisonValue
      }
      helloFlatWorld.rebuild()
    }
  }, [
    inverted,
    minCellSize,
    minCellResolution,
    position,
    lodDistanceComparisonValue,
  ])

  useFrame(() => {
    helloFlatWorld.update(lodOrigin)
  })

  return (
    <FlatWorldContext.Provider value={helloFlatWorld}>
      <primitive ref={forwardedRef} object={helloFlatWorld}>
        {children}
      </primitive>
    </FlatWorldContext.Provider>
  )
}

export const FlatWorld = React.forwardRef(FlatWorldInner) as <D>(
  props: FlatWorldProps<D> & {
    ref?: React.ForwardedRef<HelloFlatWorld<D>>
  },
) => ReturnType<typeof FlatWorldInner<D>>
