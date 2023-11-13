export function generateHeightmapBitmap(
  heightData: number[],
  minValue: number,
  maxValue: number,
  bitPacked: boolean = false,
) {
  // const buffer = Buffer.alloc(width * height * 4)
  const buffer = []
  for (let i = 0; i < heightData.length; i++) {
    const normalizedValue = (heightData[i] - minValue) / (maxValue - minValue)
    if (bitPacked) {
      const intValue = Math.floor(normalizedValue * 4294967295)

      // Extract RGBA components from the 32-bit integer
      const red = (intValue >> 24) & 255
      const green = (intValue >> 16) & 255
      const blue = (intValue >> 8) & 255
      const alpha = intValue & 255

      // Each pixel has RGBA components, so we update four consecutive array elements
      // const pixelIndex = i * 4
      buffer.push(red, green, blue, alpha)
      // buffer.set([colorValue, colorValue, colorValue, 255], pixelIndex)
    } else {
      const colorValue = Math.floor(normalizedValue * 255)
      buffer.push(colorValue, colorValue, colorValue, 255)
    }
  }
  return buffer
}

// export class Heightmap

// export class Heightmap {
//   buffer: Buffer;
//   constructor(
//     public readonly size: number,
//     public readonly heightData: number[],
//     public readonly minValue?: number = 0,
//     public readonly maxValue?: number =,

//   ) {
//     const minValue = Math.min(...heightData);
//     const maxValue = Math.max(...heightData);
//     this.buffer = generateHeightMapBitmap(heightData, size, size, minValue, maxValue);
//   }
// }
