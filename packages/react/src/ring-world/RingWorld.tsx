import {
  RingWorld as HelloRingWorld,
  RingWorldProps as HelloRingWorldProps,
} from "@hello-worlds/planets"
import { useFrame } from "@react-three/fiber"
import * as React from "react"
import { Vector3 } from "three"
import { PartialBy } from "../utils/types"

export const RingWorldContext = React.createContext<HelloRingWorld<any>>(
  {} as HelloRingWorld<any>,
)

export const useRingWorld = () => {
  return React.useContext(RingWorldContext)
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
      helloRingWorld.rebuild()
    }
  }, [inverted, minCellSize, minCellResolution, position])

  useFrame(() => {
    helloRingWorld.update(lodOrigin)
  })

  return (
    <primitive ref={forwardedRef} object={helloRingWorld}>
      {children}
    </primitive>
  )
}

export const RingWorld = React.forwardRef(RingWorldInner) as <D>(
  props: RingWorldProps<D> & {
    ref?: React.ForwardedRef<HelloRingWorld<D>>
  },
) => ReturnType<typeof RingWorldInner<D>>
