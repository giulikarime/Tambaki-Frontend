import './alert_modals.css';
import Modal from 'react-modal'
import { useEffect, useRef, useState } from "react";
import modalPhrase from '../../pages/Stock/Stock';

function AlertModals({phrase,isOpen,setIsOpen}){

    const typeOfPhrase = phrase === modalPhrase ? true : false;

    const modalStyle = {
        overlay: {
            backgroundColor: 'transparent',
            position: 'fixed',
            zIndex: 100,
            inset: 0
        },
        content: {
            position: 'absolute',
            top: '10%',
            left: '50%',
            width: 'auto',
            padding: '10px 15px',
            borderRadius: '50px',
            border: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            backgroundColor: `${typeOfPhrase? `rgb(226, 255, 226)` : `rgba(255, 191, 191, 1)`}`,
            whiteSpace: 'nowrap',
            color: `${typeOfPhrase ? `rgba(5, 32, 5, 1)` : `rgba(48, 2, 2, 1)`}`
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
                base: 'sucess-modal-content',
                afterOpen: 'sucess-modal-content--after-open',
                beforeClose: 'sucess-modal-content--before-close',
            }}
        >
            <div className='container-sucess'>
                <p>{phrase}</p>
            </div>
        </Modal>
    );
}

export default AlertModals;