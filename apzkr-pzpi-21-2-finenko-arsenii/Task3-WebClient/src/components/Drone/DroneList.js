import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import * as signalR from '@microsoft/signalr'; // Імпорт SignalR клієнта
import AddDroneDialog from './AddDroneDialog';
import ChangeDroneDialog from './ChangeDroneDialog';
import ConfirmDialog from './ConfirmDialog';
import '../../styles/Drone/DroneList.scss';

import attackIcon from '../../media/attackdrone.png';
import transportIcon from '../../media/transportdrone.png';
import scoutIcon from '../../media/scout-drone.png';
import defaultIcon from '../../media/anothertype.png'; // Іконка за замовчуванням для інших типів

function DroneList({ planningMode, startQueueMode, selectedDrone, onSelectDrone, currentStage, queueMode }) {
    const { t } = useTranslation(); // Ініціалізація перекладу
    const [drones, setDrones] = useState([]);  // Повний список дронів
    const [filteredDrones, setFilteredDrones] = useState([]);  // Відфільтрований або відсортований список для відображення
    const [selectedDroneIds, setSelectedDroneIds] = useState([]);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isChangeDialogOpen, setIsChangeDialogOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [droneToDelete, setDroneToDelete] = useState(null);
    const [droneToChange, setDroneToChange] = useState(null);
    const [filterType, setFilterType] = useState(null);
    const [droneStats, setDroneStats] = useState({}); // Стан для збереження статистики дронів
    const droneListRef = useRef(null);

    // Створюємо SignalR з'єднання під час завантаження компонента
    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5000/statshub", {
                withCredentials: true // Використання облікових даних
            })
            .withAutomaticReconnect()
            .build();

        connection.start()
            .then(() => console.log('Підключено до SignalR'))
            .catch(err => console.error('Помилка під час підключення до SignalR:', err));

        // Обробник для отримання оновлень статистики
        connection.on("ReceiveStatsUpdate", (update) => {
            setDroneStats(prevStats => ({
                ...prevStats,
                [update.droneId]: prevStats[update.droneId].map(stat =>
                    stat.statsType === update.statsType
                        ? { ...stat, statsInformation: update.statsInformation }
                        : stat
                )
            }));
        });

        return () => {
            connection.stop();
        };
    }, []);

    useEffect(() => {
        const fetchDrones = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/Drone/getAll');
                const loadedDrones = response.data;
                const savedOrder = JSON.parse(localStorage.getItem('droneOrder'));

                if (savedOrder && savedOrder.length === loadedDrones.length) {
                    const orderedDrones = savedOrder
                        .map(id => loadedDrones.find(drone => drone.id === id))
                        .filter(drone => drone !== undefined);

                    setDrones(orderedDrones);
                    setFilteredDrones(orderedDrones);
                } else {
                    setDrones(loadedDrones);
                    setFilteredDrones(loadedDrones);
                    saveOrderToLocalStorage(loadedDrones);
                }
            } catch (error) {
                console.error(t('fetch_drones_error'), error);
            }
        };

        fetchDrones();
    }, [t]);

    const saveOrderToLocalStorage = (newDrones) => {
        const droneOrder = newDrones.map(drone => drone.id);
        localStorage.setItem('droneOrder', JSON.stringify(droneOrder));
    };

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleSelectDrone = (droneId) => {
        const selectedDroneObj = drones.find(drone => drone.id === droneId);
        if (planningMode || queueMode) {
            onSelectDrone(selectedDroneObj); // Передаємо весь об'єкт дрона
        } else {
            if (selectedDroneIds.includes(droneId)) {
                setSelectedDroneIds(selectedDroneIds.filter(id => id !== droneId));
            } else {
                setSelectedDroneIds([...selectedDroneIds, droneId]);
            }
        }
    };

    const handleCollapseAll = () => {
        setSelectedDroneIds([]);
        setDroneStats({});
    };

    const handleAddDrone = (newDrone) => {
        const updatedDrones = [...drones, newDrone];
        setDrones(updatedDrones);
        setFilteredDrones(updatedDrones);
        saveOrderToLocalStorage(updatedDrones);
    };

    const handleDeleteDrone = (droneName) => {
        setDroneToDelete(droneName);
        setIsConfirmOpen(true);
    };

    const handleChangeDrone = (drone) => {
        setDroneToChange(drone);
        setIsChangeDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/Drone/deleteByDroneName/${droneToDelete}`);
            const updatedDrones = drones.filter(drone => drone.droneName !== droneToDelete);
            setDrones(updatedDrones);
            setFilteredDrones(updatedDrones);
            setIsConfirmOpen(false);
            setDroneToDelete(null);
            saveOrderToLocalStorage(updatedDrones);
        } catch (error) {
            console.error(t('delete_drone_error'), error);
            alert(t('delete_drone_fail'));
        }
    };

    const handleSaveChanges = async (updatedDrone) => {
        try {
            await axios.put(`http://localhost:5000/api/Drone/changeDroneName`, {
                droneId: updatedDrone.id,
                newDroneName: updatedDrone.droneName,
            });

            await axios.put(`http://localhost:5000/api/Drone/changeDroneType`, {
                droneId: updatedDrone.id,
                newDroneType: updatedDrone.droneType,
            });

            const updatedDrones = drones.map(drone => (drone.id === updatedDrone.id ? updatedDrone : drone));
            setDrones(updatedDrones);
            setFilteredDrones(updatedDrones);
            setIsChangeDialogOpen(false);
            saveOrderToLocalStorage(updatedDrones);
        } catch (error) {
            console.error(t('update_drone_error'), error);
            alert(t('update_drone_fail'));
        }
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const reorderedDrones = Array.from(filteredDrones);
        const [movedDrone] = reorderedDrones.splice(result.source.index, 1);
        reorderedDrones.splice(result.destination.index, 0, movedDrone);

        setFilteredDrones(reorderedDrones);
        setDrones(reorderedDrones);
        saveOrderToLocalStorage(reorderedDrones);
    };

    const handleTypeFilter = (type) => {
        setFilterType(type);
        setFilteredDrones(drones.filter(drone => drone.droneType === type));
    };

    const resetFilter = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/Drone/getAll');
            const allDrones = response.data;
            
            setDrones(allDrones);
            setFilteredDrones(allDrones);
            saveOrderToLocalStorage(allDrones);
            setFilterType(null);
        } catch (error) {
            console.error(t('reset_drones_error'), error);
        }
    };

    const sortDrones = () => {
        const sortedDrones = [...filteredDrones].sort((a, b) => {
            if (a.droneType < b.droneType) return -1;
            if (a.droneType > b.droneType) return 1;
            return a.droneName.localeCompare(b.droneName);
        });
    
        setFilteredDrones(sortedDrones);
        setDrones(sortedDrones);
        saveOrderToLocalStorage(sortedDrones);
    };

    const translateStatsType = (statsType) => {
        switch (statsType.toLowerCase()) {
            case 'humidity':
                return t('humidity');
            case 'temperature':
                return t('temperature');
            case 'winddirection':
                return t('wind_direction');
            case 'windspeed':
                return t('wind_speed');
            case 'rebpresence':
                return t('reb_presence');
            case 'batterylevel':
                return t('battery_level');
            default:
                return statsType;
        }
    };

    const handleShowStats = async (droneId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/Stats/getByDroneId/${droneId}`);
            setDroneStats(prevStats => ({
                ...prevStats,
                [droneId]: response.data
            }));
        } catch (error) {
            console.error(t('fetch_stats_error'), error);
            alert(t('fetch_stats_fail'));
        }
    };

    const handleHideStats = (droneId) => {
        setDroneStats((prevStats) => {
            const newStats = { ...prevStats };
            delete newStats[droneId];
            return newStats;
        });
        if (!selectedDroneIds.includes(droneId)) {
            setSelectedDroneIds([...selectedDroneIds, droneId]);
        }
    };

    const getDroneIcon = (droneType) => {
        switch (droneType.toLowerCase()) {
            case 'attack':
                return attackIcon;
            case 'transport':
                return transportIcon;
            case 'scout':
                return scoutIcon;
            default:
                return defaultIcon;
        }
    };

    const translateDroneType = (droneType) => {
        switch (droneType.toLowerCase()) {
            case 'attack':
                return t('attack_drone');
            case 'transport':
                return t('transport_drone');
            case 'scout':
                return t('scout_drone');
            default:
                return droneType;
        }
    };

    return (
        <>
            <div className={`drone-tab ${isCollapsed ? 'collapsed' : ''}`}>
                {!isCollapsed && (
                    <>
                        <div className="drone-tab-header">
                            <h2>{t('drones')}</h2>
                            <button className="sort-button" onClick={sortDrones}>
                                {t('sort')}
                            </button>
                            <button className="filter-reset-button" onClick={resetFilter}>
                                {t('reset')}
                            </button>
                            {(selectedDroneIds.length > 0 || Object.keys(droneStats).length > 0) && (
                                <button className="collapse-all-button" onClick={handleCollapseAll}>
                                    {t('collapse_all')}
                                </button>
                            )}
                            <button className="collapse-button" onClick={toggleCollapse}>
                                {'>'}
                            </button>
                        </div>
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="drone-list">
                                {(provided) => (
                                    <div
                                        className="drone-list"
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                    >
                                        {filteredDrones.map((drone, index) => (
                                            <Draggable key={drone.id} draggableId={drone.id.toString()} index={index}>
                                                {(provided) => (
                                                    <div
                                                        className={`drone-item ${planningMode ? 'planning-mode' : ''} ${planningMode ? (selectedDrone && selectedDrone.id === drone.id ? 'selected' : '') : (selectedDroneIds.includes(drone.id) ? 'selected' : '')}`}
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        onClick={() => handleSelectDrone(drone.id)}
                                                    >
                                                        {planningMode && (
                                                            <img
                                                                src={getDroneIcon(drone.droneType)}
                                                                alt={`${drone.droneType} icon`}
                                                                className="drone-icon"
                                                            />
                                                        )}
                                                        <strong>{drone.droneName}</strong>
                                                        <span
                                                            className="drone-type"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleTypeFilter(drone.droneType);
                                                            }}
                                                        >
                                                            {translateDroneType(drone.droneType)}
                                                        </span>
                                                        {!planningMode && selectedDroneIds.includes(drone.id) && (
                                                            <div className="drone-actions">
                                                                <button
                                                                    className="drone-action-btn"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleShowStats(drone.id);
                                                                    }}
                                                                >
                                                                    {t('stats')}
                                                                </button>
                                                                <button
                                                                    className="drone-action-btn"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleChangeDrone(drone);
                                                                    }}
                                                                >
                                                                    {t('change')}
                                                                </button>
                                                                <button
                                                                    className="drone-action-btn"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteDrone(drone.droneName);
                                                                    }}
                                                                >
                                                                    {t('delete')}
                                                                </button>
                                                            </div>
                                                        )}
                                                        {!planningMode && droneStats[drone.id] && (
                                                            <div
                                                                className="drone-stats"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleHideStats(drone.id);
                                                                }}
                                                            >
                                                                {droneStats[drone.id].map((stat, i) => (
                                                                    <div key={i}>
                                                                        <strong>{translateStatsType(stat.statsType)}:</strong> {stat.statsInformation}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                        {!planningMode ? (
                            <button 
                                className={`add-drone-button ${queueMode && currentStage === 1 ? 'disabled' : ''}`} 
                                onClick={queueMode && currentStage === 1 ? null : () => setIsDialogOpen(true)}
                                disabled={queueMode && currentStage === 1}
                            >
                                {t('add_drone')}
                            </button>
                        ) : (
                            <button 
                                className={`new-queue-button ${queueMode && currentStage !== 0 ? 'disabled' : ''}`} 
                                onClick={queueMode && currentStage !== 0 ? null : startQueueMode}
                                disabled={queueMode && currentStage !== 0}
                            >
                                {t('new_queue')}
                            </button>
                        )}
                    </>
                )}
            </div>
            {isCollapsed && (
                <button className="expand-button" onClick={toggleCollapse}>
                    {t('drones')}
                </button>
            )}
            {isDialogOpen && (
                <AddDroneDialog
                    onClose={() => setIsDialogOpen(false)}
                    onAddDrone={handleAddDrone}
                />
            )}
            {isChangeDialogOpen && (
                <ChangeDroneDialog
                    drone={droneToChange}
                    onClose={() => setIsChangeDialogOpen(false)}
                    onSave={handleSaveChanges}
                />
            )}
            {isConfirmOpen && (
                <ConfirmDialog
                    message={t('confirm_delete', { droneName: droneToDelete })}
                    onConfirm={confirmDelete}
                    onCancel={() => setIsConfirmOpen(false)}
                />
            )}
        </>
    );
}

export default DroneList;