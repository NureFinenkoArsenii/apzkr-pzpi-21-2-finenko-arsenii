import React, { useContext, useState, useEffect } from 'react';
import { DroneContext } from './DroneContext';
import DroneFormField from './DroneFormField';
import axios from 'axios';

function RegisterDrone() {
    const { selectedDrone, addDrone, updateDrone } = useContext(DroneContext);
    const [droneName, setDroneName] = useState('');
    const [droneType, setDroneType] = useState('');
    const [safetyCode, setSafetyCode] = useState('');
    const [id, setId] = useState(null);

    useEffect(() => {
        if (selectedDrone) {
            setDroneName(selectedDrone.droneName || '');
            setDroneType(selectedDrone.droneType || '');
            setSafetyCode(selectedDrone.safetyCode || '');
            setId(selectedDrone.id || null);
        } else {
            setDroneName('');
            setDroneType('');
            setSafetyCode('');
            setId(null);
        }
    }, [selectedDrone]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedDrone) {
            try {
                const updatedDrone = { id, droneName, droneType, safetyCode };
                updateDrone(updatedDrone);
                window.location.reload();
            } catch (error) {
                console.error('Error updating drone data:', error);
            }
        } else {
            try {
                const newDrone = { droneName, droneType, safetyCode };
                await axios.post('http://localhost:5000/api/Drone/register', newDrone);
                addDrone(newDrone);
                window.location.reload();
            } catch (error) {
                console.error('Error registering drone:', error);
            }
        }
    };

    return (
        <div className="register-drone">
            <h2>{selectedDrone ? 'Edit Drone' : 'Register New Drone'}</h2>
            <form onSubmit={handleSubmit}>
                <DroneFormField label="Drone Name" value={droneName} onChange={setDroneName} />
                <DroneFormField label="Drone Type" value={droneType} onChange={setDroneType} />
                <DroneFormField label="Safety Code" value={safetyCode} onChange={setSafetyCode} disabled={!!selectedDrone} />
                <button type="submit">{selectedDrone ? 'Update Drone' : 'Register Drone'}</button>
            </form>
        </div>
    );
}

export default RegisterDrone;