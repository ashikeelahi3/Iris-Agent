'use client';

import { useEffect, useState } from 'react';
import { IrisData, Statistics, loadIrisData, calculateStatistics, getFeatureData, countBySpecies } from '../utils/data';

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

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [speciesCount, setSpeciesCount] = useState<Record<string, number>>({});
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await loadIrisData();
        
        // Calculate statistics for each feature
        const features = ['SepalLengthCm', 'SepalWidthCm', 'PetalLengthCm', 'PetalWidthCm'] as const;
        const stats = features.map(feature => {
          const featureData = getFeatureData(data, feature);
          const statistics = calculateStatistics(featureData);
          return {
            label: feature.replace('Cm', ''),
            value: statistics.mean.toFixed(2) + ' cm',
            subLabel: `σ: ${statistics.stdDev.toFixed(2)}`
          };
        });

        // Count species distribution
        const counts = countBySpecies(data);
        
        // Create activity log
        const activity = features.map((feature, index) => ({
          id: index + 1,
          feature: feature.replace('Cm', ''),
          stats: `Mean: ${stats[index].value}, StdDev: ${stats[index].value.replace(' cm', '')}`,
          timestamp: new Date().toLocaleTimeString()
        }));

        setMetrics(stats);
        setSpeciesCount(counts);
        setRecentActivity(activity);
      } catch (error) {
        console.error('Error loading Iris data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Iris Dataset Analytics</h1>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Feature Statistics</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{activity.feature}</p>
                  <p className="text-sm text-gray-600">{activity.stats}</p>
                </div>
                <span className="text-sm text-gray-500">{activity.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Species Distribution</h2>
          <div className="space-y-4">
            {Object.entries(speciesCount).map(([species, count], index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-600">{species.replace('Iris-', '')}</span>
                <div className="w-2/3">
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div

                      className="h-2 bg-blue-600 rounded-full"
                      style={{ width: `${(count / Object.values(speciesCount).reduce((a, b) => a + b, 0)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-gray-900 font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}