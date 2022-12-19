import {
  ChunkGeneratedEvent,
  ChunkPendingEvent,
  ChunkWillBeDisposedEvent,
} from "@site/../../packages/planets/dist/esm"
import { usePlanet } from "@site/../../packages/react/dist/esm"
import * as React from "react"
import { Event } from "three"

export const ChunkDebugger: React.FC = () => {
  const planet = usePlanet()

  const map = React.useMemo(() => new Map<number, Date>(), [])

  React.useEffect(() => {
    if (!map || !planet) return
    const pendingListener = (e: Event) => {
      const { chunk } = e as unknown as ChunkPendingEvent
      map.set(chunk.id, new Date())
    }
    const createdListener = (e: Event) => {
      const { chunk } = e as unknown as ChunkGeneratedEvent
      if (map.has(chunk.id)) {
        console.log(
          "chunk",
          chunk.id,
          "took",
          new Date().getTime() - map.get(chunk.id)!.getTime(),
          "ms",
        )
      } else {
        console.log("chunk", chunk.id, "was never pending")
      }
    }
    const willDisposeListener = (e: Event) => {
      const { chunk } = e as unknown as ChunkWillBeDisposedEvent
      map.delete(chunk.id)
    }
    planet.addEventListener(ChunkPendingEvent.type, pendingListener)
    planet.addEventListener(ChunkGeneratedEvent.type, createdListener)
    planet.addEventListener(ChunkWillBeDisposedEvent.type, willDisposeListener)
    return () => {
      planet.removeEventListener(ChunkPendingEvent.type, pendingListener)
      planet.removeEventListener(ChunkGeneratedEvent.type, createdListener)
      planet.addEventListener(
        ChunkWillBeDisposedEvent.type,
        willDisposeListener,
      )
    }
  }, [planet, map])
  return null
}
