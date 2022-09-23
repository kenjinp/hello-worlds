import * as React from 'react';
import { Button } from '../button/Button';

export const Menu: React.FC<React.PropsWithChildren<{ icon: React.ReactElement, style: React.CSSProperties }>> = ({
  icon,
  style,
  children
}) => {
  const [show, setShown] = React.useState(false);

  return (
    <div style={{
      ...style,
      display: "flex",
      flexDirection: "column"
    }}>
      <Button onClick={() => {
          setShown(!show);
      }}>
        {icon}
      </Button>
      {show && <div
        style={{
          marginTop: "0.5em",
          padding: "1em",
          background: "#2f2f2f",
          borderRadius: "0.5em"
        }}
      >{children}</div>}
    </div>)
};
