import { Planetarium } from "@examples/planetarium/Planetarium"

export default function Index() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1,
        background: "black",
      }}
    >
      <Planetarium />
    </div>
  )
}
