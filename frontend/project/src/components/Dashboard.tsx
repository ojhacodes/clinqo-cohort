import React, { useEffect, useState } from 'react';
import { fetcher } from '../utils/api';

interface HealthResponse {
  status: string;
  ai_system: string;
  database: string;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetcher<HealthResponse>('/health')
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch');
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow text-gray-800">
      <h2 className="text-2xl font-bold mb-4">Backend Health Check</h2>
      {loading && <div className="text-blue-500">Loading...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}
      {data && !loading && !error && (
        <div className="space-y-2">
          <div><span className="font-semibold">Status:</span> {data.status}</div>
          <div><span className="font-semibold">AI System:</span> {data.ai_system}</div>
          <div><span className="font-semibold">Database:</span> {data.database}</div>
          <div><span className="font-semibold">Timestamp:</span> <span className="text-xs">{data.timestamp}</span></div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 
