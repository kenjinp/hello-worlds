import {
  Chunk,
  RingWorld as HelloRingWorld,
  RingWorldProps as HelloRingWorldProps,
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

export const RingWorldContext = React.createContext<HelloRingWorld<any>>(
  {} as HelloRingWorld<any>,
)

export const useRingWorld = () => {
  return React.useContext(RingWorldContext)
}

export const useRingWorldChunks = () => {
  const ringWorld = useRingWorld()
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
    ringWorld.addEventListener(ChunkGeneratedEvent.type, createdListener)
    ringWorld.addEventListener(
      ChunkWillBeDisposedEvent.type,
      willDisposeListener,
    )
    return () => {
      ringWorld.removeEventListener(ChunkGeneratedEvent.type, createdListener)
      ringWorld.removeEventListener(
        ChunkWillBeDisposedEvent.type,
        willDisposeListener,
      )
      chunks.clear()
    }
  }, [ringWorld])

  return Array.from(chunks.values())
}

export interface RingWorldChunksProps {
  children: (chunks: Chunk, index: number) => React.ReactNode
}
export const RingWorldChunks: React.FC<RingWorldChunksProps> = ({
  children,
}) => {
  const chunks = useRingWorldChunks()
  return <>{chunks.map(children)}</>
}

export type RingWorldProps<D> = React.PropsWithChildren<
  Omit<HelloRingWorldProps<D>, "material" | "workerProps"> &
    PartialBy<HelloRingWorldProps<D>["workerProps"], "numWorkers"> & {
      lodOrigin: Vector3
    }
>

function RingWorldInner<D>(
  props: RingWorldProps<D>,
  forwardedRef: React.ForwardedRef<HelloRingWorld<D>>,
) {
  const {
    children,
    radius,
    inverted,
    minCellSize,
    minCellResolution,
    data,
    numWorkers = navigator.hardwareConcurrency || 8,
    lodOrigin,
    length,
    position,
    worker,
    lodDistanceComparisonValue,
  } = props

  const workerProps = React.useMemo(
    () => ({
      numWorkers,
      worker,
    }),
    [worker, numWorkers],
  )

  const helloRingWorld = React.useMemo(() => {
    return new HelloRingWorld<D>({
      radius,
      inverted,
      minCellSize,
      minCellResolution,
      data,
      workerProps,
      position,
      length,
    })
  }, [data, workerProps, radius, length])

  React.useEffect(() => {
    return () => {
      helloRingWorld.dispose()
    }
  }, [])

  React.useEffect(() => {
    if (helloRingWorld) {
      helloRingWorld.inverted = !!inverted
      helloRingWorld.minCellSize = minCellSize
      helloRingWorld.minCellResolution = minCellResolution
      helloRingWorld.position.copy(position)
      if (lodDistanceComparisonValue) {
        helloRingWorld.lodDistanceComparisonValue = lodDistanceComparisonValue
      }
      helloRingWorld.rebuild()
    }
  }, [
    inverted,
    minCellSize,
    minCellResolution,
    position,
    lodDistanceComparisonValue,
  ])

  useFrame(() => {
    helloRingWorld.update(lodOrigin)
  })

  return (
    <RingWorldContext.Provider value={helloRingWorld}>
      <primitive ref={forwardedRef} object={helloRingWorld}>
        {children}
      </primitive>
    </RingWorldContext.Provider>
  )
}

export const RingWorld = React.forwardRef(RingWorldInner) as <D>(
  props: RingWorldProps<D> & {
    ref?: React.ForwardedRef<HelloRingWorld<D>>
  },
) => ReturnType<typeof RingWorldInner<D>>
