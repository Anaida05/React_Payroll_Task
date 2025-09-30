import React from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  children: React.ReactNode;
  header: string;
  closeModal: () => void;
  closeDropDown?: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, header, closeModal, closeDropDown }) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <div className={styles.userModalDiv} onClick={handleBackdropClick}>
        <div className={styles.userFieldDiv} onClick={handleModalContentClick}>
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
