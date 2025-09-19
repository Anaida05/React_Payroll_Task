import * as React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Box, Typography } from "@mui/material";

interface TaskCoverageModalProps {
  open: boolean;
  handleClose: () => void;
}

const TaskCoverageModal: React.FC<TaskCoverageModalProps> = ({ open, handleClose }) => {
  const taskCoverageData = [
    { label: "Accepted", value: "0%" },
    { label: "Completed", value: "100%" },
    { label: "Not Accepted", value: "-1%" },
    { label: "Partially Completed", value: "50%" },
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{"Task Coverage"}</DialogTitle>
      <DialogContent>
        {taskCoverageData.map((item, index) => (
          <Box key={index} display="flex" justifyContent="space-between" mb={1}>
            <Typography>{item.label}</Typography>
            <Typography>{item.value}</Typography>
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}

export default TaskCoverageModal;
