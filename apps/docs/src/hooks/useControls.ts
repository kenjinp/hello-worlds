import { useThree } from '@react-three/fiber';
import * as React from 'react';
import { Vector2 } from 'three';

export function useControls () {
  const [mouseXY] = React.useState(new Vector2(0,0));
  const { gl: { domElement: canvas } } = useThree();
  React.useEffect(() => {
    const mouseEvent = (e: MouseEvent) => {
      mouseXY.set(e.movementX, e.movementY);
    }

    const requestPointerLock = () => {
      canvas.requestPointerLock();
    }
    
    canvas.addEventListener('click', requestPointerLock);
    document.addEventListener('mousemove', mouseEvent);

    return () => {
      document.removeEventListener('mousemove', mouseEvent);
      canvas.removeEventListener('click', requestPointerLock)
    }
  },[])


  return {
    mouse: {
      query: () => {

        console.log(mouseXY)
        return mouseXY
      },
      isPointerLocked: () => {
        return document.pointerLockElement === canvas
      }
    }
  }
}