import { faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as React from "react"
import { PropsWithChildren, ReactNode } from "react"
import Draggable from "react-draggable"
import styled from "styled-components"

export const ContainerDiv = styled.div`
  border-radius: 0.5em;
  box-shadow: 0 16px 40px -5px rgb(0 0 0 / 50%);
  background: #2f2f2f;
  .dragger-bounds {
    background: #dd3cff29;
    border-top-left-radius: 0.5em;
    border-top-right-radius: 0.5em;
    height: 2em;
    cursor: grab;
    transition: all 0.3s ease;
    & svg {
      fill: white;
    }
    &:hover {
      background: #dd3cff9c;
      & svg {
        fill: white;
      }
    }
    .dragger {
      width: 100%;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 10px;
      left: 0px;
      z-index: 1;
    }
  }
  .content {
    padding: 1em 2em 1em;
    max-height: 80vh;
    overflow: auto;
    resize: both;
  }
`

export const Container: React.FC<
  PropsWithChildren<{
    onClose?: () => void
    style: any
    header: string | ReactNode
    center?: boolean
  }>
> = ({ style, children, header, onClose, center }) => {
  return (
    <Draggable
      handle=".dragger"
      bounds="#window-bounds"
      defaultPosition={
        center
          ? {
              x: 0,
              y: document.body.clientHeight / 2,
            }
          : { x: 0, y: 0 }
      }
    >
      <ContainerDiv
        style={{
          ...style,
        }}
      >
        <div className="dragger-bounds">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0.5em",
            }}
          >
            <div>{header}</div>
            <div className="dragger">
              <svg
                width="20"
                height="10"
                viewBox="0 0 28 14"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="2" cy="2" r="2"></circle>
                <circle cx="14" cy="2" r="2"></circle>
                <circle cx="26" cy="2" r="2"></circle>
                <circle cx="2" cy="12" r="2"></circle>
                <circle cx="14" cy="12" r="2"></circle>
                <circle cx="26" cy="12" r="2"></circle>
              </svg>
            </div>
            <div
              onClick={() => onClose && onClose()}
              style={{ cursor: "pointer", zIndex: 2 }}
            >
              <FontAwesomeIcon icon={faXmark} />
            </div>
          </div>
        </div>
        <div className="content">{children}</div>
      </ContainerDiv>
    </Draggable>
  )
}
