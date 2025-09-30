import React from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Grid,
} from "@mui/material";

interface PercentageModalProps {
  open: boolean;
  onClose: () => void;
  onPercentageSelect: (percentage: number) => void;
  currentPercentage?: number;
  taskTitle?: string;
}

const PercentageModal: React.FC<PercentageModalProps> = ({
  open,
  onClose,
  onPercentageSelect,
  currentPercentage = 0,
  taskTitle = "Task",
}) => {
  const percentages = [
    5, 10, 15, 20, 25,
    30, 35, 40, 45, 50,
    55, 60, 65, 70, 75,
    80, 85, 90, 95, 100,
  ];

  const handlePercentageClick = (percentage: number) => {
    onPercentageSelect(percentage);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 320,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          p: 2,
          outline: "none",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
            borderBottom: "1px solid #eee",
            pb: 0.5,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              color: "#48465b",
            }}
          >
            Current status
          </Typography>
          <Button
            onClick={onClose}
            sx={{
              minWidth: "auto",
              p: 0.5,
              color: "#666",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            ✕
          </Button>
        </Box>

        

      

        {/* Percentage Grid */}
        <Grid container spacing={0.5} sx={{ mb: 1.5 }}>
          {percentages.map((percentage) => (
            <Grid item xs={2.4} key={percentage}>
              <Button
                variant="outlined"
                onClick={() => handlePercentageClick(percentage)}
                sx={{
                  width: "100%",
                  height: 32,
                  borderRadius: 1,
                  borderColor: percentage === currentPercentage ? "#1976d2" : "#e0e0e0",
                  backgroundColor: percentage === currentPercentage ? "#e3f2fd" : "transparent",
                  color: percentage === currentPercentage ? "#1976d2" : "#333",
                  fontWeight: percentage === currentPercentage ? 600 : 400,
                  fontSize: "12px",
                  "&:hover": {
                    borderColor: "#1976d2",
                    backgroundColor: "#e3f2fd",
                    color: "#1976d2",
                  },
                }}
              >
                {percentage}%
              </Button>
            </Grid>
          ))}
        </Grid>

        {/* Footer */}
        <Box display="flex" justifyContent="flex-end">
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default PercentageModal;
