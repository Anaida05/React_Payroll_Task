import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';

interface TaskPercentageModalProps {
  open: boolean;
  handleClose: () => void;
  handleSubmit: (percentage: number) => void;
}

const TaskPercentageModal: React.FC<TaskPercentageModalProps> = ({ open, handleClose, handleSubmit }) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Partial Complete"}
      </DialogTitle>
      <DialogContent>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="contained" onClick={() => handleSubmit(50)}>
            50%
          </Button>
          <Button variant="contained" onClick={() => handleSubmit(75)}>
            75%
          </Button>
          <Button variant="contained" onClick={() => handleSubmit(100)}>
            100%
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={() => handleSubmit(100)} autoFocus>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TaskPercentageModal;
