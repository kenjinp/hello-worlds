import * as esbuild from "esbuild"
import { glsl } from "esbuild-plugin-glsl"
await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/esm/index.js",
  packages: "external",
  platform: "node",
  sourcemap: true,
  target: "esnext",
  format: "esm",
  plugins: [
    glsl({
      minify: true,
      resolveIncludes: true,
    }),
  ],
})

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/cjs/index.js",
  packages: "external",
  platform: "node",
  sourcemap: true,
  target: "esnext",
  format: "cjs",
  plugins: [
    glsl({
      minify: true,
      resolveIncludes: true,
    }),
  ],
})
