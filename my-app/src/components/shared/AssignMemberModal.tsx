import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Button,
  CircularProgress,
  Typography,
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { getAllLeads } from "../../components/slices/memberSlice";

interface Lead {
  id: number;
  name: string;
  email: string;
}

interface AssignMemberModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (lead: { id: string | number; label: string }) => void;
}

const AssignMemberModal: React.FC<AssignMemberModalProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { leads, isLoading } = useSelector((state: RootState) => state.member);
  const [query, setQuery] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | number | null>(
    null
  );

  // 🔍 Fetch leads on query change
  useEffect(() => {
    if (!open) return;
    const payload = { From: 1, To: 10, Text: query.trim() };
    const delay = setTimeout(() => {
      dispatch(getAllLeads(payload));
    }, 400);

    return () => clearTimeout(delay);
  }, [query, open, dispatch]);

  const handleConfirm = () => {
    const selectedLead = leads.find((lead) => lead.id === selectedLeadId);
    if (selectedLead) {
      onSelect(selectedLead);
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: 3, width: 500, maxWidth: "90vw" },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "1.2rem",
          color: "#48465b",
        }}
      >
        Select Customer
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        {/* Search Bar */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <TextField
            placeholder="Search"
            fullWidth
            variant="standard"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Box>

        {/* Results */}
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : leads.length > 0 ? (
          <RadioGroup
            value={selectedLeadId}
            onChange={(e) => setSelectedLeadId(e.target.value)}
          >
            {leads.map((lead) => (
              <FormControlLabel
                key={lead.id}
                value={lead.id}
                control={<Radio />}
                label={lead.label}
              />
            ))}
          </RadioGroup>
        ) : query.trim() ? (
          <Typography variant="body2" color="text.secondary">
            No results found.
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Start typing to search leads...
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedLeadId}
          sx={{ textTransform: "none" }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignMemberModal;
