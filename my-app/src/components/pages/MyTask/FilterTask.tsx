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
import styles from "./AddTask.module.css";
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
}

interface FormValues {
  status: string | null;
  priority: string | null;
  members: string[];
  fromDate: string | null;
  toDate: string | null;
}

const FilterTask: React.FC<FilterTaskProps> = ({ closeModal, teamMembers }) => {
  const dispatch = useDispatch();

  // Form initial values
  const initialValues: FormValues = {
    status: "",
    priority: "",
    members: [],
    fromDate: "",
    toDate: "",
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
    const formattedFromDate = dayjs(values.fromDate).format("MM/DD/YYYY");
    const formattedToDate = dayjs(values.toDate).format("MM/DD/YYYY");

    const newParams = {
      UserIds: values.members,
      TaskStatus: values.status ? values.status : "",
      Priority: values.priority ? values.priority : "",
      FromDueDate: formattedFromDate ? formattedFromDate : "",
      ToDueDate: formattedToDate ? formattedToDate : "",
    };

    const updatedParams = {
      ...lastParams,
      ...newParams,
    };

    // Dispatch actions to fetch tasks with updated filters
    dispatch(fetchMyTask(updatedParams));
    dispatch(setFilterApplied(true));
    closeModal();
  };

  return (
    <Modal header={"Filter Task"} closeModal={closeModal}>
      <div>
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
        >
          {(formik) => {
            return (
              <Form>
                <div>
                  <div className={styles.row}>
                    <FormikControl
                      control="select"
                      label="Select Status"
                      name="status"
                      options={status.map((option) => ({
                        value: option.value,
                        label: option.label,
                      }))}
                      isMulti={false}
                    />
                    <FormikControl
                      control="select"
                      label="Select Priority"
                      name="priority"
                      options={priorities.map((priority) => ({
                        value: priority.value,
                        label: priority.label,
                      }))}
                      isMulti={false}
                    />
                  </div>
                  <div className={styles.row}>
                    <FormikControl
                      control="select"
                      label="Add Members"
                      name="members"
                      options={teamMembers.map((member) => ({
                        value: member.UserId.toString(),
                        label: member.Name,
                      }))}
                      isMulti={true}
                    />
                    <FormikControl
                      control="datePicker"
                      label="From due date"
                      name="fromDate"
                    />
                  </div>

                  <div className={styles.row}>
                    <FormikControl
                      control="datePicker"
                      label="To due date"
                      name="toDate"
                    />
                  </div>
                </div>

                <div className={styles.btnDiv}>
                  <button
                    className={styles.addCancelBtn}
                    onClick={handleCloseFun}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button className={styles.addCancelBtn} type="submit">
                    Apply Filters
                  </button>
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
