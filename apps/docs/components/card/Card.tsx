import React from "react"

export const Card: React.FC = () => {
  return <div>Card</div>
}

export const Cards: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return <div>{children}</div>
}
