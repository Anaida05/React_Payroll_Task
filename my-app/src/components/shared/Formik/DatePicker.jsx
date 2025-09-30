import React from "react";
import { Field, ErrorMessage,useFormikContext } from "formik";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TextError from "./TextError";
import styles from "./Input.module.css";

const CustomDatePicker = (props) => {
  const { label, name,required, ...rest } = props;
  const formik = useFormikContext();
      const handleSelectChange = (selectedOption) => {
        
        formik.setFieldTouched(name, true);
        formik.setFieldValue(name, selectedOption);
      }

  return (
    <div className={styles.inputControl}>
      <span htmlFor={name}>{label}{required?"*":""}</span>
      <Field name={name} {...rest} className={styles.inputField}>
        {({ field }) => (
          <DatePicker
            id={name}
            {...field}
            {...rest}
            selected={field.value}
            onChange={handleSelectChange}
            className={styles.inputField}
            placeholderText="Select a date"
            dateFormat="dd MMM, yyyy"
            wrapperClassName="date-picker-wrapper"
            showPopperArrow={false}
          />
        )}
      </Field>
      <ErrorMessage name={name} component={TextError} />
    </div>
  );
};

export default CustomDatePicker;
