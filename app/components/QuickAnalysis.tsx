"use client";

import React from 'react';

interface QuickAnalysisProps {
  onAnalysisClick: (analysis: string) => void;
}

export const QuickAnalysis: React.FC<QuickAnalysisProps> = ({
  onAnalysisClick
}) => {
  const analyses = [
    {
      title: "📊 Statistical Summary",
      description: "Get comprehensive statistics for all features",
      query: "Show me detailed statistical summary for all numerical features including mean, median, std deviation, and percentiles"
    },
    {
      title: "🔗 Correlation Matrix", 
      description: "See relationships between all measurements",
      query: "Calculate correlation matrix for all numerical features and show strong correlations"
    },
    {
      title: "🌸 Species Comparison",
      description: "Compare all features across species",
      query: "Perform detailed species comparison showing mean, std deviation, and confidence intervals for all measurements"
    },
    {
      title: "📈 Feature Importance",
      description: "Which features best separate species",
      query: "Calculate feature importance to identify which measurements best distinguish between species"
    },
    {
      title: "🔍 Outlier Detection",
      description: "Find unusual flowers in the dataset",
      query: "Find outliers in sepal length using IQR method and show which flowers are unusual"
    },
    {
      title: "📐 Ratios & Relationships",
      description: "Calculate derived measurements",
      query: "Calculate the ratio of petal length to sepal length for each flower and analyze by species"
    }
  ];

  return (
    <div className="w-full p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
        ⚡ Quick Analysis Templates
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {analyses.map((analysis, index) => (
          <button
            key={index}
            onClick={() => onAnalysisClick(analysis.query)}
            className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all text-left group"
          >
            <div className="font-semibold text-gray-800 text-sm mb-2 group-hover:text-purple-600">
              {analysis.title}
            </div>
            <div className="text-xs text-gray-600 mb-2">
              {analysis.description}
            </div>
            <div className="text-xs text-purple-600 font-medium">
              Click to run →
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          💡 These templates showcase advanced analysis capabilities
        </p>
      </div>
    </div>
  );
};
