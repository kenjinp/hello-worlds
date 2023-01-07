import { useFrame, useThree } from "@react-three/fiber"
import { useRouter } from "next/router"

let lastTime = 0
export function useSyncUrl() {
  const camera = useThree(s => s.camera)
  const router = useRouter()

  useFrame(({ clock }, dl) => {
    const translation = {
      rotation: camera.quaternion,
      position: camera.position,
    }

    if (clock.getElapsedTime() - lastTime >= 1) {
      queueMicrotask(() => {
        router.replace(
          {
            pathname: router.pathname,
            query: {
              ...router.query,
              translation: btoa(JSON.stringify(translation)),
            },
          },
          undefined,
          { shallow: true },
        )
      })

      lastTime = clock.getElapsedTime()
    }
  })
}
