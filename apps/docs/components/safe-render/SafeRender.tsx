import * as React from "react"

export const SafeHydrate: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [render, setRender] = React.useState(false)
  React.useEffect(() => {
    setRender(true)
  })
  return <div suppressHydrationWarning>{render && children}</div>
}
