import * as React from "react"

export enum CameraTypes {
  orbit = "orbit",
  fly = "fly",
  first = "first",
  third = "third",
}

const CameraButtons: React.FC = () => {
  const [camera, setCamera] = React.useState(CameraTypes.orbit)

  const handleCameraChange = (e: any) => {
    setCamera(e.target.value as CameraTypes)
  }

  return (
    <>
      <div onChange={handleCameraChange}>
        <label>
          <input
            type="radio"
            value="orbit"
            name="camera"
            checked={camera === CameraTypes.orbit}
          />{" "}
          orbit
        </label>
        {/* <label>
          <input
            type="radio"
            value="fly"
            name="camera"
            checked={camera === CameraTypes.fly}
          />{" "}
          fly
        </label> */}
        <label>
          <input
            type="radio"
            value="first"
            name="camera"
            checked={camera === CameraTypes.first}
          />{" "}
          first
        </label>
        <label>
          <input
            type="radio"
            value="third"
            name="camera"
            checked={camera === CameraTypes.third}
          />{" "}
          third
        </label>
      </div>
    </>
  )
}

export default CameraButtons
