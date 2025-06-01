import { useState, useEffect } from 'react';
import { loadIrisData, IrisData, countBySpecies } from '../utils/data';

export interface DataStats {
  totalSamples: number;
  speciesCount: Record<string, number>;
  isLoading: boolean;
  error: string | null;
}

export function useIrisData(): DataStats {
  const [data, setData] = useState<IrisData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const irisData = await loadIrisData();
        setData(irisData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading Iris data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    totalSamples: data.length,
    speciesCount: data.length > 0 ? countBySpecies(data) : {},
    isLoading,
    error
  };
}
