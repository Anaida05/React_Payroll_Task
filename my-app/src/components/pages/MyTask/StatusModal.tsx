import React from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface Task {
  TaskId: number;
  Title: string;
  CompletionPercentage?: number;
}

interface StatusModalProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  onStatusChange: (task: Task, value: number) => void;
}

const StatusModal: React.FC<StatusModalProps> = ({
  open,
  onClose,
  task,
  onStatusChange,
}) => {
  if (!task) return null;

  const percentages = Array.from({ length: 20 }, (_, i) => (i + 1) * 5);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 420,
          bgcolor: "background.paper",
          borderRadius: 2,
          p: 3,
        }}
      >
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Current status
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Status Grid */}
        <Grid container spacing={1.2}>
          {percentages.map((value) => (
            <Grid item xs={3} key={value}>
              <Button
                fullWidth
                variant={
                  task.CompletionPercentage === value ? "contained" : "outlined"
                }
                onClick={() => onStatusChange(task, value)}
                sx={{
                  textTransform: "none",
                  borderRadius: "8px",
                  borderColor: "#d8dce6",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  color:
                    task.CompletionPercentage === value ? "#fff" : "#000",
                  "&:hover": {
                    backgroundColor:
                      task.CompletionPercentage === value
                        ? "#1976d2"
                        : "#f5f5f5",
                  },
                }}
              >
                {value}%
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Modal>
  );
};

export default StatusModal;
