import React from 'react';
import { Field, ErrorMessage } from 'formik';
import TextError from './TextError';
import styles from "./Input.module.css"

const Input = (props) => {
    const { label, name, type, icon, required,placeholder,...rest } = props;

    return (
        <div className={styles.inputControl}>
            <span htmlFor={name}>{label}{required?"*":""}</span>
           
            <Field name={name} type={type} {...rest} className={styles.inputField}>
                {({ field }) => (
                    <input
                        {...field}
                        id={name}
                        type={type}
                        placeholder={placeholder}
                        className={styles.inputField}
                    />
                )}
            </Field>
            <ErrorMessage name={name} component={TextError} />
        </div>
    );
};

export default Input;

