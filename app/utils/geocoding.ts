import axios from 'axios';

/**
 * Converts an address string to coordinates using the Nominatim OpenStreetMap API.
 * @param {string} address - The address to geocode.
 * @returns {Promise<{ lat: number; lon: number }>} - The latitude and longitude of the address.
 */
export const geocodeAddress = async (address: string): Promise<{ lat: number; lon: number }> => {
    const apiUrl = 'https://nominatim.openstreetmap.org/search';
    const params = {
        q: address,
        format: 'json',
        addressdetails: 1,
    };

    try {
        const response = await axios.get(apiUrl, { params });
        const location = response.data[0];
        if (!location) {
            throw new Error('Address not found');
        }
        return {
            lat: parseFloat(location.lat),
            lon: parseFloat(location.lon),
        };
    } catch (error) {
        throw new Error(`Geocoding failed: ${error.message}`);
    }
};
