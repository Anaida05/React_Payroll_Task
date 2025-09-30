import React from "react";
import Select, { SingleValue, MultiValue, StylesConfig } from "react-select";
import TextError from "./TextError";
import { ErrorMessage, useFormikContext, FormikContextType } from "formik";
import styles from "./Input.module.css";

interface OptionType {
  label: string;
  value: string;
}

interface CustomSelectProps {
  name: string;
  label: string;
  options: OptionType[];
  required?: boolean;
  isMulti?: boolean;
  isCCMember?: boolean;
  [key: string]: any; 
}

const CustomSelect: React.FC<CustomSelectProps> = (props) => {
  const { name, label, options, required, ...rest } = props;
  const formik = useFormikContext<any>(); 

  const handleSelectChange = (
    selectedOption: SingleValue<OptionType> | MultiValue<OptionType>
  ) => {
    formik.setFieldTouched(name, true);

    let value: any;

    if (rest.isCCMember) {
      value = selectedOption;
    } else if (Array.isArray(selectedOption)) {
      value = selectedOption.map((option) => option.value);
    } else {
      value = selectedOption ? (selectedOption as OptionType).value : "";
    }

    formik.setFieldValue(name, value);

    // example boolean conversion if needed
    const value1 = rest.isCCMember ? "true" : "false";
    // console.log("value1", value1);
  };

  // Get the current value to display
  const getCurrentValue = () => {
    const currentValue = formik.values[name];
    
    if (rest.isMulti) {
      // For multi-select, return array of selected options
      if (Array.isArray(currentValue)) {
        return options.filter(option => currentValue.includes(option.value));
      }
      return [];
    } else {
      // For single select, return the selected option
      return options.find(option => option.value === currentValue) || null;
    }
  };

  const customStyles: StylesConfig<OptionType, boolean> = {
    control: (provided) => ({
      ...provided,
      width: "100%",
      minWidth: "185px",
      borderRadius: "6px",
      fontWeight: 500,
      border: "1px solid #ddd",
      fontSize: "14px",
      color: "#333 !important",
      textAlign: "start",
      boxShadow: "none",
      padding: "0px",
      minHeight: "40px",
      "&:hover": {
        border: "1px solid #1976d2",
      },
      "&:focus": {
        border: "1px solid #1976d2",
        boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.1)",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#adb5bd",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#333",
    }),
  };

  return (
    <div className={styles.inputControl}>
      <span>
        {label}
        {required ? "*" : ""}
      </span>
      <Select
        id={name}
        name={name}
        styles={customStyles}
        options={options}
        onChange={handleSelectChange}
        value={getCurrentValue()}
        {...rest}
        isSearchable={true}
      />
      <ErrorMessage name={name} component={TextError} />
    </div>
  );
};

export default CustomSelect;
