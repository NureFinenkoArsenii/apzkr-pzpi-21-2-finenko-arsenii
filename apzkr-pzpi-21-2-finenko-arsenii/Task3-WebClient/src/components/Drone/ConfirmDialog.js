import React from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/Drone/ConfirmDialog.scss';

function ConfirmDialog({ message, onConfirm, onCancel }) {
    const { t } = useTranslation(); // Ініціалізація перекладу

    const parsedMessage = message.split('"');

    return (
        <div className="confirm-dialog-backdrop">
            <div className="confirm-dialog">
                <p>
                    {parsedMessage[0]}
                    <strong>{parsedMessage[1]}</strong>
                    {parsedMessage[2]}
                </p>
                <div className="confirm-dialog-actions">
                    <button className="confirm-btn" onClick={onConfirm}>
                        {t('yes')}
                    </button>
                    <button className="cancel-btn" onClick={onCancel}>
                        {t('no')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;