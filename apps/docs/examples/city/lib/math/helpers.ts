export function sign( value: number ): number {
  return value == 0 ? 0 : (value < 0 ? -1 : 1);
}