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

  React.useEffect(() => {
    if (!planet) return
    const pendingListener = (e: Event) => {
      const { chunk } = e as unknown as ChunkPendingEvent
      console.time(`chunk: ${chunk.id.toString()}`)
    }
    const createdListener = (e: Event) => {
      const { chunk } = e as unknown as ChunkGeneratedEvent
      console.timeEnd(`chunk: ${chunk.id.toString()}`)
    }
    const willDisposeListener = (e: Event) => {
      // const { chunk } = e as unknown as ChunkWillBeDisposedEvent
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
  }, [planet])
  return null
}
