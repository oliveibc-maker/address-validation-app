import React, { useEffect, useState } from 'react';

const AddressHistory: React.FC = () => {
    const [addresses, setAddresses] = useState<string[]>([]);

    useEffect(() => {
        const storedAddresses = localStorage.getItem('addressHistory');
        if (storedAddresses) {
            setAddresses(JSON.parse(storedAddresses));
        }
    }, []);

    const clearAddresses = () => {
        setAddresses([]);
        localStorage.removeItem('addressHistory');
    };

    const addAddress = (address: string) => {
        const newAddresses = [address, ...addresses].slice(0, 10);
        setAddresses(newAddresses);
        localStorage.setItem('addressHistory', JSON.stringify(newAddresses));
    };

    return (
        <div>
            <h2>Address History</h2>
            <ul>
                {addresses.map((address, index) => (
                    <li key={index}>{address}</li>
                ))}
            </ul>
            <button onClick={clearAddresses}>Clear History</button>
        </div>
    );
};

export default AddressHistory;