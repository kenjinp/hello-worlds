import { PropsWithChildren } from "react";
import Draggable from "react-draggable";
import styled from "styled-components";
export const ContainerDiv = styled.div`
  border-radius: 1em;
  box-shadow: 0 16px 40px -5px rgb(0 0 0 / 50%);
  background: #2f2f2f;
  .dragger {
    background: #dd3cff29;
    border-top-left-radius: 1em;
    border-top-right-radius: 1em;
    height: 2em;
    cursor: grab;
    transition: all 0.3s ease;
    &:hover {
      background: #dd3cff9c;
    }
  }
  .content {
    padding: 1em 2em 1em;
    max-height: 80vh;
    overflow: auto;
    resize: both;
  }
`;

export const Container: React.FC<PropsWithChildren<{ style: any }>> = ({
  style,
  children,
}) => {
  return (
    <Draggable handle=".dragger" bounds="body">
      <ContainerDiv style={style}>
        <div className="dragger"></div>
        <div className="content">{children}</div>
      </ContainerDiv>
    </Draggable>
  );
};
