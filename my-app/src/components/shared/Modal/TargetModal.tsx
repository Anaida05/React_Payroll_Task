import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface TargetModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (targets: { generalTarget: string; userTargets: { [userId: number]: number } }) => void;
  selectedUsers: { UserId: number; Name: string }[];
  currentUserId: number;
  currentUserName?: string;
}

const TargetModal: React.FC<TargetModalProps> = ({
  open,
  onClose,
  onSave,
  selectedUsers,
  currentUserId,
  currentUserName = "Rijo Admin New",
}) => {
  const [generalTarget, setGeneralTarget] = useState<string>("");
  const [userTargets, setUserTargets] = useState<{ [userId: number]: number }>({});

  // Get the users to display - if no users selected, show current user
  const usersToShow = selectedUsers.length > 0 ? selectedUsers : [{ UserId: currentUserId, Name: currentUserName }];

  const handleGeneralTargetChange = (value: string) => {
    setGeneralTarget(value);
    const numValue = parseInt(value) || 0;
    
    // Auto-populate all user targets with the general target value
    const newUserTargets: { [userId: number]: number } = {};
    usersToShow.forEach(user => {
      newUserTargets[user.UserId] = numValue;
    });
    setUserTargets(newUserTargets);
  };

  const handleUserTargetChange = (userId: number, value: string) => {
    const numValue = parseInt(value) || 0;
    setUserTargets(prev => ({
      ...prev,
      [userId]: numValue
    }));
  };

  const handleSave = () => {
    onSave({
      generalTarget,
      userTargets
    });
    handleClose();
  };

  const handleClose = () => {
    setGeneralTarget("");
    setUserTargets({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { 
          borderRadius: 3, 
          p: 1, 
          width: 400, 
          maxWidth: "90vw",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" fontWeight={500}>
          Enter Target
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ px: 3, py: 2 }}>
        {/* General target for all users */}
        <TextField
          label="Enter target for all users"
          fullWidth
          variant="outlined"
          type="number"
          value={generalTarget}
          onChange={(e) => handleGeneralTargetChange(e.target.value)}
          inputProps={{ min: 0 }}
          sx={{ mb: 3 }}
        />

        {/* Individual user targets */}
        {usersToShow.map((user) => (
          <Box key={user.UserId} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography variant="body1" sx={{ minWidth: "120px", mr: 2 }}>
              {user.Name}
            </Typography>
            <TextField
              type="number"
              value={userTargets[user.UserId] || 0}
              onChange={(e) => handleUserTargetChange(user.UserId, e.target.value)}
              inputProps={{ min: 0 }}
              sx={{ width: "100px" }}
            />
          </Box>
        ))}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{ textTransform: "none" }}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TargetModal;
