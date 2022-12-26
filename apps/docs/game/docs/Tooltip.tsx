import { Entity } from "@game/Entity"
import { capitalize } from "@hello-worlds/core"
import * as React from "react"
import { Color } from "three"
import {
  doClosePreviewTooltip,
  doFocusObjectDescription,
  doPreviewTooltip,
} from "../Actions"
import docs from "./index"

const showTooltipTimeDuration = 500
const tooltipMargin = 20

export const Tooltip: React.FC<
  React.PropsWithChildren<{
    name: keyof typeof docs
    entity?: Entity
    tooltipShowDuration: number
  }>
> = ({
  children,
  name,
  entity,
  tooltipShowDuration = showTooltipTimeDuration,
}) => {
  const [showMouseTooltip, setShowMouseTooltip] = React.useState(false)
  const showTooltipTimeout = React.useRef<number>()

  const handleClick: React.MouseEventHandler<HTMLSpanElement> = e => {
    doFocusObjectDescription(
      name,
      { x: e.clientX + tooltipMargin, y: e.clientY + tooltipMargin },
      entity,
    )
  }

  const handleMouseEnter: React.MouseEventHandler<HTMLSpanElement> = e => {
    // TODO early out if tooltip already exists
    // Focus window if window exists
    // schedule tooltip timer
    showTooltipTimeout.current = setTimeout(() => {
      doPreviewTooltip(
        name,
        { x: e.clientX + tooltipMargin, y: e.clientY + tooltipMargin },
        entity,
      )
      setShowMouseTooltip(false)
    }, tooltipShowDuration)
    setShowMouseTooltip(true)
  }

  const handleMouseLeave: React.MouseEventHandler<HTMLSpanElement> = e => {
    // cancel scheduled hiding of tooltip
    if (showTooltipTimeout.current) {
      clearTimeout(showTooltipTimeout.current)
      showTooltipTimeout.current = null
    }
    setShowMouseTooltip(false)
    doClosePreviewTooltip(name, entity)
  }
  return (
    <>
      {/* {showMouseTooltip && <MouseTooltipIndicator />} */}
      <span
        style={{
          cursor: "pointer",
          color: (entity?.labelColor as Color)?.getStyle() || "inherit",
          textDecorationColor:
            (entity?.labelColor as Color)?.getStyle() || "inherit",
        }}
        className={`tooltip ${name}`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <b>{children || capitalize(entity?.name || name)}</b>
      </span>
    </>
  )
}

export const MouseTooltipIndicator: React.FC = () => {
  const mousePosition = React.useRef({ x: 0, y: 0 })
  const divRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const listener = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY }
      if (divRef.current) {
        divRef.current.style.left = `${e.clientX}px`
        divRef.current.style.top = `${e.clientY}px`
      }
    }
    window.addEventListener("mousemove", listener)
    return () => window.removeEventListener("mousemove", listener)
  }, [])

  return (
    <div
      ref={divRef}
      style={{
        position: "fixed",
        zIndex: 1000,
        height: "4em",
        background: "red",
      }}
    >
      tooltip incoming!
    </div>
  )
}
