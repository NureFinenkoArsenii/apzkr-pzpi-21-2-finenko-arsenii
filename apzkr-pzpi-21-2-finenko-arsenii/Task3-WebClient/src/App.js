import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DroneProvider } from './components/Drone/DroneContext';
import MapView from './components/Map/MapView';
import DroneList from './components/Drone/DroneList';
import LanguageDialog from './components/InteractionColumn/LanguageDialog';
import DrawingBoard from './components/InteractionColumn/DrawingBoard';
import './App.scss';
import { motion, AnimatePresence } from 'framer-motion';
import QueueList from './components/Queue/QueueList';
import dropPointIcon from './media/drop-point.png';
import StartDialog from './components/Queue/StartDialog';

function App() {
    const { t, i18n } = useTranslation();
    const [showTitle, setShowTitle] = useState(true);
    const [planningMode, setPlanningMode] = useState(false);
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [titleVisible, setTitleVisible] = useState(false);
    const [isNormalMode, setIsNormalMode] = useState(false);
    const [focusOnUkraine, setFocusOnUkraine] = useState(false);
    const [showOptionsDialog, setShowOptionsDialog] = useState(false);
    const [drawingMode, setDrawingMode] = useState(false);
    const [queueMode, setQueueMode] = useState(false);
    const [showMarkers, setShowMarkers] = useState(true);
    const [dronePositions, setDronePositions] = useState({});
    const [initialDronePositions, setInitialDronePositions] = useState({});
    const [queueStages, setQueueStages] = useState([]);
    const [currentStage, setCurrentStage] = useState(0);
    const [showNotification, setShowNotification] = useState(false);
    const [dropPointActive, setDropPointActive] = useState(false);
    const [dropPointPosition, setDropPointPosition] = useState(null);
    const [showDropPointButton, setShowDropPointButton] = useState(true);
    const [selectedDrone, setSelectedDrone] = useState(null);
    const [showStartDialog, setShowStartDialog] = useState(false);
    const [animationFinished, setAnimationFinished] = useState(false);

    useEffect(() => {
        setQueueStages([
            { name: t('setting_drop_point'), completed: false },
            { name: t('select_drone'), completed: false },
            { name: t('start_animation'), completed: false },
        ]);
    }, [i18n.language, t]);

    useEffect(() => {
        const header = document.querySelector('.header');

        setTimeout(() => {
            header.classList.add('fade-out');
            setTimeout(() => {
                header.classList.add('hidden');
                setShowTitle(false);
            }, 1500);
        }, 750);

        header.addEventListener('click', () => {
            header.classList.add('hidden');
            setShowTitle(false);
        });
    }, []);

    const handleFocusOnUkraine = () => {
        setFocusOnUkraine(true);
        setTimeout(() => {
            setFocusOnUkraine(false);
        }, 500);
    };

    const activatePlanningMode = () => {
        setPlanningMode(true);
        document.body.classList.add('planning-mode-active');
    };

    const deactivatePlanningMode = () => {
        setPlanningMode(false);
        document.body.classList.remove('planning-mode-active');
        setIsNormalMode(false);
        setSelectedDrone(null);
    };

    const startPlanningMode = () => {
        setOverlayVisible(true);
        setTitleVisible(true);
        setIsNormalMode(false);

        setTimeout(() => {
            if (!titleVisible) {
                activatePlanningMode();
            }
        }, 2500);
    };

    const startNormalMode = () => {
        setOverlayVisible(true);
        setTitleVisible(true);
        setIsNormalMode(true);

        setTimeout(() => {
            if (!titleVisible) {
                deactivatePlanningMode();
            }
        }, 2500);
    };

    const handleTitleClick = () => {
        setTitleVisible(false);
        setOverlayVisible(false);

        if (isNormalMode) {
            deactivatePlanningMode();
        } else {
            activatePlanningMode();
        }
    };

    const startQueueMode = () => {
        setQueueMode(true);
        setShowMarkers(true);
        setOverlayVisible(false);
        setTitleVisible(false);
        document.body.classList.add('queue-mode-active');
        setShowNotification(true);
        setShowDropPointButton(true);
        setDronePositions({});
        setInitialDronePositions({});
        setAnimationFinished(false);
    };

    const exitQueueMode = () => {
        setQueueMode(false);
        setShowMarkers(false);
        document.body.classList.remove('queue-mode-active');
        setDropPointActive(false);
        setDropPointPosition(null);
        setCurrentStage(0);
        setQueueStages([
            { name: t('setting_drop_point'), completed: false },
            { name: t('select_drone'), completed: false },
            { name: t('start_animation'), completed: false },
        ]);
        setDronePositions({});
        setInitialDronePositions({});
    };

    const handleDropPointSet = (point) => {
        setQueueStages(prevStages =>
            prevStages.map((stage, index) =>
                index === 0 ? { ...stage, completed: true } : stage
            )
        );
        setCurrentStage(1);
        setShowNotification(false);
        setDropPointActive(false);
        setDropPointPosition(point);
    };

    const handleDroneSelected = (drone) => {
        setSelectedDrone(drone);
    };

    const handleDronePlacedOnMap = (position) => {
        console.log("Drone placed at:", position);

        setDronePositions(prevPositions => ({
            ...prevPositions,
            [selectedDrone.id]: position
        }));

        setInitialDronePositions(prevPositions => ({
            ...prevPositions,
            [selectedDrone.id]: { ...position }
        }));
    };

    const animateDrones = (option) => {
        if (option === 'together' && dropPointPosition) {
            const duration = 5000;
            const startTime = performance.now();
            const updatedPositions = { ...dronePositions };

            const animateStep = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                Object.keys(updatedPositions).forEach(droneId => {
                    const drone = updatedPositions[droneId];
                    drone.position = [
                        drone.position[0] + (dropPointPosition[0] - drone.position[0]) * progress,
                        drone.position[1] + (dropPointPosition[1] - drone.position[1]) * progress
                    ];
                });

                setDronePositions({ ...updatedPositions });

                if (progress < 1) {
                    requestAnimationFrame(animateStep);
                } else {
                    returnDronesToStartPositions();
                }
            };

            requestAnimationFrame(animateStep);
        }
    };

    const animateDronesOneByOne = (droneQueue) => {
        if (dropPointPosition && droneQueue.length > 0) {
            const duration = 3000;
            let currentIndex = 0;

            const moveDrone = () => {
                const droneId = droneQueue[currentIndex];
                const startTime = performance.now();

                const animateStep = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const updatedPositions = { ...dronePositions };

                    updatedPositions[droneId].position = [
                        initialDronePositions[droneId].position[0] + (dropPointPosition[0] - initialDronePositions[droneId].position[0]) * progress,
                        initialDronePositions[droneId].position[1] + (dropPointPosition[1] - initialDronePositions[droneId].position[1]) * progress
                    ];

                    setDronePositions({ ...updatedPositions });

                    if (progress < 1) {
                        requestAnimationFrame(animateStep);
                    } else {
                        currentIndex++;
                        if (currentIndex < droneQueue.length) {
                            setTimeout(moveDrone, 1000);
                        } else {
                            setTimeout(() => {
                                returnDronesToStartPositions();
                            }, 2000);
                        }
                    }
                };

                requestAnimationFrame(animateStep);
            };

            moveDrone();
        }
    };

    const animateDronesWithTime = (droneQueue, droneTimes) => {
        if (dropPointPosition && droneQueue.length > 0) {
            let completedAnimations = 0;

            droneQueue.forEach((droneId) => {
                const delay = droneTimes[droneId] ? parseInt(droneTimes[droneId], 10) * 1000 : 0;

                setTimeout(() => {
                    const startTime = performance.now();
                    const duration = 3000;

                    const animateStep = (currentTime) => {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const updatedPositions = { ...dronePositions };

                        updatedPositions[droneId].position = [
                            initialDronePositions[droneId].position[0] + (dropPointPosition[0] - initialDronePositions[droneId].position[0]) * progress,
                            initialDronePositions[droneId].position[1] + (dropPointPosition[1] - initialDronePositions[droneId].position[1]) * progress
                        ];

                        setDronePositions({ ...updatedPositions });

                        if (progress < 1) {
                            requestAnimationFrame(animateStep);
                        } else {
                            completedAnimations++;

                            if (completedAnimations === droneQueue.length) {
                                setTimeout(() => {
                                    returnDronesToStartPositions();
                                }, 2000);
                            }
                        }
                    };

                    requestAnimationFrame(animateStep);
                }, delay);
            });
        }
    };

    const returnDronesToStartPositions = () => {
        setDronePositions(initialDronePositions);
        setCurrentStage(1);
    };

    const handleStartAnimation = (option, droneQueue, droneTimes = {}) => {
        setQueueStages(prevStages =>
            prevStages.map((stage, index) =>
                index === 2 ? { ...stage, completed: true } : stage
            )
        );
        setCurrentStage(2);

        if (option === 'together') {
            animateDrones('together');
        } else if (option === 'one_after_another') {
            animateDronesOneByOne(droneQueue);
        } else if (option === 'with_time') {
            animateDronesWithTime(droneQueue, droneTimes);
        }
    };

    const handleDropPointClick = () => {
        setDropPointActive(true);
        setShowDropPointButton(false);
    };

    const handleRefreshClick = () => {
        window.location.reload(); // Оновлення сторінки
    };

    return (
        <DroneProvider>
            <div className="app">
                {!drawingMode && showTitle && (
                    <header className="header">
                        <div className="title" onClick={handleTitleClick}>Smart War Drones</div>
                    </header>
                )}
                <div className="content">
                    {!drawingMode && !queueMode && (
                        <div className="interaction-column">
                            <div className="interaction-title">{t('instruments')}</div>
                            <div className="interaction-menu">
                                <button onClick={handleFocusOnUkraine}>{t('focus_on_ukraine')}</button>
                                <button onClick={() => setShowOptionsDialog(true)}>{t('language')}</button>
                                <button onClick={() => setDrawingMode(!drawingMode)}>
                                    {drawingMode ? t('close_drawing') : t('drawing')}
                                </button>
                                <button onClick={handleRefreshClick}>{t('refresh')}</button> {/* Додаємо обробник події */}
                            </div>
                        </div>
                    )}

                    <div className="map-container">
                        <MapView
                            focusOnUkraine={focusOnUkraine}
                            setFocusOnUkraine={setFocusOnUkraine}
                            drawingMode={drawingMode}
                            dropPointActive={dropPointActive}
                            dropPointPosition={dropPointPosition}
                            setDropPointPosition={setDropPointPosition}
                            onDropPointSet={handleDropPointSet}
                            selectedDrone={selectedDrone}
                            onDronePlaced={handleDronePlacedOnMap}
                            showMarkers={showMarkers}
                            dronePositions={dronePositions}
                            setDronePositions={setDronePositions}
                        />
                    </div>

                    {!drawingMode && (!queueMode || currentStage === 1) && (
                        <div className="sidebar">
                            <h2>{queueMode && currentStage === 1 ? t('select_drone') : t('available_drones')}</h2>
                            <DroneList 
                                planningMode={planningMode} 
                                startQueueMode={startQueueMode} 
                                selectedDrone={selectedDrone} 
                                onSelectDrone={handleDroneSelected}
                                queueMode={queueMode} 
                                currentStage={currentStage}
                            />
                        </div>
                    )}

                    {queueMode && (
                        <>
                            <QueueList stages={queueStages} currentStage={currentStage} />
                            {queueMode && currentStage === 1 && Object.keys(dronePositions).length > 0 && (
                                <button 
                                    className="start-animation-button" 
                                    onClick={() => setShowStartDialog(true)}
                                >
                                    {t('start')}
                                </button>
                            )}
                        </>
                    )}

                    {!planningMode && !drawingMode && !queueMode && (
                        <button className="planning-button" onClick={startPlanningMode}>
                            {t('planning_mode')}
                        </button>
                    )}

                    {planningMode && !drawingMode && !queueMode && (
                        <button className="normal-mode-button" onClick={startNormalMode}>
                            {t('normal_mode')}
                        </button>
                    )}

                    {queueMode && currentStage === 0 && showDropPointButton && (
                        <button className="drop-point-button" onClick={handleDropPointClick}>
                            <img src={dropPointIcon} alt={t('drop_point')} className="drop-point-icon" />
                            {t('drop_point')}
                        </button>
                    )}

                    {queueMode && (
                        <button className="exit-queue-button" onClick={exitQueueMode}>
                            {t('exit')}
                        </button>
                    )}

                    {showOptionsDialog && !drawingMode && !queueMode && (
                        <LanguageDialog onClose={() => setShowOptionsDialog(false)} />
                    )}

                    {drawingMode && <DrawingBoard onExit={() => setDrawingMode(false)} />}

                    {showNotification && (
                        <AnimatePresence>
                            <motion.div
                                className="notification"
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, transition: { duration: 2 } }}
                                onMouseOver={() => setShowNotification(false)}
                            >
                                {t('set_drop_point')}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>

                {!drawingMode && !queueMode && (
                    <AnimatePresence>
                        {overlayVisible && (
                            <motion.div
                                className="planning-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.5 }}
                            >
                                <AnimatePresence>
                                    {titleVisible && (
                                        <motion.div
                                            className={`planning-title ${isNormalMode ? 'blue-outline' : ''}`}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ duration: 1.5 }}
                                            onClick={handleTitleClick}
                                        >
                                            Smart War Drones
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}

                {showStartDialog && (
                    <StartDialog 
                        onClose={() => setShowStartDialog(false)} 
                        onStartAnimation={handleStartAnimation} 
                        dronePositions={dronePositions}
                    />
                )}
            </div>
        </DroneProvider>
    );
}

export default App;
