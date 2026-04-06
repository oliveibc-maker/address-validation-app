import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const AddressMap = ({ address }) => {
    const [position, setPosition] = useState(null);

    useEffect(() => {
        if (address) {
            // Use a geocoding service to get the coordinates based on the address.
            fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`)
                .then(response => response.json())
                .then(data => {
                    if (data.length > 0) {
                        const { lat, lon } = data[0];
                        setPosition([lat, lon]);
                    }
                });
        }
    }, [address]);

    return (
        <MapContainer center={position || [51.505, -0.09]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
            />
            {position && (
                <Marker position={position}>
                    <Popup>{address}</Popup>
                </Marker>
            )}
        </MapContainer>
    );
};

export default AddressMap;