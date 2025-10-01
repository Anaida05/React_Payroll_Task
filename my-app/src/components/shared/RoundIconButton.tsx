import React from "react";
import { IconButton, Tooltip } from "@mui/material";

interface RoundIconButtonProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
}

const RoundIconButton: React.FC<RoundIconButtonProps> = ({
  icon,
  title,
  onClick,
  disabled = false,
}) => {
  return (
    <Tooltip title={title}>
      <IconButton
        onClick={onClick}
        disabled={disabled}
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          backgroundColor: "#f5f5f5",
          border: "1px solid #e0e0e0",
          "&:hover": {
            backgroundColor: "#e0e0e0",
          },
          "&:disabled": {
            backgroundColor: "#f9f9f9",
            color: "#ccc",
          },
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );
};

export default RoundIconButton;
