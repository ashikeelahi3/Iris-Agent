'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { IrisData, Statistics, loadIrisData, calculateStatistics, getFeatureData, countBySpecies } from '../utils/data';
import { DataVisualization } from './DataVisualization';

interface Metric {
  label: string;
  value: string;
  subLabel: string;
}

interface Activity {
  id: number;
  feature: string;
  stats: string;
  timestamp: string;
}

interface CorrelationData {
  feature1: string;  feature2: string;
  correlation: number;
}

// Helper function to calculate correlation between two arrays
function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const meanX = x.reduce((a, b) => a + b) / n;
  const meanY = y.reduce((a, b) => a + b) / n;
  
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }
  
  return numerator / Math.sqrt(denomX * denomY);
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [speciesCount, setSpeciesCount] = useState<Record<string, number>>({});
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [irisData, setIrisData] = useState<IrisData[]>([]);
  const [correlationData, setCorrelationData] = useState<CorrelationData[]>([]);  const [selectedVisualization, setSelectedVisualization] = useState<'scatter' | 'bar' | 'pie' | 'histogram'>('scatter');
  const [selectedFeatures, setSelectedFeatures] = useState({ x: 'SepalLengthCm', y: 'PetalLengthCm' });
  const [loading, setLoading] = useState(true);

  // Memoized calculations for performance
  const featureStats = useMemo(() => {
    if (!irisData.length) return [];
    
    const features = ['SepalLengthCm', 'SepalWidthCm', 'PetalLengthCm', 'PetalWidthCm'] as const;
    return features.map(feature => {
      const featureData = getFeatureData(irisData, feature);
      const statistics = calculateStatistics(featureData);
      return {
        label: feature.replace('Cm', ''),
        value: statistics.mean.toFixed(2) + ' cm',
        subLabel: `σ: ${statistics.stdDev.toFixed(2)}`,
        feature,
        statistics
      };
    });
  }, [irisData]);

  const correlationMatrix = useMemo(() => {
    if (!irisData.length) return [];
    
    const features = ['SepalLengthCm', 'SepalWidthCm', 'PetalLengthCm', 'PetalWidthCm'] as const;
    const correlations: CorrelationData[] = [];
    
    for (let i = 0; i < features.length; i++) {
      for (let j = i + 1; j < features.length; j++) {
        const feature1Data = getFeatureData(irisData, features[i]);
        const feature2Data = getFeatureData(irisData, features[j]);
        const correlation = calculateCorrelation(feature1Data, feature2Data);
        correlations.push({
          feature1: features[i].replace('Cm', ''),
          feature2: features[j].replace('Cm', ''),
          correlation: correlation
        });
      }
    }
    return correlations;
  }, [irisData]);

  // Export functionality
  const exportToCSV = useCallback((data: any[], filename: string) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(data[0]).join(",") + "\n"
      + data.map(row => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const exportCorrelationData = useCallback(() => {
    exportToCSV(correlationMatrix, 'iris-correlation-matrix');
  }, [correlationMatrix, exportToCSV]);
  const exportStatsData = useCallback(() => {
    const statsData = featureStats.map(stat => ({
      Feature: stat.label,
      Mean: stat.statistics.mean.toFixed(3),
      StandardDeviation: stat.statistics.stdDev.toFixed(3),
      Min: Math.min(...getFeatureData(irisData, stat.feature)).toFixed(3),
      Max: Math.max(...getFeatureData(irisData, stat.feature)).toFixed(3)
    }));
    exportToCSV(statsData, 'iris-feature-statistics');
  }, [featureStats, exportToCSV, irisData]);  useEffect(() => {
    async function fetchData() {
      try {
        const data = await loadIrisData();
        setIrisData(data);
        
        // Count species distribution
        const counts = countBySpecies(data);
        setSpeciesCount(counts);
        
        // Create activity log
        const activity = ['SepalLengthCm', 'SepalWidthCm', 'PetalLengthCm', 'PetalWidthCm'].map((feature, index) => ({
          id: index + 1,
          feature: feature.replace('Cm', ''),
          stats: `Analysis updated`,
          timestamp: new Date().toLocaleTimeString()
        }));
        setRecentActivity(activity);
      } catch (error) {
        console.error('Error loading Iris data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Update metrics and correlation data when iris data changes
  useEffect(() => {
    setMetrics(featureStats);
    setCorrelationData(correlationMatrix);
  }, [featureStats, correlationMatrix]);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-lg text-gray-600">Loading Iris dataset...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">      {/* Header with Export and Visualization Controls */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Iris Dataset Analytics Dashboard</h1>        
        <div className="flex gap-2">
          <button
            onClick={exportStatsData}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            title="Export feature statistics"
          >
            Export Stats
          </button>
          <button
            onClick={exportCorrelationData}
            className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            title="Export correlation matrix"
          >
            Export Correlations
          </button>
          <label htmlFor="visualization-type" className="sr-only">Visualization Type</label>
          <select 
            id="visualization-type"
            value={selectedVisualization} 
            onChange={(e) => setSelectedVisualization(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            title="Select visualization type"
          >
            <option value="scatter">Scatter Plot</option>
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="histogram">Histogram</option>
          </select>
        </div>
      </div>

      {/* Dataset Overview Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-blue-600 font-medium">Total Records</p>
            <p className="text-2xl font-bold text-blue-900">{irisData.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-blue-600 font-medium">Species Count</p>
            <p className="text-2xl font-bold text-blue-900">{Object.keys(speciesCount).length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-blue-600 font-medium">Features</p>
            <p className="text-2xl font-bold text-blue-900">4</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-blue-600 font-medium">Data Quality</p>
            <p className="text-2xl font-bold text-green-600">100%</p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-600">{metric.label}</p>
              <p className="text-2xl font-semibold text-gray-900 mt-2">{metric.value}</p>
              <p className="text-sm text-gray-500 mt-1">{metric.subLabel}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Visualization Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Data Visualization</h2>
            {(selectedVisualization === 'scatter' || selectedVisualization === 'histogram') && (
              <div className="flex gap-2 text-sm">
                {selectedVisualization === 'scatter' && (
                  <>
                    <label htmlFor="x-feature" className="sr-only">X-axis Feature</label>
                    <select 
                      id="x-feature"
                      value={selectedFeatures.x} 
                      onChange={(e) => setSelectedFeatures(prev => ({...prev, x: e.target.value}))}
                      className="px-2 py-1 border border-gray-300 rounded"
                      title="Select X-axis feature"
                    >
                      <option value="SepalLengthCm">Sepal Length</option>
                      <option value="SepalWidthCm">Sepal Width</option>
                      <option value="PetalLengthCm">Petal Length</option>
                      <option value="PetalWidthCm">Petal Width</option>
                    </select>
                    <span className="self-center">vs</span>
                    <label htmlFor="y-feature" className="sr-only">Y-axis Feature</label>
                    <select 
                      id="y-feature"
                      value={selectedFeatures.y} 
                      onChange={(e) => setSelectedFeatures(prev => ({...prev, y: e.target.value}))}
                      className="px-2 py-1 border border-gray-300 rounded"
                      title="Select Y-axis feature"
                    >
                      <option value="SepalLengthCm">Sepal Length</option>
                      <option value="SepalWidthCm">Sepal Width</option>
                      <option value="PetalLengthCm">Petal Length</option>
                      <option value="PetalWidthCm">Petal Width</option>
                    </select>
                  </>
                )}
                {selectedVisualization === 'histogram' && (
                  <>
                    <label htmlFor="histogram-feature" className="sr-only">Feature for Histogram</label>
                    <select 
                      id="histogram-feature"
                      value={selectedFeatures.x} 
                      onChange={(e) => setSelectedFeatures(prev => ({...prev, x: e.target.value}))}
                      className="px-2 py-1 border border-gray-300 rounded"
                      title="Select feature for histogram"
                    >
                      <option value="SepalLengthCm">Sepal Length</option>
                      <option value="SepalWidthCm">Sepal Width</option>
                      <option value="PetalLengthCm">Petal Length</option>
                      <option value="PetalWidthCm">Petal Width</option>
                    </select>
                    <span className="self-center text-gray-600">Distribution</span>
                  </>
                )}
              </div>
            )}
          </div>
            <DataVisualization
            data={irisData}
            type={selectedVisualization}
            xColumn={selectedVisualization === 'scatter' ? selectedFeatures.x as keyof IrisData : 
                     selectedVisualization === 'histogram' ? selectedFeatures.x as keyof IrisData : 'Species'}
            yColumn={selectedVisualization === 'scatter' ? selectedFeatures.y as keyof IrisData : undefined}
            groupBy={selectedVisualization === 'scatter' ? 'Species' : undefined}
            title={selectedVisualization === 'pie' ? 'Species Distribution' : 
                   selectedVisualization === 'scatter' ? `${selectedFeatures.x.replace('Cm', '')} vs ${selectedFeatures.y.replace('Cm', '')}` :
                   selectedVisualization === 'histogram' ? `${selectedFeatures.x.replace('Cm', '')} Distribution` :
                   'Feature Distribution'}
          />
        </div>

        {/* Correlation Matrix */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Correlation Matrix</h2>
          <div className="space-y-3">
            {correlationData.map((corr, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <span className="text-sm text-gray-600">{corr.feature1} ↔ {corr.feature2}</span>
                </div>                <div className="flex items-center gap-3">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full rounded-full absolute left-0 top-0 transition-all duration-300 ${
                        Math.abs(corr.correlation) > 0.8 ? 'bg-red-500 w-full' :
                        Math.abs(corr.correlation) > 0.7 ? 'bg-red-500 w-4/5' :
                        Math.abs(corr.correlation) > 0.6 ? 'bg-yellow-500 w-3/4' :
                        Math.abs(corr.correlation) > 0.5 ? 'bg-yellow-500 w-2/3' :
                        Math.abs(corr.correlation) > 0.4 ? 'bg-green-500 w-1/2' :
                        Math.abs(corr.correlation) > 0.3 ? 'bg-green-500 w-2/5' :
                        Math.abs(corr.correlation) > 0.2 ? 'bg-green-500 w-1/3' :
                        'bg-green-500 w-1/4'
                      }`}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 min-w-[3rem] text-right">
                    {corr.correlation.toFixed(3)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Species Statistics Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Species Statistics</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-600 font-medium">Species</th>
                  <th className="text-right py-2 text-gray-600 font-medium">Count</th>
                  <th className="text-right py-2 text-gray-600 font-medium">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(speciesCount).map(([species, count]) => {
                  const total = Object.values(speciesCount).reduce((a, b) => a + b, 0);
                  const percentage = ((count / total) * 100).toFixed(1);
                  return (
                    <tr key={species} className="border-b border-gray-100">
                      <td className="py-3 text-gray-900">{species.replace('Iris-', '')}</td>
                      <td className="py-3 text-right text-gray-900 font-medium">{count}</td>
                      <td className="py-3 text-right text-gray-600">{percentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feature Statistics Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Feature Statistics</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-600 font-medium">Feature</th>
                  <th className="text-right py-2 text-gray-600 font-medium">Mean</th>
                  <th className="text-right py-2 text-gray-600 font-medium">Std Dev</th>
                  <th className="text-right py-2 text-gray-600 font-medium">Range</th>
                </tr>
              </thead>
              <tbody>                {['SepalLengthCm', 'SepalWidthCm', 'PetalLengthCm', 'PetalWidthCm'].map((feature) => {
                  const featureData = getFeatureData(irisData, feature as keyof Omit<IrisData, 'Id' | 'Species'>);
                  const stats = calculateStatistics(featureData);
                  const min = Math.min(...featureData);
                  const max = Math.max(...featureData);
                  return (
                    <tr key={feature} className="border-b border-gray-100">
                      <td className="py-3 text-gray-900">{feature.replace('Cm', '')}</td>
                      <td className="py-3 text-right text-gray-900 font-medium">{stats.mean.toFixed(2)}</td>
                      <td className="py-3 text-right text-gray-600">{stats.stdDev.toFixed(2)}</td>
                      <td className="py-3 text-right text-gray-600">{min.toFixed(1)} - {max.toFixed(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sample Data Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sample Data (First 10 Records)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-600 font-medium">ID</th>
                <th className="text-right py-2 text-gray-600 font-medium">Sepal Length</th>
                <th className="text-right py-2 text-gray-600 font-medium">Sepal Width</th>
                <th className="text-right py-2 text-gray-600 font-medium">Petal Length</th>
                <th className="text-right py-2 text-gray-600 font-medium">Petal Width</th>
                <th className="text-left py-2 text-gray-600 font-medium">Species</th>
              </tr>
            </thead>
            <tbody>
              {irisData.slice(0, 10).map((row) => (
                <tr key={row.Id} className="border-b border-gray-100">
                  <td className="py-3 text-gray-900">{row.Id}</td>
                  <td className="py-3 text-right text-gray-900">{row.SepalLengthCm}</td>
                  <td className="py-3 text-right text-gray-900">{row.SepalWidthCm}</td>
                  <td className="py-3 text-right text-gray-900">{row.PetalLengthCm}</td>
                  <td className="py-3 text-right text-gray-900">{row.PetalWidthCm}</td>
                  <td className="py-3 text-gray-900">{row.Species.replace('Iris-', '')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}