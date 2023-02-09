import Link from "next/link"
import React from "react"
import styled from "styled-components"

const CardFrame = styled.div`
  height: 200px;
  width: 400px;
  background-color: #f4f4f4;
  border-radius: 1em;
  margin-right: 1em;
  margin-bottom: 1em;
  padding: 1em;

  background-image: linear-gradient(
    to right,
    #b8cbb8 0%,
    #b8cbb8 0%,
    #b465da 0%,
    #cf6cc9 33%,
    #ee609c 66%,
    #ee609c 100%
  );

  // background-image: radial-gradient(rgba(0, 0, 0, 0) 1px, #2f2f2f45 1px);
  // background-size: 4px 4px;
  // backdrop-filter: brightness(100%) blur(4px) opacity(0.5);

  .title {
    color: #2f2f2f;
    font-weight: bold;
  }
`

const CardsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`

export const Card: React.FC<
  React.PropsWithChildren<{ title: string; href: string }>
> = ({ title, href }) => {
  return (
    <Link href={href}>
      <CardFrame>
        <div className="title">
          <h3>{title}</h3>
        </div>
      </CardFrame>
    </Link>
  )
}

export const Cards: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return <CardsWrapper>{children}</CardsWrapper>
}
