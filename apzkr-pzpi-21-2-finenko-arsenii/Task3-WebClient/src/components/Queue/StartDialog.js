import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import '../../styles/Queue/StartDialog.scss';

const StartDialog = ({ onClose, onStartAnimation, dronePositions }) => {
    const { t } = useTranslation();
    const [selectedOption, setSelectedOption] = useState('');
    const [droneQueue, setDroneQueue] = useState(Object.entries(dronePositions));
    const [droneTimes, setDroneTimes] = useState({});

    const handleOptionSelect = (option) => {
        setSelectedOption(option === selectedOption ? '' : option);
    };

    const handleTimeChange = (droneId, time) => {
        setDroneTimes(prevTimes => ({
            ...prevTimes,
            [droneId]: time,
        }));
    };

    const handleStartClick = () => {
        if (selectedOption) {
            const orderedDroneIds = droneQueue.map(([id]) => id);
            onStartAnimation(selectedOption, orderedDroneIds, droneTimes);
            onClose();
        }
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(droneQueue);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setDroneQueue(items);
    };

    return (
        <div className="start-dialog-overlay">
            <div className={`start-dialog ${selectedOption ? 'option-selected' : ''}`}>
                <h2>{t('animation')}</h2>
                <p>{t('how_drones_are_acting')}</p>
                <div className="options">
                    <label className={`option ${selectedOption === 'together' ? 'selected' : ''}`}>
                        <input
                            type="checkbox"
                            checked={selectedOption === 'together'}
                            onChange={() => handleOptionSelect('together')}
                        />
                        {t('together')}
                    </label>
                    <label className={`option ${selectedOption === 'one_after_another' ? 'selected' : ''}`}>
                        <input
                            type="checkbox"
                            checked={selectedOption === 'one_after_another'}
                            onChange={() => handleOptionSelect('one_after_another')}
                        />
                        {t('one_after_another')}
                    </label>
                    <label className={`option ${selectedOption === 'with_time' ? 'selected' : ''}`}>
                        <input
                            type="checkbox"
                            checked={selectedOption === 'with_time'}
                            onChange={() => handleOptionSelect('with_time')}
                        />
                        {t('with_time')}
                    </label>
                </div>

                {selectedOption === 'one_after_another' && (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="drones">
                            {(provided) => (
                                <div
                                    className="drone-queue"
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    <p>{t('set_a_drone_queue')}:</p>
                                    {droneQueue.map(([droneId, droneData], index) => (
                                        <Draggable key={droneId} draggableId={droneId} index={index}>
                                            {(provided) => (
                                                <div
                                                    className="queue-item"
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <span className="drone-info">
                                                        {droneData.name} ({droneData.type})
                                                    </span>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}

                {selectedOption === 'with_time' && (
                    <div className="drone-queue">
                        <p>{t('set_delay_for_each_drone')}:</p>
                        {droneQueue.map(([droneId, droneData], index) => (
                            <div key={droneId} className="queue-item">
                                <span className="drone-info">{droneData.name} ({droneData.type})</span>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder={t('delay_seconds')}
                                    className="drone-time-input"
                                    value={droneTimes[droneId] || ''}
                                    onChange={(e) => handleTimeChange(droneId, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                <div className="dialog-buttons">
                    <button
                        className="start-button"
                        onClick={handleStartClick}
                        disabled={!selectedOption}
                    >
                        {t('start')}
                    </button>
                    <button className="close-button" onClick={onClose}>{t('cancel')}</button>
                </div>
            </div>
        </div>
    );
};

export default StartDialog;
