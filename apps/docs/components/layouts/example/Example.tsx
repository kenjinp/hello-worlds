import * as React from "react"
import Footer from "../footer/Footer"
import { HeaderStyled } from "../header/Header.style"

export const ExampleLayout: React.FC = ({ children }) => {
  return (
    <main>
      <HeaderStyled></HeaderStyled>
      <section>{children}</section>
      <Footer></Footer>
    </main>
  )
}

export default ExampleLayout
