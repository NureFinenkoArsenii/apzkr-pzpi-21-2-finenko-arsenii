import React from 'react';

function DroneFormField({ label, value = '', onChange, disabled }) {
    return (
        <div>
            <label>{label}:</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required
                disabled={disabled}
            />
        </div>
    );
}

export default DroneFormField;