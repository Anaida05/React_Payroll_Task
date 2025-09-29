import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Chip,
  Box,
} from "@mui/material";
import {
  CalendarToday,
  PersonAdd,
  People,
  AttachFile,
  LocationOn,
} from "@mui/icons-material";
import styles from "./NewTaskModal.module.css";

interface NewTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (taskData: TaskData) => void;
}

interface TaskData {
  title: string;
  description: string;
  dueDate: string;
  assignedUsers: string[];
  attachments: File[];
  location?: string;
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({ open, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("today");
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleSave = () => {
    const taskData: TaskData = {
      title,
      description,
      dueDate,
      assignedUsers,
      attachments,
    };
    onSave(taskData);
    handleClose();
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setDueDate("today");
    setAssignedUsers([]);
    setAttachments([]);
    onClose();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setAttachments(Array.from(files));
    }
  };

  const isSaveDisabled = !title.trim();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: "500px",
        },
      }}
    >
      <DialogTitle className={styles.dialogTitle}>
        New Task
      </DialogTitle>
      
      <DialogContent className={styles.dialogContent}>
        {/* Title Input */}
        <Box className={styles.inputContainer}>
          <TextField
            fullWidth
            placeholder="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            variant="outlined"
            className={styles.titleInput}
            inputProps={{ maxLength: 200 }}
          />
          <div className={styles.characterCount}>
            {title.length}/200
          </div>
        </Box>

        {/* Description Input */}
        <Box className={styles.inputContainer}>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            variant="outlined"
            className={styles.descriptionInput}
            inputProps={{ maxLength: 500 }}
          />
          <div className={styles.characterCount}>
            {description.length}/500
          </div>
        </Box>

        {/* Task Options */}
        <Box className={styles.taskOptions}>
          {/* Due Date Options */}
          <Box className={styles.dueDateOptions}>
            <Chip
              label="Today"
              onClick={() => setDueDate("today")}
              className={`${styles.dateChip} ${dueDate === "today" ? styles.activeChip : ""}`}
            />
            <Chip
              label="Tomorrow"
              onClick={() => setDueDate("tomorrow")}
              className={`${styles.dateChip} ${dueDate === "tomorrow" ? styles.activeChip : ""}`}
            />
            <IconButton className={styles.iconButton}>
              <CalendarToday />
            </IconButton>
          </Box>

          {/* Action Buttons */}
          <Box className={styles.actionButtons}>
            <IconButton className={styles.iconButton}>
              <PersonAdd />
            </IconButton>
            <IconButton className={styles.iconButton}>
              <People />
            </IconButton>
            <IconButton className={styles.iconButton} component="label">
              <AttachFile />
              <input
                type="file"
                hidden
                multiple
                onChange={handleFileUpload}
              />
            </IconButton>
            <IconButton className={styles.iconButton}>
              <LocationOn />
            </IconButton>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <Button
          onClick={handleClose}
          className={styles.cancelButton}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className={styles.saveButton}
          variant="contained"
          disabled={isSaveDisabled}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewTaskModal;
