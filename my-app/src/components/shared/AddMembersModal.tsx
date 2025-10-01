import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  IconButton,
  Tabs,
  Tab,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store"; 
import { getCCMembers } from "../../components/slices/memberSlice";

interface Member {
  UserId: number;
  Name: string;
}

interface AddMembersModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (members: { users: Member[]; cc: Member[] }) => void;
}

const AddMembersModal: React.FC<AddMembersModalProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { members, isLoading } = useSelector(
    (state: RootState) => state.member
  );

  const [activeTab, setActiveTab] = useState<"users" | "cc">("users");

  // separate local states
  const [usersList, setUsersList] = useState<Member[]>([]);
  const [ccList, setCcList] = useState<Member[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedCc, setSelectedCc] = useState<number[]>([]);
   const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectedCcIds, setSelectedCcIds] = useState<number[]>([]);

   useEffect(() => {
    if (open) {
      // fetch based on activeTab
      dispatch(getCCMembers({ from: 1, text: "" }));
    }
  }, [open, activeTab, dispatch]);

  const toggleSelect = (id: number) => {
    if (activeTab === "users") {
      setSelectedUserIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      setSelectedCcIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    }
  };

  const handleDone = () => {
  const selectedUsers = members
    .filter((m) => selectedUserIds.includes(Number(m.Id || m.UserId)))
    .map((m) => ({
      UserId: Number(m.Id || m.UserId),
      Name: m.Name,
    }));

  const selectedCC = members
    .filter((m) => selectedCcIds.includes(Number(m.Id || m.UserId)))
    .map((m) => ({
      UserId: Number(m.Id || m.UserId),
      Name: m.Name,
    }));

  onSelect({
    users: selectedUsers,
    cc: selectedCC,
  });

  onClose();
};


  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDialog-container": {
          "& .MuiPaper-root": {
            width: "100%",
            maxWidth: "420px",
          },
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        Assign {activeTab === "users" ? "Users" : "CC"}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Tabs with counts */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        <Tab
          value="users"
          label={`Users (${selectedUserIds.length})`}
        />
        <Tab
          value="cc"
          label={`CC (${selectedCcIds.length})`}
        />
      </Tabs>

      <DialogContent dividers>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <List>
            {members.map((member) => {
              const id = Number(member.Id || member.UserId);
              const isSelected =
                activeTab === "users"
                  ? selectedUserIds.includes(id)
                  : selectedCcIds.includes(id);

              return (
                <ListItem key={id} button onClick={() => toggleSelect(id)}>
                  <ListItemIcon>
                    <Checkbox checked={isSelected} />
                  </ListItemIcon>
                  <ListItemText primary={member.Name} />
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleDone}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMembersModal;
