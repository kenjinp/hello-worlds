export const concurrency = Math.min(
  navigator.hardwareConcurrency - 1 || 8,
  navigator.hardwareConcurrency,
)
