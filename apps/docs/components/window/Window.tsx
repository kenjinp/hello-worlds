import {
  faWindowMaximize,
  faWindowMinimize,
  faXmark,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as React from "react"
import { PropsWithChildren, ReactNode } from "react"
import Draggable, { DraggableEventHandler } from "react-draggable"
import styled from "styled-components"

export const ContainerDiv = styled.div<{ headerColor?: string }>`
  border-radius: 0.5em;
  box-shadow: 0 16px 40px -5px rgb(0 0 0 / 50%);
  // background: #2f2f2f;
  background: #2f2f2f45;
  // backdrop-filter: blur(4px);
  background-image: radial-gradient(rgba(0, 0, 0, 0) 1px, #2f2f2f45 1px);
  background-size: 4px 4px;
  backdrop-filter: brightness(100%) blur(4px);
  overflow: hidden;
  resize: both;
  position: absolute;
  .header-handle {
    border-top-left-radius: 0.5em;
    border-top-right-radius: 0.5em;
    min-height: 2em;
    cursor: grab;
    transition: all 0.3s ease;
    color: #ffffff42;
    position: relative;
    & svg {
      fill: white;
    }
    &:hover {
      color: #ffffff;
      & svg {
        fill: white;
      }
      & .dragger {
        filter: opacity(0.5);
      }
    }
    .dragger {
      transition: filter 0.3s ease;
      background: ${({ headerColor = "#dd3cff" }) => headerColor};
      filter: opacity(0);
      width: 100%;
      height: 100%;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 0px;
      left: 0px;
      z-index: 0;
    }
    .header {
      cursor: auto;
      z-index: 1;
    }
    .actions {
      width: 4em;
      display: flex;
      justify-content: space-between;
    }
  }
  .content {
    padding: 1em 2em 1em;
    overflow: auto;
    height: 100%;
  }
`

export type ContainerProps = PropsWithChildren<{
  id: string
  onClose?: () => void
  onMinimize?: () => void
  style?: React.CSSProperties
  header: string | ReactNode
  headerColor?: string
  center?: boolean
  defaultPosition?: { x: number; y: number }
  onClick: VoidFunction
}>

const ContainerInner = (
  {
    id,
    style,
    children,
    header,
    headerColor,
    onClose,
    onClick,
    onMinimize,
    center,
    defaultPosition,
  }: ContainerProps,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) => {
  const [maximized, setMaximized] = React.useState(false)
  const posRef = React.useRef<{ x: number; y: number }>(null)
  const dragRef = React.useRef<Draggable>(null)

  React.useEffect(() => {
    const draggable = dragRef.current
    if (!maximized && draggable && posRef.current) {
      draggable.setState({
        x: posRef.current.x,
        y: posRef.current.y,
      })
    }
  }, [maximized])

  const maximizedStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
  }

  const handleDrag: DraggableEventHandler = (e, data) => {
    posRef.current = data
  }

  return (
    <Draggable
      ref={dragRef}
      handle=".dragger"
      bounds="#window-bounds"
      onDrag={handleDrag}
      position={maximized ? { x: 0, y: 0 } : undefined}
      defaultPosition={
        center
          ? {
              x: document.body.clientWidth / 2 - 500 / 2,
              y: document.body.clientHeight / 2 - 500 / 2,
            }
          : defaultPosition || { x: 0, y: 0 }
      }
    >
      <ContainerDiv
        ref={forwardedRef}
        id={id}
        onMouseDown={onClick}
        headerColor={headerColor}
        style={{
          width: "500px",
          height: "500px",
          minWidth: "20em",
          minHeight: "10em",
          ...style,
          ...(maximized ? maximizedStyle : {}),
          pointerEvents: "all",
        }}
      >
        <div className="header-handle">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0.25em 0.5em",
            }}
          >
            <div className="header">{header}</div>
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
            <div className="actions">
              {onMinimize ? (
                <div
                  onClick={() => onMinimize()}
                  style={{ cursor: "pointer", zIndex: 2 }}
                >
                  <FontAwesomeIcon icon={faWindowMinimize} />
                </div>
              ) : null}
              <div
                onClick={() => setMaximized(!maximized)}
                style={{ cursor: "pointer", zIndex: 2 }}
              >
                <FontAwesomeIcon icon={faWindowMaximize} />
              </div>
              {onClose ? (
                <div
                  onClick={() => onClose && onClose()}
                  style={{ cursor: "pointer", zIndex: 2 }}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="content">{children}</div>
      </ContainerDiv>
    </Draggable>
  )
}

export const Container = React.forwardRef(ContainerInner) as (
  props: React.PropsWithChildren<ContainerProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>
  },
) => ReturnType<typeof ContainerInner>
