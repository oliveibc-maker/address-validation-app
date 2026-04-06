'use client';

import { useState } from 'react';

export default function Home() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!address.trim()) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(address));
      const data = await response.json();
      if (data && data.length > 0) {
        const item = data[0];
        const resultData = { address, latitude: parseFloat(item.lat), longitude: parseFloat(item.lon), displayName: item.display_name };
        setResult(resultData);
        setHistory([resultData, ...history.slice(0, 9)]);
      } else {
        setError('Morada não encontrada');
      }
    } catch (err) {
      setError('Erro ao buscar morada');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Address Validation App</h1>
          <p className="text-gray-600">Encontre coordenadas com OpenStreetMap</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Buscar Morada</h2>
              <form onSubmit={handleSearch} className="space-y-4">
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Digite uma morada..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400">{loading ? 'Buscando...' : 'Buscar'}</button>
              </form>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
            {result && (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Resultado</h2>
                <div className="space-y-2">
                  <p className="text-sm"><span className="font-semibold">Endereço:</span> {result.address}</p>
                  <p className="text-sm"><span className="font-semibold">Latitude:</span> {result.latitude.toFixed(6)}</p>
                  <p className="text-sm"><span className="font-semibold">Longitude:</span> {result.longitude.toFixed(6)}</p>
                  <p className="text-sm text-gray-600"><span className="font-semibold">Local:</span> {result.displayName}</p>
                </div>
              </div>
            )}
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Histórico ({history.length})</h2>
            {history.length === 0 ? <p className="text-gray-500">Nenhuma morada buscada</p> : (
              <ul className="space-y-2 max-h-96 overflow-y-auto">
                {history.map((item, idx) => (
                  <li key={idx} className="p-3 bg-gray-100 rounded-lg text-sm cursor-pointer hover:bg-blue-100" onClick={() => setResult(item)}>
                    <p className="font-medium">{item.address}</p>
                    <p className="text-gray-600 text-xs">Lat: {item.latitude.toFixed(4)}, Lon: {item.longitude.toFixed(4)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
