// import React, { useState } from 'react';
import { Field, ErrorMessage, FieldProps } from 'formik';
import TextError from './TextError';
import styles from './Input.module.scss';
import { useState } from 'react';

interface InputProps {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({ label, name, type, placeholder, required = false, ...rest }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';

  const toggleVisibility = () => setShowPassword(prev => !prev);

  return (
    <div className={styles.inputControl}>
      <label htmlFor={name}>
        {label}
        {required ? '*' : ''}
      </label>

      <div className={styles.passwordWrapper}>
        <Field name={name} {...rest}>
          {({ field }: FieldProps) => (
            <input
              {...field}
              id={name}
              type={isPasswordType && showPassword ? 'text' : type}
              placeholder={placeholder}
              className={styles.inputField}
            />
          )}
        </Field>

         </div>

      <ErrorMessage name={name} component={TextError} />
    </div>
  );
};

export default Input;
