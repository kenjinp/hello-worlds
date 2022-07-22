import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as React from "react";
import { MathUtils, Mesh, Vector2, Vector3 } from "three";
import { useControls } from "../../hooks/useControls";

const DEFAULT_SENSITIVITY = new Vector2(1, 0.8);
const DEFAULT_OFFSET = new Vector3(0, 1, 0);

export const FirstPersonCameraSystem: React.FC<{
  offset?: Vector3;
  sensitivity?: Vector2;
}> = ({ offset = DEFAULT_OFFSET, sensitivity = DEFAULT_SENSITIVITY }) => {
  const maxPitchAngle = 89;
  const minPitchAngle = -89;
  const pitchObjectRef = React.useRef<Mesh>(null);
  const yawObjectRef = React.useRef<Mesh>(null);
  const controls = useControls();

  useFrame(() => {
    yawObjectRef.current?.position.copy(offset);
    if (pitchObjectRef.current && yawObjectRef.current) {
      const pitchObject = pitchObjectRef.current;
      const yawObject = yawObjectRef.current;
      // const targetPos = () => {
      //   return new Vector3(position.x, position.y, position.z);
      // };
      // const target = targetPos();

      const update = () => {
        // yawObject.position.x = MathUtils.lerp(
        //   yawObject.position.x,
        //   target.x,
        //   0.1
        // );
        // yawObject.position.y = MathUtils.lerp(
        //   yawObject.position.y,
        //   target.y,
        //   0.1
        // );
        // yawObject.position.z = MathUtils.lerp(
        //   yawObject.position.z,
        //   target.z,
        //   0.1
        // );

        const getLook = () => {
          const { x: mouseX, y: mouseY } = controls.mouse.pointer().query();
          return new Vector2(mouseX, mouseY);
        };

        if (controls.mouse.isPointerLocked()) {
          const { x, y } = getLook();

          // Pitch
          const maxAngleRads = MathUtils.degToRad(maxPitchAngle);
          const minAngleRads = MathUtils.degToRad(minPitchAngle);
          pitchObject.rotation.x -= y / (1000 / sensitivity.y);

          if (pitchObject.rotation.x > maxAngleRads) {
            pitchObject.rotation.x = maxAngleRads;
          } else if (pitchObject.rotation.x < minAngleRads) {
            pitchObject.rotation.x = minAngleRads;
          }

          // Yaw
          yawObject.rotation.y -= x / (1000 / sensitivity.x);
        }
      };
      update();
    }
  });

  return (
    <>
      <mesh ref={yawObjectRef}>
        <mesh ref={pitchObjectRef}>
          <PerspectiveCamera
            name="FirstPersonCamera"
            makeDefault
            far={100_000_000}
          />
        </mesh>
      </mesh>
    </>
  );
};
