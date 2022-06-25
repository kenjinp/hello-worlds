import { useThree } from "@react-three/fiber";
import { Gamepad, Keyboard, Mouse, or } from "contro";
import * as React from "react";

export const useControls = () => {
  const {
    gl: { domElement: canvas },
  } = useThree();

  const [pointerLock, setPointerLock] = React.useState(false);
  const [mouse] = React.useState(new Mouse({ canvas }));
  const [keyboard] = React.useState(new Keyboard());
  const [gamepad] = React.useState(new Gamepad());

  const requestPointerLock = () => {
    if (/Firefox/i.test(navigator.userAgent)) {
      const onFullscreenChange = () => {
        if (document.fullscreenElement === document.body) {
          document.removeEventListener(
            "onFullscreenChange",
            onFullscreenChange
          );
          document.removeEventListener(
            "mozfullscreenchange",
            onFullscreenChange
          );
          mouse.lockPointer();
        }
      };
      document.addEventListener(
        "onFullscreenChange",
        onFullscreenChange,
        false
      );
      document.addEventListener(
        "mozfullscreenchange",
        onFullscreenChange,
        false
      );
      document.body.requestFullscreen();
    } else {
      mouse.lockPointer();
    }
  };

  React.useEffect(() => {
    if (pointerLock) {
      canvas.onclick = requestPointerLock;
    } else {
      canvas.onclick = null;
    }
    return () => {
      canvas.onclick = null;
    };
  }, [canvas, pointerLock]);

  return {
    up: or(gamepad.button("Up"), keyboard.key("W")),
    down: or(gamepad.button("Down"), keyboard.key("S")),
    left: or(gamepad.button("Left"), keyboard.key("A")),
    right: or(gamepad.button("Right"), keyboard.key("D")),
    run: or(gamepad.button("A"), keyboard.key("Shift")),
    jump: or(gamepad.button("B"), keyboard.key("Space")),
    use: or(gamepad.button("Y"), keyboard.key("F")),
    menu: or(gamepad.button("Start"), keyboard.key("Esc")),
    attack: or(gamepad.button("X"), keyboard.key("Q")),
    inventory: or(gamepad.button("Home"), keyboard.key("E")),
    crouch: or(gamepad.button("LB"), keyboard.key("Ctrl")),
    stickLeft: gamepad.stick("left"),
    stickRight: gamepad.stick("right"),
    mouse,
    setPointerLock: () => {
      setPointerLock(true);
    },
  };
};
