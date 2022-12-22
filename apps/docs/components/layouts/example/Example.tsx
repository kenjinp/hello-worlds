import Link from "next/link"
import * as React from "react"
import { Button } from "../../button/Button"
import { Footer } from "../footer/Footer"
import { HeaderStyled } from "../header/Header.style"

export const ExampleLayout: React.FC = ({ children }) => {
  return (
    <main>
      <HeaderStyled></HeaderStyled>
      <section>{children}</section>
      <Footer middle={<h1>Hello</h1>}>
        <Link href="/intro">
          <Button>Documentation</Button>
        </Link>
      </Footer>
    </main>
  )
}

export default ExampleLayout
