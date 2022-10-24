import { random } from "../index"

type ElementType<T extends ArrayLike<unknown>> = T extends ArrayLike<infer U>
  ? U
  : never

type ArrayOrString<T extends ArrayLike<unknown>> = T extends string
  ? string
  : ElementType<T>[]

export function shuffle<T extends ArrayLike<unknown> = string>(
  list: ArrayOrString<T>,
): ArrayOrString<T> {
  const newlist: ElementType<T>[] = []
  for (let i = 0; i < list.length; i++) {
    const item = list[i] as ElementType<T>
    newlist.push(item)
  }
  for (let i = list.length - 1; i > 0; i--) {
    const tmp = newlist[i]
    const j = randomRangeInt(i)
    newlist[i] = newlist[j]
    newlist[j] = tmp
  }

  if (newlist.length !== list.length) {
    throw new Error("terrible")
  }

  return (
    typeof list !== "string" ? newlist : newlist.join("")
  ) as ArrayOrString<T>
}

export function choose<T extends ArrayLike<unknown> = string>(
  list: ArrayOrString<T>,
  exponent: number = 1,
) {
  return list[
    Math.floor(Math.pow(random(), exponent) * list.length)
  ] as ElementType<T>
}

export function sample<T = any>(list: T[], number: number = 1) {
  const shuff = shuffle<typeof list>(list)
  return number === 1 ? [shuff[0]] : shuff.slice(0, number)
}

export function randomRangeInt(low: number, high?: number) {
  if (high == undefined) {
    high = low
    low = 0
  }
  return Math.floor(random() * (high - low)) + low
}

export const randomRange = (min: number, max: number) => {
  return random() * (max - min) + min
}

export function capitalize(word: string) {
  return word[0].toUpperCase() + word.slice(1)
}
