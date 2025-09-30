import React from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";

interface ProgressReportModalProps {
  open: boolean;
  onClose: () => void;
  userName: string;
  employeeNo: string;
  progress: number; // percentage
}

const ProgressReportModal: React.FC<ProgressReportModalProps> = ({
  open,
  onClose,
  userName,
  employeeNo,
  progress,
}) => {
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
          boxShadow: 24,
          p: 3,
        }}
      >
        {/* Header */}
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 500,
            borderBottom: "1px solid #eee",
            pb: 1,
            color: "#48465b",
          }}
        >
          Progress Report
        </Typography>

        {/* User Details */}
        <Box
          sx={{
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            p: 2,
            mb: 3,
          }}
        >
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Box>
              <Typography
                variant="body2"
                color="textSecondary"
                fontWeight={500}
              >
                User Name
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {userName}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="body2"
                color="textSecondary"
                fontWeight={500}
              >
                Employee No
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {employeeNo}
              </Typography>
            </Box>
          </Box>

          <Box mt={2}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Progress
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  position: "relative",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress
                  variant="determinate"
                  value={progress}
                  size={50}
                  thickness={5}
                  sx={{ color: progress === 100 ? "green" : "success.main" }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    component="div"
                    sx={{ fontWeight: "bold" }}
                  >
                    {`${progress}%`}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

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

export default ProgressReportModal;
