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
  FormControl,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TodayIcon from "@mui/icons-material/Today";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { addTask } from "../../components/slices/taskSlice";
import dayjs, { Dayjs } from "dayjs";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import ModeStandbyIcon from "@mui/icons-material/ModeStandby";
import RoundIconButton from "./RoundIconButton";
import AssignMemberModal from "./AssignMemberModal";
import AddMembersModal from "./AddMembersModal";

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  currentUserId: number;
  onSuccess?: () => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  open,
  onClose,
  currentUserId,
  onSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.task);

  // ---------- State ----------
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [dateChoice, setDateChoice] = useState<"today" | "tomorrow" | "custom">(
    "today"
  );
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedTime, setSelectedTime] = useState<string>("5:30 PM");
  const [selectedDateTime, setSelectedDateTime] = useState<Dayjs>(dayjs());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [titleError, setTitleError] = useState<boolean>(false);

  const [attachments, setAttachments] = useState<File[]>([]);

  const [openMemberModal, setOpenMemberModal] = useState(false);
  const [member, setMember] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: string | number;
    label: string;
  } | null>(null);

  const [selectedMembers, setSelectedMembers] = useState<
    { UserId: number; Name: string }[]
  >([]);

  // ---------- Time Slots ----------
  const timeSlots: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    timeSlots.push(`${displayHour}:00 ${period}`);
    timeSlots.push(`${displayHour}:30 ${period}`);
  }

  // ---------- Helper Functions ----------
  const getEndDate = () => {
    if (dateChoice === "today") {
      return dayjs().endOf("day");
    } else if (dateChoice === "tomorrow") {
      return dayjs().add(1, "day").endOf("day");
    } else {
      const [time, period] = selectedTime.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return selectedDate.hour(hours).minute(minutes).second(0).add(1, "day");
    }
  };

  // ---------- Handlers ----------
  const handleSave = () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    setTitleError(false);

    const startDate = dayjs();
    const endDate = getEndDate();

    // Build payload matching the exact API schema from your example
    const userList = [
      { UserId: Number(currentUserId), Name: "" },
      ...selectedMembers.map((m) => ({ UserId: Number(m.UserId), Name: m.Name })),
    ];

    const serverPayload = {
      __server: true, // This tells the taskSlice to bypass formatting
      Title: title,
      Description: description,
      IntercomGroupIds: [],
      AssignedBy: Number(currentUserId),
      AssignedToUserId: 0,
      AssignedDate: dayjs().format("YYYY-MM-DD"),
      CompletedDate: "",
      CompletionPercentage: 0,
      IsActive: true,
      IsFavourite: false,
      Latitude: 0,
      Longitude: 0,
      LeadId: selectedCustomer ? Number(selectedCustomer.id) : null,
      Location: "NA",
      Priority: "Low",
      Target: 0,
      TaskOwners: userList.map((u) => ({ TaskId: 0, UserId: u.UserId, IntercomGroupId: 0 })),
      TaskStartDate: dayjs().format("YYYY-MM-DD HH:mm:ss A"),
      TaskEndDate: endDate.format("YYYY-MM-DD HH:mm:ss A"), // Add task end date
      TaskStatus: "",
      TaskType: "",
      UserIds: userList.map((u) => ({
        UserId: u.UserId,
        Target: 0,
        TargetAchieved: 0,
        IsActive: true,
      })),
    };

    console.log("AddTaskModal - Sending payload:", serverPayload);
    
    dispatch(addTask(serverPayload) as any).then((res: any) => {
      console.log("AddTaskModal - Response:", res);
      if (res.meta.requestStatus === "fulfilled") {
        handleClose();
        if (onSuccess) onSuccess();
      }
    }).catch((error: any) => {
      console.error("AddTaskModal - Error:", error);
    });
  };

  // Ref for file input
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return; // exit if no files selected
    setAttachments((prev) => [...prev, ...Array.from(files)]);
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setDateChoice("today");
    setSelectedDateTime(dayjs());
    setSelectedCustomer(null);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { 
            borderRadius: 3, 
            p: 1, 
            width: 500, 
            maxWidth: "90vw",
            overflow: "hidden"
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
            New Task
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ px: 3, py: 2, overflow: "hidden" }}>
          <TextField
            label="Title"
            fullWidth
            required
            variant="outlined"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError && e.target.value.trim()) {
                setTitleError(false);
              }
            }}
            onBlur={() => {
              if (!title.trim()) setTitleError(true);
            }}
            error={titleError}
            helperText={
              titleError ? "Title is required" : `${title.length}/200`
            }
            inputProps={{ maxLength: 200 }}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            minRows={3}
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            inputProps={{ maxLength: 500 }}
            helperText={`${description.length}/500`}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
            <Button
              variant={dateChoice === "today" ? "contained" : "outlined"}
              size="small"
              onClick={() => {
                setDateChoice("today");
                setSelectedDate(dayjs());
                setSelectedTime("5:30 PM");
              }}
              sx={{
                borderRadius: "20px",
                textTransform: "none",
                height: "40px",
              }}
            >
              Today
            </Button>
            <Button
              variant={dateChoice === "tomorrow" ? "contained" : "outlined"}
              size="small"
              onClick={() => {
                setDateChoice("tomorrow");
                setSelectedDate(dayjs().add(1, "day"));
                setSelectedTime("2:50 AM");
              }}
              sx={{
                borderRadius: "20px",
                textTransform: "none",
                height: "40px",
              }}
            >
              Tomorrow
            </Button>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <RoundIconButton
                icon={<TodayIcon />}
                title="Select Date And Time"
                onClick={() => setShowDatePicker(true)}
              />
              <RoundIconButton
                icon={<PersonAddIcon />}
                title="Select Customer"
                onClick={() => setOpenMemberModal(true)}
              />
              <RoundIconButton
                icon={<PeopleIcon />}
                title="Select Member"
                onClick={() => setMember(true)}
              />
              <RoundIconButton
                icon={<AttachFileIcon />}
                title="Attach File"
                onClick={() => fileInputRef.current?.click()}
              />
              <input
                type="file"
                multiple
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <RoundIconButton icon={<ModeStandbyIcon />} title="Target" />
            </Box>
          </Box>

          {/* File attachments display - moved outside the icon buttons row */}
          {attachments.length > 0 && (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                mb: 2,
                maxWidth: "100%",
                overflow: "hidden",
              }}
            >
              {attachments.map((file, index) => (
                <Chip
                  key={index}
                  label={file.name}
                  onDelete={() =>
                    setAttachments((prev) =>
                      prev.filter((_, i) => i !== index)
                    )
                  }
                  sx={{
                    maxWidth: "200px",
                    "& .MuiChip-label": {
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    },
                  }}
                />
              ))}
            </Box>
          )}

          {dateChoice && (
            <Typography variant="body2" color="text.secondary">
              Due: {getEndDate().format("ddd, MMM D")} at {getEndDate().format("h:mm A")}
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!title.trim() || loading}
            sx={{ textTransform: "none" }}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Date + Time Dropdown Modal */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Dialog
          open={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Select Date & Time</DialogTitle>
          <DialogContent>
            {/* Date Picker */}
            <MobileDatePicker
              value={selectedDate}
              onChange={(newValue) => {
                if (newValue) {
                  setSelectedDate(newValue);
                  setDateChoice("custom");
                }
              }}
              slotProps={{
                textField: { fullWidth: true, size: "small", sx: { mb: 2 } },
              }}
            />

            {/* Time Dropdown */}
            <FormControl fullWidth size="small">
              <Select
                value={selectedTime}
                onChange={(e) => {
                  setSelectedTime(e.target.value);
                  setDateChoice("custom");
                }}
              >
                {timeSlots.map((time, index) => (
                  <MenuItem key={index} value={time}>
                    {time}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDatePicker(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => setShowDatePicker(false)}
            >
              Select
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>

      <AssignMemberModal
        open={openMemberModal}
        onClose={() => setOpenMemberModal(false)}
        onSelect={(lead) => {
          setSelectedCustomer(lead);
          setOpenMemberModal(false);
        }}
      />

      <AddMembersModal
        open={member}
        onClose={() => setMember(false)}
        onSelect={({ users, cc }) => {
          const merged = [...users, ...cc];
          setSelectedMembers(merged);
          setMember(false);
        }}
      />
    </>
  );
};

export default AddTaskModal;
