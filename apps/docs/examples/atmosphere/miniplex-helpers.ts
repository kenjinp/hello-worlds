import { useEffect, useState } from "react"

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends object
    ? DeepPartial<T[P]>
    : T[P]
}

const useProxy = <T extends object>(object: T) => {
  const [state, setState] = useState(object)

  useEffect(() => {
    console.log("useProxy: ", object)
    const handler = {
      set: (target: T, key: keyof T, value: any) => {
        console.log("proxy set", target, key, value)
        const newState = { ...target, [key]: value }
        setState(newState)
        return true
      },
    }

    const proxy = new Proxy(object, handler)

    return () => {
      // setState(object)
    }
  }, [object])

  return [state, setState] as const
}

export default useProxy
