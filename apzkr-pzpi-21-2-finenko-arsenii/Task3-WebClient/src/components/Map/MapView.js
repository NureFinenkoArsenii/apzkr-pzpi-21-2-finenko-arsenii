import React, { useContext, useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, FeatureGroup, useMapEvents } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { DroneContext } from '../Drone/DroneContext';
import MapWrapper from './MapWrapper';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import '../../styles/Map/MapView.scss';
import dropPointIcon from '../../media/drop-point.png';
import attackIcon from '../../media/attackdrone.png';
import transportIcon from '../../media/transportdrone.png';
import scoutIcon from '../../media/scout-drone.png';
import defaultIcon from '../../media/anothertype.png';

function MapView({ focusOnUkraine, drawingMode, dropPointActive, dropPointPosition, setDropPointPosition, onDropPointSet, selectedDrone, onDronePlaced, showMarkers, dronePositions, setDronePositions, setFocusOnUkraine }) {
    const { t } = useTranslation(); // Ініціалізація перекладу
    const { mapState, saveMapState } = useContext(DroneContext);
    const mapRef = useRef(null);
    const featureGroupRef = useRef(new L.FeatureGroup());

    const [tileLayer, setTileLayer] = useState(
        localStorage.getItem('selectedTileLayer') || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    );
    const [isMapSelectorOpen, setIsMapSelectorOpen] = useState(false);
    const [isCursorPointer, setIsCursorPointer] = useState(false);

    const tileLayers = {
        OpenStreetMap: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        Stadia: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
        CartoDBVoyager: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        MapboxDark: 'https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoibm93YW1hcnMiLCJhIjoiY2x6emprdjdsMWUydDJrc2I3MDA1YzRybCJ9.BVai6DspgQwJSp0inh19Ow',
        MapboxSatellite: 'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoibm93YW1hcnMiLCJhIjoiY2x6emprdjdsMWUydDJrc2I3MDA1YzRybCJ9.BVai6DspgQwJSp0inh19Ow',
        MapboxTraffic: 'https://api.mapbox.com/styles/v1/mapbox/traffic-day-v2/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoibm93YW1hcnMiLCJhIjoiY2x6emprdjdsMWUydDJrc2I3MDA1YzRybCJ9.BVai6DspgQwJSp0inh19Ow'
    };

    const handleTileLayerChange = (newTileLayer) => {
        setTileLayer(newTileLayer);
        localStorage.setItem('selectedTileLayer', newTileLayer);
    };

    useEffect(() => {
        if (focusOnUkraine && mapRef.current) {
            const map = mapRef.current;
            map.setView([48.3794, 31.1656], 6); // Координати центру України з масштабом
            setFocusOnUkraine(false); // Скидаємо стан після виконання
        }
    }, [focusOnUkraine, setFocusOnUkraine]);

    const DropPointMarker = () => {
        useMapEvents({
            click(e) {
                if (dropPointActive) {
                    const { lat, lng } = e.latlng;
                    setDropPointPosition([lat, lng]);
                    onDropPointSet([lat, lng]);
                    setIsCursorPointer(false);
                }
            },
            mousemove(e) {
                if (dropPointActive) {
                    setIsCursorPointer(true);
                    if (mapRef.current) {
                        const mapContainer = mapRef.current.getContainer();
                        mapContainer.style.cursor = `url(${dropPointIcon}), auto`;
                    }
                }
            }
        });

        return dropPointPosition ? (
            <Marker position={dropPointPosition} icon={new L.Icon({
                iconUrl: dropPointIcon,
                iconSize: [88, 88],
                iconAnchor: [44, 44],
            })}>
                <Popup>{t('drop_point')}</Popup>
            </Marker>
        ) : null;
    };

    const getDroneIcon = (droneType) => {
        if (!droneType) {
            console.error('Drone type is undefined');
            return defaultIcon;
        }
    
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

    const DroneMarker = () => {
        useMapEvents({
            click(e) {
                if (selectedDrone && !dropPointActive) {
                    const { lat, lng } = e.latlng;
                    const newDronePosition = { position: [lat, lng], type: selectedDrone.droneType, name: selectedDrone.droneName };

                    setDronePositions(prevPositions => ({
                        ...prevPositions,
                        [selectedDrone.id]: newDronePosition
                    }));

                    onDronePlaced(newDronePosition);
                }
            }
        });

        return (
            <>
                {showMarkers && Object.entries(dronePositions).map(([droneId, drone]) => (
                    <Marker
                        key={droneId}
                        position={drone.position}
                        icon={new L.Icon({
                            iconUrl: getDroneIcon(drone.type),
                            iconSize: [48, 48],
                            iconAnchor: [24, 24],
                        })}
                    >
                        <Popup>{drone.name}</Popup>
                    </Marker>
                ))}
            </>
        );
    };

    return (
        <div className={`map-container ${drawingMode ? 'drawing-mode' : ''}`}>
            <MapContainer
                center={mapState.center}
                zoom={mapState.zoom}
                style={{ height: '100vh', width: '100%' }}
                ref={mapRef}
                className={isCursorPointer ? 'cursor-drop-point' : ''}
            >
                <TileLayer
                    url={tileLayer}
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <DropPointMarker />
                <DroneMarker />
                <MapWrapper mapState={mapState} saveMapState={saveMapState} />
                <FeatureGroup ref={featureGroupRef}>
                    <EditControl
                        position="topleft"
                        onCreated={(e) => {
                            const layer = e.layer;
                            featureGroupRef.current.addLayer(layer);
                        }}
                        draw={{
                            rectangle: false,
                            polygon: false,
                            circle: false,
                            circlemarker: false,
                            marker: false,
                            polyline: {
                                shapeOptions: {
                                    color: '#3388ff',
                                    weight: 4,
                                    opacity: 1.0
                                }
                            },
                        }}
                        edit={{
                            featureGroup: featureGroupRef.current,
                            edit: false,
                            remove: false,
                        }}
                    />
                </FeatureGroup>
            </MapContainer>
            {!drawingMode && (
                <div className={`map-style-selector ${isMapSelectorOpen ? 'open' : ''}`}>
                    <h3 onClick={() => setIsMapSelectorOpen(!isMapSelectorOpen)}>{t('maps')}</h3>
                    {isMapSelectorOpen && (
                        <div className="map-options">
                            {Object.keys(tileLayers).map((layerName) => (
                                <button
                                    key={layerName}
                                    onClick={() => handleTileLayerChange(tileLayers[layerName])}
                                >
                                    {t(`map_layers.${layerName.toLowerCase()}`)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default MapView;