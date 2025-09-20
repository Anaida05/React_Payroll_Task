import React, { useEffect, useState, useRef } from "react";
import Modal from "../../shared/Modal/Modal";
import { Button } from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import FormikControl from "../../shared/formik/FormikControl";
import dayjs from "dayjs";
import { privatePost } from "../../services/privateRequest";
import { ADDTASK } from "../../services/apiEndPoints";
import toast from "react-hot-toast";
import { priorities, UserId } from "../../../utils/utils";
import styles from "./AddTask.module.css";
import { Delete } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { addTask } from "../../slices/myTaskSlice";

// Type definitions for Props and state
interface Member {
  UserId: number;
  Name: string;
}

interface AddTaskProps {
  closeModal: () => void;
  teamMembers: Member[];
}

interface FormValues {
  title: string;
  description: string;
  members: string[];
  date: string;
  ccMembers: string[];
  priority: string;
  file: string;
}

const AddTask: React.FC<AddTaskProps> = ({ closeModal, teamMembers }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileObj, setFileObj] = useState<File | null>(null);
  const dispatch = useDispatch();

  // Validation Schema with Yup
  const SignupSchema = Yup.object().shape({
    title: Yup.string().required("Title is Required"),
    description: Yup.string().required("Description is Required"),
    members: Yup.array().required("This Field is Required"),
    date: Yup.string().required("This field is required"),
  });

  const userId = UserId();
  const initialValues: FormValues = {
    title: "",
    description: "",
    members: [],
    date: "",
    ccMembers: [],
    priority: "",
    file: "",
  };

  const handleCloseFun = () => {
    closeModal();
  };

  // Convert file to Base64
  const convertFileToBase64 = (file: File | null) => {
    return new Promise<string | undefined>((resolve, reject) => {
      if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result?.split(",")[1]); // Extract only Base64
        reader.onerror = (error) => reject(error);
      }
    });
  };

  // Handle file deletion
  const handleFileDelete = () => {
    setFileObj(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle form submission
  const handleSubmit = async (values: FormValues) => {
    let base64File = "";
    if (fileObj) {
      base64File = await convertFileToBase64(fileObj);
    }

    const formattedDate = dayjs(values.date).format("DD MMM YYYY hh:mm A");
    const ccMembersObj = values.ccMembers
      ? values.ccMembers.map((option) => ({
          UserId: option,
          Name: option, // You may want to adjust this part depending on how you store the ccMembers
        }))
      : [];

    const params = {
      AssignedBy: userId ? userId[0] : 1248,
      AssignedDate: "",
      AssignedToUserId: "",
      CompletedDate: "",
      Description: values.description,
      Id: "",
      Image: base64File ? base64File : "",
      IntercomGroupIds: [],
      IsActive: true,
      Latitude: "",
      LeadId: "",
      Location: "",
      Longitude: "",
      MultimediaData: base64File || "",
      MultimediaExtension: fileObj ? fileObj.name.split(".").pop() : "",
      MultimediaFileName: fileObj ? fileObj.name.split(".")[0] : "",
      MultimediaType: "D",
      Priority: values.priority ? values.priority : "",
      TaskDisplayOwners: values.ccMembers
        ? `${values.ccMembers.length} User${values.ccMembers.length > 1 ? "s" : ""}`
        : "",
      TaskEndDate: formattedDate,
      TaskEndDateDisplay: dayjs(values.date).toISOString(),
      TaskOwners: ccMembersObj,
      TaskStatus: "",
      Title: values.title,
      UserDisplayIds: `${values.members.length} User${values.members.length > 1 ? "s" : ""}`,
      UserIds: values.members,
    };

    await dispatch(addTask(params));
    closeModal();
  };

  useEffect(() => {
    console.log("fileObj", fileObj);
  }, [fileObj]);

  return (
    <>
      <Modal header={"Add task"} closeModal={closeModal}>
        <div>
          <Formik
            initialValues={initialValues}
            validationSchema={SignupSchema}
            onSubmit={handleSubmit}
          >
            {(formik) => {
              return (
                <Form>
                  <div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <FormikControl
                        control="input"
                        type="text"
                        label="Title"
                        placeholder="Enter Title"
                        name="title"
                        required={true}
                      />
                      <FormikControl
                        control="input"
                        type="text"
                        label="Description"
                        placeholder="Enter Description"
                        name="description"
                        required={true}
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
                        required={true}
                      />
                      <FormikControl
                        control="select"
                        label="Add CC Members"
                        name="ccMembers"
                        options={teamMembers.map((member) => ({
                          value: member.UserId.toString(),
                          label: member.Name,
                        }))}
                        isMulti={true}
                        isCCMember={true}
                      />
                    </div>
                    <div className={styles.row}>
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
                      <FormikControl
                        control="datePicker"
                        label="Select a date"
                        name="date"
                        minDate={new Date()}
                        required={true}
                      />
                    </div>
                    <div>
                      <input
                        type="file"
                        name="file"
                        label="Attach file"
                        onChange={(e) => {
                          const file = e.target.files ? e.target.files[0] : null;
                          setFileObj(file);
                        }}
                        className={styles.fileAttach}
                        ref={fileInputRef}
                      />
                      {fileObj && fileObj.name && (
                        <Delete
                          style={{ cursor: "pointer", marginLeft: "8px" }}
                          onClick={handleFileDelete}
                        />
                      )}
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
                      Add
                    </button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </Modal>
    </>
  );
};

export default AddTask;
