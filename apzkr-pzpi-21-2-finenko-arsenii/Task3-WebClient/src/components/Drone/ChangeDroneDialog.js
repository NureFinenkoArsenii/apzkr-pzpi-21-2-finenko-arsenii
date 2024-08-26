import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/Drone/ChangeDroneDialog.scss';

function ChangeDroneDialog({ drone, onClose, onSave }) {
    const { t } = useTranslation(); // Ініціалізація перекладу
    const [droneName, setDroneName] = useState(drone.droneName);
    const [droneType, setDroneType] = useState(drone.droneType);

    const handleSubmit = (e) => {
        e.preventDefault();

        const updatedDrone = {
            ...drone,
            droneName,
            droneType,
        };

        onSave(updatedDrone);
        onClose();
    };

    return (
        <div className="dialog-backdrop">
            <div className="dialog">
                <h2>{t('change_drone_details')}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>{t('drone_name')}:</label>
                        <input
                            type="text"
                            value={droneName}
                            onChange={(e) => setDroneName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('drone_type')}:</label>
                        <input
                            type="text"
                            value={droneType}
                            onChange={(e) => setDroneType(e.target.value)}
                            required
                        />
                    </div>
                    <div className="dialog-actions">
                        <button type="submit" className="save-button">{t('save_changes')}</button>
                        <button type="button" className="cancel-button" onClick={onClose}>{t('cancel')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ChangeDroneDialog;