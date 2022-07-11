import {
  faDiscord,
  faTwitch,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import * as React from "react";
import { FooterStyled } from "./Footer.style";

const Footer: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <FooterStyled>
      <div>{children}</div>
      <div>
        <div>
          <a href="https://discord.gg/7VqE93h58B" target="_blank">
            <FontAwesomeIcon icon={faDiscord} />
          </a>{" "}
          |{" "}
          <a href="https://twitter.com/KennyPirman" target="_blank">
            <FontAwesomeIcon icon={faTwitter} />
          </a>{" "}
          |{" "}
          <a href="https://www.twitch.tv/kennycreates" target="_blank">
            <FontAwesomeIcon icon={faTwitch} />
          </a>
        </div>
      </div>
    </FooterStyled>
  );
};

export default Footer;
