import * as React from "react"

export const Badge: React.FCM<{ project: string }> = ({ project }) => {
  return (
    <span className="badge-npmversion">
      <a
        href={`https://npmjs.org/package/${project}`}
        title="View this project on NPM"
      >
        <img
          src={`https://img.shields.io/npm/v/${project}.svg`}
          crossOrigin="anonymous"
          alt="NPM version"
        />
      </a>
    </span>
  )
}
