import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as React from "react";
import { Group, MathUtils, Mesh, Vector2, Vector3 } from "three";
import { useControls } from "../../hooks/useControls";
const DEFAULT_IDEAL_OFFSET = new Vector3(0, 0.8, 0);
const DEFAULT_IDEAL_LOOKAT = new Vector3(0, 1 / 10, 50 / 10);
const DEFAULT_SENSITIVITY = new Vector2(1, 0.8);
const TRANSLATION_LERP = 0.3;

export const FollowCameraSystem: React.FC = () => {
  const maxPitchAngle = 89;
  const minPitchAngle = -89;
  const pitchObjectRef = React.useRef<Mesh>(null);
  const yawObjectRef = React.useRef<Mesh>(null);
  const cameraTranslationRigRef = React.useRef<Group>(null);
  const zoomRigRef = React.useRef<Group>(null);
  const controls = useControls();

  const tempVector3 = new Vector3();
  const tempVec2 = new Vector2();
  const tempVec2Also = new Vector2();

  const sensitivity = DEFAULT_SENSITIVITY;

  useFrame(() => {
    if (
      pitchObjectRef.current &&
      yawObjectRef.current &&
      cameraTranslationRigRef.current
    ) {
      const pitchObject = pitchObjectRef.current;
      const yawObject = yawObjectRef.current;
      const cameraTranslationRigObject = cameraTranslationRigRef.current;

      if (!controls.mouse.button("left").query()) {
        return;
      }

      const getLook = () => {
        const { x: mouseX, y: mouseY } = controls.mouse.pointer().query();
        return tempVec2.set(mouseX, mouseY);
      };

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

      // cameraTranslationRigObject.position.lerp(
      //   target.position,
      //   TRANSLATION_LERP
      // );
    }
  });

  return (
    <group ref={cameraTranslationRigRef}>
      <group ref={zoomRigRef}>
        <mesh ref={yawObjectRef}>
          <mesh ref={pitchObjectRef} position={new Vector3(1, 1.5, 4)}>
            <PerspectiveCamera
              name="FollowCamera"
              makeDefault
              far={100_000_000}
            />
          </mesh>
        </mesh>
      </group>
    </group>
  );
};
