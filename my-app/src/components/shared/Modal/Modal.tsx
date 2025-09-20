import React from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  children: React.ReactNode;
  header: string;
  closeModal: () => void;
  closeDropDown: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, header, closeModal, closeDropDown }) => {
  return (
    <>
      <div className={styles.userModalDiv}>
        <div className={styles.userFieldDiv} onClick={closeDropDown}>
          <span className={styles.closeIconModal} onClick={closeModal}>
            x
          </span>
          {header.length === 0 ? '' : <p className={styles.modalHeader}>{header}</p>}
          <div className={styles.childrenDiv}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

export default Modal;
