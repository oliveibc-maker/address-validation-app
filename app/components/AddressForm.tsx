import React, { useState } from 'react';

const AddressForm = () => {
    const [address, setAddress] = useState('');
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!address) {
            setError('Please enter an address.');
            return;
        }
        setError('');
        try {
            const response = await fetch(`https://api.geocoding.example.com/search?address=${encodeURIComponent(address)}`);
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError('Error fetching address data.');
        }
    };

    return (
        <div>
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter address"
                />
                <button type="submit">Search</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
        </div>
    );
};

export default AddressForm;
