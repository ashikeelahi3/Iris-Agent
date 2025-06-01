import React, { useEffect, useState } from 'react';
import { loadIrisData, getFeatureData } from '../utils/data';

interface CorrelationData {
  feature1: string;
  feature2: string;
  correlation: number;
  strength: string;
}

// Helper function to calculate Pearson correlation coefficient
function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n !== y.length || n === 0) return 0;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
  const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
}

function getCorrelationStrength(corr: number): string {
  const abs = Math.abs(corr);
  if (abs >= 0.9) return 'Very Strong';
  if (abs >= 0.7) return 'Strong';
  if (abs >= 0.5) return 'Moderate';
  if (abs >= 0.3) return 'Weak';
  return 'Very Weak';
}

function getCorrelationColor(corr: number): string {
  const abs = Math.abs(corr);
  if (abs >= 0.7) return corr > 0 ? 'text-green-600' : 'text-red-600';
  if (abs >= 0.5) return corr > 0 ? 'text-green-500' : 'text-red-500';
  if (abs >= 0.3) return corr > 0 ? 'text-green-400' : 'text-red-400';
  return 'text-gray-500';
}

interface BivariateTableProps {
  showOnMount?: boolean;
}

export default function BivariateTable({ showOnMount = false }: BivariateTableProps) {
  const [correlationMatrix, setCorrelationMatrix] = useState<{ [key: string]: { [key: string]: number } }>({});
  const [loading, setLoading] = useState(showOnMount);
  const [error, setError] = useState<string | null>(null);
  const [shouldCalculate, setShouldCalculate] = useState(showOnMount);

  const features = ['SepalLengthCm', 'SepalWidthCm', 'PetalLengthCm', 'PetalWidthCm'];
  const featureLabels = ['Sepal Length', 'Sepal Width', 'Petal Length', 'Petal Width'];

  useEffect(() => {
    if (!shouldCalculate) return;
    
    async function calculateCorrelations() {
      try {
        setLoading(true);
        setError(null);
        
        const data = await loadIrisData();
        const matrix: { [key: string]: { [key: string]: number } } = {};
        
        for (const feature1 of features) {
          matrix[feature1] = {};
          for (const feature2 of features) {
            const data1 = getFeatureData(data, feature1 as any);
            const data2 = getFeatureData(data, feature2 as any);
            matrix[feature1][feature2] = calculateCorrelation(data1, data2);
          }
        }
        
        setCorrelationMatrix(matrix);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to calculate correlations');
        console.error('Error calculating correlations:', err);
      } finally {
        setLoading(false);
      }
    }    calculateCorrelations();
  }, [shouldCalculate]);

  // Function to trigger calculation manually
  const triggerCalculation = () => {
    setShouldCalculate(true);
  };

  if (!shouldCalculate && !showOnMount) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Bivariate Correlation Matrix</h3>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Click to calculate feature correlations</p>
          <button 
            onClick={triggerCalculation}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Calculate Correlations
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Bivariate Correlation Matrix</h3>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600">Calculating correlations...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Bivariate Correlation Matrix</h3>
        <div className="text-red-600 text-center py-8">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Bivariate Correlation Matrix</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-900">Feature</th>
              {featureLabels.map((label, index) => (
                <th key={index} className="text-center py-3 px-4 font-medium text-gray-900 min-w-[120px]">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature1, i) => (
              <tr key={feature1} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">
                  {featureLabels[i]}
                </td>
                {features.map((feature2, j) => {
                  const correlation = correlationMatrix[feature1]?.[feature2] || 0;
                  const isMainDiagonal = i === j;
                  
                  return (
                    <td key={feature2} className="text-center py-3 px-4">
                      <div className="flex flex-col items-center space-y-1">
                        <span 
                          className={`font-mono text-sm font-semibold ${
                            isMainDiagonal 
                              ? 'text-gray-900' 
                              : getCorrelationColor(correlation)
                          }`}
                        >
                          {correlation.toFixed(3)}
                        </span>
                        {!isMainDiagonal && (
                          <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
                            {getCorrelationStrength(correlation)}
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Correlation Strength:</h4>
          <ul className="space-y-1">
            <li>• <span className="font-medium">Very Strong:</span> |r| ≥ 0.9</li>
            <li>• <span className="font-medium">Strong:</span> |r| ≥ 0.7</li>
            <li>• <span className="font-medium">Moderate:</span> |r| ≥ 0.5</li>
            <li>• <span className="font-medium">Weak:</span> |r| ≥ 0.3</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Color Coding:</h4>
          <ul className="space-y-1">
            <li>• <span className="text-green-600 font-medium">Green:</span> Positive correlation</li>
            <li>• <span className="text-red-600 font-medium">Red:</span> Negative correlation</li>
            <li>• <span className="text-gray-500 font-medium">Gray:</span> Weak correlation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
