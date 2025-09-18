import React, { ReactNode } from "react";

interface TextErrorProps {
  children?: ReactNode;
}

const TextError: React.FC<TextErrorProps> = (props) => {
  console.log(props);

  return (
    <div style={{ fontSize: "9px", color: "#fd397a", marginLeft: "1px" }}>
      {props.children}
    </div>
  );
};

export default TextError;
