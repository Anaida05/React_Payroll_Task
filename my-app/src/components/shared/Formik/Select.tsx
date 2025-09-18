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

  const customStyles: StylesConfig<OptionType, boolean> = {
    control: (provided) => ({
      ...provided,
      width: "185px",
      borderRadius: "5px",
      fontWeight: 500,
      border: "0.5px solid #e1e1ef",
      fontSize: "12px",
      color: "rgb(10, 10, 57) !important",
      textAlign: "start",
      boxShadow: "none",
      padding: "0px",
      "&:hover": {
        border: "0.5px solid #e1e1ef",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#adb5bd",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "rgb(10, 10, 57)",
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
        value={formik.values[name]}
        {...rest}
        isSearchable={true}
      />
      <ErrorMessage name={name} component={TextError} />
    </div>
  );
};

export default CustomSelect;
