import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/Drone/ErrorDialog.scss';

function ErrorDialog({ message, onClose }) {
    const { t } = useTranslation(); // Ініціалізація перекладу
    const dialogRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dialogRef.current && !dialogRef.current.contains(e.target)) {
                onClose(); // Закриття ErrorDialog при натисканні поза його межами
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div className="error-dialog-backdrop">
            <div className="error-dialog-container" ref={dialogRef}>
                <h2 className="error-dialog-title">{t('error')}</h2>
                <p className="error-dialog-message">{message}</p>
                <div className="error-dialog-actions">
                    <button className="error-dialog-button" onClick={onClose}>Ok</button>
                </div>
            </div>
        </div>
    );
}

export default ErrorDialog;