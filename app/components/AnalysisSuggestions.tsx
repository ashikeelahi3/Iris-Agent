"use client";

import React from 'react';

interface AnalysisSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

export const AnalysisSuggestions: React.FC<AnalysisSuggestionsProps> = ({
  onSuggestionClick
}) => {
  const suggestions = [
    {
      category: "📊 Statistical Analysis",
      queries: [
        "Calculate correlation matrix for all numerical features",
        "Compare mean and standard deviation across species",
        "Find outliers in sepal length using IQR method",
        "Perform a detailed descriptive analysis by species"
      ]
    },
    {
      category: "📈 Data Visualization",
      queries: [
        "Create a scatter plot of sepal length vs petal length by species",
        "Show distribution of petal width across species",
        "Generate a correlation heatmap",
        "Create box plots for all measurements by species"
      ]
    },
    {
      category: "🔍 Data Exploration",
      queries: [
        "What percentage of flowers have petal length > 4cm?",
        "Find the top 10 flowers with largest sepal area",
        "Group flowers by petal length ranges",
        "Show summary statistics for virginica species only"
      ]
    },
    {
      category: "🧮 Advanced Analysis",
      queries: [
        "Calculate the ratio of petal length to sepal length",
        "Find flowers that are closest to the species averages",
        "Identify which features best separate the species",
        "Calculate confidence intervals for species means"
      ]
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
        🚀 Try These Advanced Analysis Ideas
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((category, categoryIndex) => (
          <div key={categoryIndex} className="bg-white rounded-lg p-4 shadow-sm border">
            <h4 className="font-semibold text-gray-700 mb-3 text-sm">
              {category.category}
            </h4>
            <div className="space-y-2">
              {category.queries.map((query, queryIndex) => (
                <button
                  key={queryIndex}
                  onClick={() => onSuggestionClick(query)}
                  className="w-full text-left p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors border border-transparent hover:border-blue-200"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          💡 Click any suggestion above to run the analysis instantly
        </p>
      </div>
    </div>
  );
};
