import './alert_modals.css';
import Modal from 'react-modal'
import { useEffect, useRef, useState } from "react";

function AlertModals({phrase,isOpen,setIsOpen,type = 'success'}){

    const isError = type === 'error';

    const modalStyle = {
        overlay: {
            backgroundColor: 'transparent',
            position: 'fixed',
            zIndex: 100,
            inset: 0,
            pointerEvents: 'none',
        },
        content: {
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(90vw, 520px)',
            maxWidth: '90vw',
            padding: '10px 18px',
            borderRadius: '18px',
            border: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            backgroundColor: isError ? 'rgba(255, 191, 191, 1)' : 'rgb(226, 255, 226)',
            color: isError ? 'rgba(48, 2, 2, 1)' : 'rgba(5, 32, 5, 1)',
            fontSize: 18,
            lineHeight: 1.4,
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
            textAlign: 'center',
            boxSizing: 'border-box',
        }
    };

useEffect(() => {
        if (!isOpen) return;

        const timer = setTimeout(() => {
            setIsOpen(false);
        }, 5000);

        return () => clearTimeout(timer);
    },[isOpen]);

    return(
        <Modal
            isOpen={isOpen}
            style={modalStyle}
            className={{
                base: 'success-modal-content',
                afterOpen: 'success-modal-content--after-open',
                beforeClose: 'success-modal-content--before-close',
            }}
        >
            <div className='container-success'>
                <p>{phrase}</p>
            </div>
        </Modal>
    );
}

export default AlertModals;