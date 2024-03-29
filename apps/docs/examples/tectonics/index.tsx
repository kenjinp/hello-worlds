import ExampleWrapper from "@examples/ExampleWrapper"
import Example from "./Tectonics"

export default function ({ style = {} }) {
  return (
    <ExampleWrapper
      link="https://github.com/kenjinp/hello-worlds/tree/main/apps/docs/src/experiments/tectnonics"
      controls={null}
      style={style}
    >
      <Example />
    </ExampleWrapper>
  )
}
