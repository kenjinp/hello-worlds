import * as esbuild from "esbuild"

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/esm/index.js",
  packages: "external",
  platform: "node",
  sourcemap: true,
  target: "esnext",
  format: "esm",
  loader: { ".glsl": "text" },
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
  loader: { ".glsl": "text" },
})
