'use client';

import { useState } from 'react';
import BivariateTable from './BivariateTable';

interface AnalysisResult {
  type: 'bivariate' | 'feature' | 'species' | 'summary';
  title: string;
  component: React.ReactNode;
  timestamp: string;
}

export default function Dashboard() {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Function to add analysis results (this could be called from parent or context)
  const addAnalysisResult = (result: AnalysisResult) => {
    setAnalysisResults(prev => [result, ...prev]);
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Iris Dataset Analytics</h1>
        <div className="text-sm text-gray-500">
          {analysisResults.length} analysis result{analysisResults.length !== 1 ? 's' : ''}
        </div>
      </div>

      {analysisResults.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Iris Analytics</h2>
            <p className="text-gray-600 mb-4">
              Start by asking questions about the iris dataset using the chat interface. 
              Your analysis results will appear here.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <h3 className="font-medium text-blue-900 mb-2">💡 Try asking:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• "Show me feature statistics for petal length"</li>
                <li>• "What correlations exist between features?"</li>
                <li>• "Compare sepal width across species"</li>
                <li>• "Give me a dataset summary"</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        // Analysis results
        <div className="space-y-6">
          {analysisResults.map((result, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">{result.title}</h3>
                  <span className="text-sm text-gray-500">{result.timestamp}</span>
                </div>
              </div>
              <div className="p-6">
                {result.component}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
