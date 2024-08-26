import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../../styles/Drone/AddDroneDialog.scss';
import ErrorDialog from './ErrorDialog';

function AddDroneDialog({ onClose, onAddDrone }) {
    const { t } = useTranslation(); // Ініціалізація перекладу
    const [droneName, setDroneName] = useState('');
    const [droneType, setDroneType] = useState('');
    const [safetyCode, setSafetyCode] = useState('');
    const [error, setError] = useState(null);
    const [warning, setWarning] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [allTypes, setAllTypes] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const suggestionsRef = useRef(null);
    const dialogRef = useRef(null);

    useEffect(() => {
        const fetchDroneTypes = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/Drone/getAll');
                const types = [...new Set(response.data.map(drone => drone.droneType))];
                setAllTypes(types);
            } catch (error) {
                console.error(t('fetch_drone_types_error'), error);
            }
        };

        fetchDroneTypes();
    }, [t]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dialogRef.current && 
                !dialogRef.current.contains(e.target) && 
                (!suggestionsRef.current || !suggestionsRef.current.contains(e.target)) && 
                !error
            ) {
                onClose();
            }
        };
    
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose, error]);

    const handleSuggestionClick = (suggestion, event) => {
        if (event) {
            event.stopPropagation();
        }
        setDroneType(suggestion);
        setSuggestions([]);
        setIsFocused(false);
    };

    const handleTypeChange = (e) => {
        const value = e.target.value;
        setDroneType(value);

        const filteredSuggestions = allTypes.filter(type => 
            type.toLowerCase().startsWith(value.toLowerCase())
        );

        setSuggestions(filteredSuggestions);
        setIsFocused(true);
        setSelectedIndex(-1);
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = (e) => {
        if (suggestionsRef.current && !suggestionsRef.current.contains(e.relatedTarget)) {
            setIsFocused(false);
        }
    };

    const handleKeyDown = (e) => {
        if (suggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prevIndex => 
                    prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    setDroneType(suggestions[selectedIndex]);
                    setSuggestions([]);
                    setIsFocused(false);
                }
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (safetyCode.length !== 13) {
            setError(t('safety_code_length_error'));
            return;
        }
    
        const newDrone = {
            droneName,
            droneType,
            safetyCode,
        };
    
        try {
            const response = await axios.post('http://localhost:5000/api/Drone/register', newDrone);
            if (response.status === 200) {
                onAddDrone(response.data);
                onClose();
            }
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.error === 'Drone already exists') {
                setError(t('drone_exists_error'));
            } else {
                console.error(t('register_drone_error'), error);
                setError(t('register_drone_fail'));
            }
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !error) {
            onClose();
        }
    };

    const closeErrorDialog = () => {
        setError(null);
    };

    const closeWarningDialog = () => {
        setWarning(null);
    };

    return (
        <>
            <div className="dialog-backdrop" onClick={handleBackdropClick}>
                <div className="dialog" ref={dialogRef}>
                    <h2>{t('add_new_drone')}</h2>
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
                                onChange={handleTypeChange}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                onKeyDown={handleKeyDown}
                                required
                            />
                            {isFocused && suggestions.length > 0 && (
                                <div className="suggestions" ref={suggestionsRef}>
                                    {suggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            onMouseDown={(event) => handleSuggestionClick(suggestion, event)}
                                            className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                                        >
                                            {suggestion}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="static-suggestions">
                                <div onClick={() => handleSuggestionClick('attack')}>{t('attack_drone')}</div>
                                <div onClick={() => handleSuggestionClick('transport')}>{t('transport_drone')}</div>
                                <div onClick={() => handleSuggestionClick('scout')}>{t('scout_drone')}</div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>{t('safety_code')}:</label>
                            <input
                                type="text"
                                value={safetyCode}
                                onChange={(e) => setSafetyCode(e.target.value)}
                                required
                                maxLength={13}
                            />
                        </div>
                        <div className="dialog-actions">
                            <button type="submit" className="add-button">{t('add_drone')}</button>
                            <button type="button" className="cancel-button" onClick={onClose}>{t('cancel')}</button>
                        </div>
                    </form>
                </div>
            </div>
            {error && (
                <ErrorDialog
                    message={error}
                    onClose={closeErrorDialog}
                />
            )}
            {warning && (
                <WarningDialog
                    message={warning}
                    onClose={closeWarningDialog}
                />
            )}
        </>
    );
}

export default AddDroneDialog;