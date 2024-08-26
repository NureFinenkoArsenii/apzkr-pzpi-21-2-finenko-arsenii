import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const DroneContext = createContext();

export function DroneProvider({ children }) {
    const [drones, setDrones] = useState([]);
    const [selectedDrone, setSelectedDrone] = useState(null);
    const [mapState, setMapState] = useState(() => {
        // Ініціалізуємо стан карти з localStorage або використовуємо значення за замовчуванням
        const savedMapState = JSON.parse(localStorage.getItem('mapState'));
        return savedMapState || {
            center: [48.3794, 31.1656],
            zoom: 6,
        };
    });

    useEffect(() => {
        async function fetchDrones() {
            const response = await axios.get('http://localhost:5000/api/Drone/getAll');
            setDrones(response.data);
        }
        fetchDrones();
    }, []);

    const saveMapState = (newState) => {
        setMapState(newState);
        localStorage.setItem('mapState', JSON.stringify(newState));
    };

    const selectDrone = (drone) => setSelectedDrone(drone);
    const addDrone = (drone) => setDrones([...drones, drone]);
    const updateDrone = (updatedDrone) => {
        setDrones(drones.map(drone => drone.id === updatedDrone.id ? updatedDrone : drone));
    };
    const deleteDrone = (droneName) => {
        setDrones(drones.filter(drone => drone.droneName !== droneName));
    };

    return (
        <DroneContext.Provider value={{
            drones,
            selectedDrone,
            selectDrone,
            addDrone,
            updateDrone,
            deleteDrone,
            mapState,
            saveMapState
        }}>
            {children}
        </DroneContext.Provider>
    );
}