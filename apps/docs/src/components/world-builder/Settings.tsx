import { faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from 'react';
import { Button } from '../button/Button';

export const Menu: React.FC<React.PropsWithChildren> = ({
  children
}) => {
  const [show, setShown] = React.useState(false);

  return (
    <div style={{
      alignItems: "flex-end",
      display: "flex",
      flexDirection: "column"
    }}>
      <Button onClick={() => {
          setShown(!show);
      }}>
        <FontAwesomeIcon icon={faGear}/>
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