import * as React from "react"

export const SafeHydrate: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [render, setRender] = React.useState(false)
  React.useEffect(() => {
    setRender(true)
  })
  return (
    <div
      suppressHydrationWarning
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      {render && children}
    </div>
  )
}
