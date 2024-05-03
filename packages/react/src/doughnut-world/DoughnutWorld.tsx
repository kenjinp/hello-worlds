import {
  Chunk,
  ChunkGeneratedEvent,
  ChunkWillBeDisposedEvent,
  DoughnutWorld as HelloDoughnutWorld,
  DoughnutWorldProps as HelloDoughnutWorldProps,
} from "@hello-worlds/planets"
import { useRerender } from "@hmans/use-rerender"
import { useFrame } from "@react-three/fiber"
import * as React from "react"
import { Event, Vector3 } from "three"
import { concurrency } from "../defaults"
import { PartialBy } from "../utils/types"

export const DoughnutWorldContext = React.createContext<
  HelloDoughnutWorld<any>
>({} as HelloDoughnutWorld<any>)

export const useDoughnutWorld = () => {
  return React.useContext(DoughnutWorldContext)
}

export const useDoughnutWorldChunks = () => {
  const ringWorld = useDoughnutWorld()
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

export interface DoughnutWorldChunksProps {
  children: (chunks: Chunk, index: number) => React.ReactNode
}
export const DoughnutWorldChunks: React.FC<DoughnutWorldChunksProps> = ({
  children,
}) => {
  const chunks = useDoughnutWorldChunks()
  return <>{chunks.map(children)}</>
}

export type DoughnutWorldProps<D> = React.PropsWithChildren<
  Omit<HelloDoughnutWorldProps<D>, "material" | "workerProps"> &
    PartialBy<HelloDoughnutWorldProps<D>["workerProps"], "numWorkers"> & {
      lodOrigin: Vector3
    }
>

function DoughnutWorldInner<D>(
  props: DoughnutWorldProps<D>,
  forwardedRef: React.ForwardedRef<HelloDoughnutWorld<D>>,
) {
  const {
    children,
    radius,
    inverted,
    minCellSize,
    minCellResolution,
    data,
    numWorkers = concurrency,
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

  const helloDoughnutWorld = React.useMemo(() => {
    return new HelloDoughnutWorld<D>({
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
      helloDoughnutWorld.dispose()
    }
  }, [])

  React.useEffect(() => {
    if (helloDoughnutWorld) {
      helloDoughnutWorld.inverted = !!inverted
      helloDoughnutWorld.minCellSize = minCellSize
      helloDoughnutWorld.minCellResolution = minCellResolution
      helloDoughnutWorld.position.copy(position)
      if (lodDistanceComparisonValue) {
        helloDoughnutWorld.lodDistanceComparisonValue =
          lodDistanceComparisonValue
      }
      helloDoughnutWorld.rebuild()
    }
  }, [
    inverted,
    minCellSize,
    minCellResolution,
    position,
    lodDistanceComparisonValue,
  ])

  useFrame(() => {
    helloDoughnutWorld.update(lodOrigin)
  })

  return (
    <DoughnutWorldContext.Provider value={helloDoughnutWorld}>
      <primitive ref={forwardedRef} object={helloDoughnutWorld}>
        {children}
      </primitive>
    </DoughnutWorldContext.Provider>
  )
}

export const DoughnutWorld = React.forwardRef(DoughnutWorldInner) as <D>(
  props: DoughnutWorldProps<D> & {
    ref?: React.ForwardedRef<HelloDoughnutWorld<D>>
  },
) => ReturnType<typeof DoughnutWorldInner<D>>
