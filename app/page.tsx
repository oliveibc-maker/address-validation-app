'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import dynamic from 'next/dynamic';

const AddressMap = dynamic(() => import('./AddressMap'), { ssr: false });

export default function Home() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvResults, setCsvResults] = useState([]);
  const [activeTab, setActiveTab] = useState('single');

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
        const resultData = {
          address,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          displayName: item.display_name,
        };
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

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
      },
      error: (error) => {
        setError('Erro ao processar CSV: ' + error.message);
      },
    });
  };

  const handleProcessCSV = async () => {
    if (csvData.length === 0) {
      setError('Nenhum dado CSV carregado');
      return;
    }

    setCsvLoading(true);
    const results = [];

    for (const row of csvData) {
      const addressStr = Object.values(row).join(' ').trim();
      if (!addressStr) continue;

      try {
        const response = await fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(addressStr));
        const data = await response.json();

        if (data && data.length > 0) {
          const item = data[0];
          results.push({
            ...row,
            endereço_original: addressStr,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            local: item.display_name,
            status: 'Encontrado',
          });
        } else {
          results.push({
            ...row,
            endereço_original: addressStr,
            status: 'Não encontrado',
          });
        }
      } catch (err) {
        results.push({
          ...row,
          endereço_original: addressStr,
          status: 'Erro',
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setCsvResults(results);
    setCsvLoading(false);
  };

  const downloadCSV = () => {
    const csv = Papa.unparse(csvResults);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'addresses_validated.csv');
    link.click();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Address Validation App</h1>
          <p className="text-gray-600">Validação de moradas com OpenStreetMap</p>
        </div>

        <div className="flex gap-4 mb-6">
          <button onClick={() => setActiveTab('single')} className={`px-6 py-2 rounded-lg font-semibold transition ${activeTab === 'single' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 hover:bg-gray-100'}`}>Busca Simples</button>
          <button onClick={() => setActiveTab('batch')} className={`px-6 py-2 rounded-lg font-semibold transition ${activeTab === 'batch' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 hover:bg-gray-100'}`}>Upload CSV</button>
        </div>

        {activeTab === 'single' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
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

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-lg h-96">
                <h2 className="text-xl font-semibold mb-4">Mapa</h2>
                {result ? <AddressMap address={result} /> : <p className="text-gray-500">Busque uma morada para ver no mapa</p>}
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Histórico ({history.length})</h2>
                {history.length === 0 ? (<p className="text-gray-500 text-sm">Nenhuma morada buscada</p>) : (
                  <ul className="space-y-2 max-h-64 overflow-y-auto">
                    {history.map((item, idx) => (
                      <li key={idx} className="p-2 bg-gray-100 rounded text-xs cursor-pointer hover:bg-blue-100" onClick={() => setResult(item)}>
                        <p className="font-medium truncate">{item.address}</p>
                        <p className="text-gray-600">Lat: {item.latitude.toFixed(4)}, Lon: {item.longitude.toFixed(4)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'batch' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Upload CSV</h2>
              <div className="space-y-4">
                <input type="file" accept=".csv" onChange={handleCSVUpload} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                <p className="text-sm text-gray-600">O CSV pode ter qualquer coluna com endereços</p>
                <button onClick={handleProcessCSV} disabled={csvLoading || csvData.length === 0} className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400">{csvLoading ? 'Processando...' : `Processar ${csvData.length} endereços`}</button>
              </div>
            </div>

            {csvResults.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Resultados ({csvResults.length})</h2>
                  <button onClick={downloadCSV} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">📥 Download CSV</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">Endereço Original</th>
                        <th className="px-4 py-2 text-left">Latitude</th>
                        <th className="px-4 py-2 text-left">Longitude</th>
                        <th className="px-4 py-2 text-left">Local</th>
                        <th className="px-4 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvResults.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 truncate">{item.endereço_original}</td>
                          <td className="px-4 py-2">{item.latitude ? item.latitude.toFixed(6) : '-'}</td>
                          <td className="px-4 py-2">{item.longitude ? item.longitude.toFixed(6) : '-'}</td>
                          <td className="px-4 py-2 truncate text-xs">{item.local || '-'}</td>
                          <td className="px-4 py-2"><span className={`px-2 py-1 rounded text-xs font-semibold ${item.status === 'Encontrado' ? 'bg-green-200 text-green-800' : item.status === 'Não encontrado' ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'}`}>{item.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
