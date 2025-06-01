'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import BivariateTable from '../components/BivariateTable';

interface AnalysisResult {
  id: string;
  type: 'bivariate' | 'feature' | 'species' | 'summary' | 'comparison';
  title: string;
  component: ReactNode;
  timestamp: string;
  query: string;
}

interface DashboardContextType {
  analysisResults: AnalysisResult[];
  addAnalysisResult: (result: Omit<AnalysisResult, 'id' | 'timestamp'>) => void;
  clearResults: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);

  const addAnalysisResult = (result: Omit<AnalysisResult, 'id' | 'timestamp'>) => {
    const newResult: AnalysisResult = {
      ...result,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setAnalysisResults(prev => [newResult, ...prev]);
  };

  const clearResults = () => {
    setAnalysisResults([]);
  };

  // Helper function to create bivariate analysis result
  const createBivariateResult = (query: string) => {
    addAnalysisResult({
      type: 'bivariate',
      title: 'Bivariate Correlation Matrix',
      component: <BivariateTable showOnMount={true} />,
      query
    });
  };

  // Helper function to create feature statistics result
  const createFeatureResult = (query: string, responseText: string) => {
    addAnalysisResult({
      type: 'feature',
      title: 'Feature Analysis',
      component: (
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
            {responseText}
          </pre>
        </div>
      ),
      query
    });
  };

  // Helper function to create species comparison result
  const createSpeciesResult = (query: string, responseText: string) => {
    addAnalysisResult({
      type: 'species',
      title: 'Species Analysis',
      component: (
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
            {responseText}
          </pre>
        </div>
      ),
      query
    });
  };

  // Helper function to create dataset summary result
  const createSummaryResult = (query: string, responseText: string) => {
    addAnalysisResult({
      type: 'summary',
      title: 'Dataset Summary',
      component: (
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
            {responseText}
          </pre>
        </div>
      ),
      query
    });
  };

  const value = {
    analysisResults,
    addAnalysisResult,
    clearResults,
    // Expose helper functions
    createBivariateResult,
    createFeatureResult,
    createSpeciesResult,
    createSummaryResult
  } as DashboardContextType & {
    createBivariateResult: (query: string) => void;
    createFeatureResult: (query: string, responseText: string) => void;
    createSpeciesResult: (query: string, responseText: string) => void;
    createSummaryResult: (query: string, responseText: string) => void;
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
