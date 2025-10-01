import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  Box,
  CircularProgress,
} from "@mui/material";
import { privatePost } from "../../services/privateRequest";
import { GET_ALL_LEADS } from "../../services/apiEndPoints";
import styles from "./Modal.module.css";

interface Customer {
  LeadId: number;
  LeadName: string;
  [key: string]: any;
}

interface SelectCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (customer: Customer) => void;
}

interface LeadsResponse {
  Status: number;
  Message: string;
  data: {
    Leads: Customer[];
    TotalRecords: number;
  };
}

const SelectCustomerModal: React.FC<SelectCustomerModalProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch customers when modal opens
  useEffect(() => {
    if (open) {
      fetchCustomers();
    }
  }, [open]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (open) {
        fetchCustomers(searchText);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchText, open]);

  const fetchCustomers = async (searchQuery = "") => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        From: 1,
        Text: searchQuery,
        To: 50, // Increased limit to show more customers
      };

      const response: LeadsResponse = await privatePost(GET_ALL_LEADS, payload);
      
      if (response.Status === 200 && response.data && response.data.Leads) {
        setCustomers(response.data.Leads);
      } else {
        setError("Failed to fetch customers");
        setCustomers([]);
      }
    } catch (err: any) {
      console.error("Error fetching customers:", err);
      setError("Failed to fetch customers");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleSave = () => {
    if (selectedCustomer) {
      onSelect(selectedCustomer);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedCustomer(null);
    setSearchText("");
    setCustomers([]);
    setError(null);
    onClose();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: "400px",
        },
      }}
    >
      <DialogTitle className={styles.dialogTitle}>
        Select Customer
      </DialogTitle>

      <DialogContent className={styles.dialogContent}>
        {/* Search Input */}
        <Box className={styles.inputContainer} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search"
            value={searchText}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
          />
        </Box>

        {/* Loading State */}
        {loading && (
          <Box display="flex" justifyContent="center" py={2}>
            <CircularProgress size={24} />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Box display="flex" justifyContent="center" py={2}>
            <span style={{ color: "red" }}>{error}</span>
          </Box>
        )}

        {/* Customer List */}
        {!loading && !error && (
          <Box
            sx={{
              maxHeight: "300px",
              overflowY: "auto",
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              p: 1,
            }}
          >
            <RadioGroup
              value={selectedCustomer?.LeadId || ""}
              onChange={(e) => {
                const customer = customers.find(
                  (c) => c.LeadId.toString() === e.target.value
                );
                if (customer) {
                  handleCustomerSelect(customer);
                }
              }}
            >
              {customers.map((customer) => (
                <FormControlLabel
                  key={customer.LeadId}
                  value={customer.LeadId.toString()}
                  control={<Radio />}
                  label={customer.LeadName || customer.Name || `Customer ${customer.LeadId}`}
                  sx={{
                    width: "100%",
                    margin: 0,
                    padding: "8px 0",
                    "& .MuiFormControlLabel-label": {
                      fontSize: "14px",
                    },
                  }}
                />
              ))}
            </RadioGroup>

            {customers.length === 0 && !loading && (
              <Box display="flex" justifyContent="center" py={2}>
                <span style={{ color: "#666" }}>
                  {searchText ? "No customers found" : "No customers available"}
                </span>
              </Box>
            )}
          </Box>
        )}
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
          disabled={!selectedCustomer}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectCustomerModal;
