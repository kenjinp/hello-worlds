const navigatorConcurrency =
  typeof navigator === "undefined" ? 8 : navigator.hardwareConcurrency

export const concurrency = Math.min(
  navigatorConcurrency - 1 || 8,
  navigatorConcurrency,
)
