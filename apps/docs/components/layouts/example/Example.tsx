import Link from "next/link"
import * as React from "react"
import { Button } from "../../button/Button"
import { Footer } from "../footer/Footer"
import { HeaderStyled } from "../header/Header.style"

export const ExampleLayout: React.FC<
  React.PropsWithChildren<{
    middle?: React.ReactNode
    left?: React.ReactNode
  }>
> = ({ children, middle, left }) => {
  React.useLayoutEffect(() => {
    const oldClass = document.body.className
    document.body.className = "example-no-nav"
    return () => {
      document.body.className = oldClass
    }
  }, [])

  return (
    <main>
      <HeaderStyled></HeaderStyled>
      {children}
      <Footer middle={middle}>
        <Link href="/intro">
          <Button>Documentation</Button>
        </Link>
        {left}
      </Footer>
    </main>
  )
}

export default ExampleLayout
