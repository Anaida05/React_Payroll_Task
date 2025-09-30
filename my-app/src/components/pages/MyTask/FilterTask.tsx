import React from "react";
import Modal from "../../shared/Modal/Modal";
import { Button } from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormikControl from "../../shared/Formik/FormikControl";
import dayjs from "dayjs";
import { privatePost } from "../../services/privateRequest";
import { ADDTASK } from "../../services/apiEndPoints";
import toast from "react-hot-toast";
import { priorities, status } from "../../../utils/utils";
import styles from "./FilterTask.module.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyTask, setFilterApplied } from "../../slices/myTaskSlice";

// Type definitions for Props and state
interface Member {
  UserId: number;
  Name: string;
}

interface FilterTaskProps {
  closeModal: () => void;
  teamMembers: Member[];
  onFiltersApplied?: (filters: any) => void;
}

interface FormValues {
  TaskType: string | null;
  DateType: string | null;
  FromCreatedDate: string | null;
  ToCreatedDate: string | null;
  DueDate: string | null;
}

const FilterTask: React.FC<FilterTaskProps> = ({ closeModal, teamMembers, onFiltersApplied }) => {
  const dispatch = useDispatch();

  // Form initial values
  const initialValues: FormValues = {
    TaskType: "",
    DateType: "",
    FromCreatedDate: null,
    ToCreatedDate: null,
    DueDate: null,
  };

  // Getting the state from the Redux store
  const { task, totalCount, loading, lastParams, filterApplied } = useSelector(
    (state: any) => state.myTask
  );

  const handleCloseFun = () => {
    closeModal();
  };

  // Handle form submission
  const handleSubmit = async (values: FormValues) => {
    const formattedFromDate = values.FromCreatedDate ? dayjs(values.FromCreatedDate).format("MM/DD/YYYY") : "";
    const formattedToDate = values.ToCreatedDate ? dayjs(values.ToCreatedDate).format("MM/DD/YYYY") : "";

    const newParams = {
      TaskType: values.TaskType || "",
      DateType: values.DateType || "",
      FromCreatedDate: formattedFromDate,
      ToCreatedDate: formattedToDate,
      DueDate: values.DueDate || "",
    };

    const updatedParams = {
      ...lastParams,
      ...newParams,
    };

    // Dispatch actions to fetch tasks with updated filters
    dispatch(fetchMyTask(updatedParams) as any);
    dispatch(setFilterApplied(true));
    
    // Pass applied filters to parent component
    if (onFiltersApplied) {
      onFiltersApplied(newParams);
    }
    
    closeModal();
  };

  // Handle clear filters
  const handleClearFilters = () => {
    const clearedParams = {
      From: lastParams.From || 1,
      To: lastParams.To || 10,
      Search: lastParams.Search || "",
      IsFavourite: lastParams.IsFavourite || false,
    };
    
    dispatch(fetchMyTask(clearedParams as any) as any);
    dispatch(setFilterApplied(false));
    closeModal();
  };

  return (
    <Modal header={"Filter"} closeModal={closeModal}>
      <div className={styles.filterContainer} onClick={(e) => e.stopPropagation()}>
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
        >
          {(formik) => {
            return (
              <Form>
                <div className={styles.filterSection}>
                  <h3 className={styles.sectionTitle}>By Task Type</h3>
                  <FormikControl
                    control="select"
                    label="Task Type"
                    name="TaskType"
                    options={[
                      { value: "Recurring", label: "Recurring" },
                      { value: "Non Recurring", label: "Non Recurring" },
                      { value: "Target", label: "Target" },
                    ]}
                    isMulti={false}
                  />
                </div>

                <div className={styles.filterSection}>
                  <h3 className={styles.sectionTitle}>By Date</h3>
                  <div className={styles.dateRow}>
                    <FormikControl
                      control="select"
                      label="Date Type"
                      name="DateType"
                      options={[
                        { value: "CreatedDate", label: "Created Date" },
                        { value: "ModifiedDate", label: "Modified Date" },
                      ]}
                      isMulti={false}
                    />
                  </div>
                  <div className={styles.dateRangeRow}>
                    <FormikControl
                      control="datePicker"
                      label="From Date"
                      name="FromCreatedDate"
                    />
                    <FormikControl
                      control="datePicker"
                      label="To Date"
                      name="ToCreatedDate"
                    />
                  </div>
                </div>

                <div className={styles.filterSection}>
                  <h3 className={styles.sectionTitle}>By Due Date</h3>
                  <FormikControl
                    control="select"
                    label="Due Date"
                    name="DueDate"
                    options={[
                      { value: "Today", label: "Today" },
                      { value: "Tomorrow", label: "Tomorrow" },
                      { value: "This Week", label: "This Week" },
                      { value: "Over Due", label: "Over Due" },
                      { value: "No Due Date", label: "No Due Date" },
                    ]}
                    isMulti={false}
                  />
                </div>

                <div className={styles.buttonContainer}>
                  <Button
                    variant="outlined"
                    onClick={handleClearFilters}
                    className={styles.clearButton}
                    type="button"
                  >
                    Clear
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    className={styles.applyButton}
                  >
                    Apply
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </Modal>
  );
};

export default FilterTask;
