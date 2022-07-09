import * as React from "react";
import Kingdom from "../../lib/demographics/Demographics";

const Demographics: React.FC = () => {
  React.useEffect(() => {
    const kingdom = new Kingdom();
    console.log({ kingdom });
  }, []);
  return null;
};

export default Demographics;
