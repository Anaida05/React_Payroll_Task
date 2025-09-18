import React from "react";
import { Field, ErrorMessage, FieldProps } from "formik";
import styles from "./Input.module.css";

interface InputProps {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  name,
  type,
  placeholder,
  required = false,
  ...rest
}) => {
  return (
    <div className={styles.inputControl}>
      <label htmlFor={name}>
        {label}
        {required ? "*" : ""}
      </label>

      <Field name={name} {...rest}>
        {({ field }: FieldProps) => (
          <input
            {...field}
            id={name}
            type={type}
            placeholder={placeholder}
            className={styles.inputField}
          />
        )}
      </Field>

      <ErrorMessage name={name}>
        {(errorMsg) => <div className={styles.errorText}>{errorMsg}</div>}
      </ErrorMessage>
    </div>
  );
};

export default Input;
