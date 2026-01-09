"use client";

import { useState } from 'react';

interface SimulationFormProps {
  models: { id: string; display_name: string }[];
}

interface SimulationResult {
  runId: string;
  finalScore: number;
  totalRevenue: number;
  totalProfit: number;
  totalStockouts: number;
}

export function SimulationForm({ models }: SimulationFormProps) {
  const [modelId, setModelId] = useState('');
  const [seed, setSeed] = useState('');
  const [horizonDays, setHorizonDays] = useState('30');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRunning(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId,
          seed: seed ? parseInt(seed) : undefined,
          horizonDays: parseInt(horizonDays),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Simulation failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsRunning(false);
    }
  };

  const formatPeso = (value: number) => {
    return '₱' + value.toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Run Simulation</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            AI Model
          </label>
          <select
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
          >
            <option value="">Select a model</option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.display_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seed (optional)
          </label>
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="Random if empty"
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Simulation Days
          </label>
          <select
            value={horizonDays}
            onChange={(e) => setHorizonDays(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
          >
            <option value="5">5 days (quick test)</option>
            <option value="10">10 days</option>
            <option value="30">30 days (standard)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isRunning || !modelId}
          className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
        >
          {isRunning ? 'Running Simulation...' : 'Start Simulation'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="font-bold text-green-800 mb-2">Simulation Complete!</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-600">Final Score:</div>
            <div className="font-medium text-gray-900">{formatPeso(result.finalScore)}</div>
            <div className="text-gray-600">Total Revenue:</div>
            <div className="font-medium text-gray-900">{formatPeso(result.totalRevenue)}</div>
            <div className="text-gray-600">Total Profit:</div>
            <div className="font-medium text-gray-900">{formatPeso(result.totalProfit)}</div>
            <div className="text-gray-600">Stockouts:</div>
            <div className="font-medium text-gray-900">{result.totalStockouts.toLocaleString()}</div>
          </div>
          
          <a href={"/runs/" + result.runId}
            className="mt-3 inline-block text-orange-600 hover:text-orange-700 font-medium"
          >
            View Details
          </a>
        </div>
      )}
    </div>
  );
}
