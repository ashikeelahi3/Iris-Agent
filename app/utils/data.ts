import Papa from 'papaparse';
import { mean, median, deviation } from 'd3-array';

export interface IrisData {
  Id: string;
  SepalLengthCm: number;
  SepalWidthCm: number;
  PetalLengthCm: number;
  PetalWidthCm: number;
  Species: string;
}

export interface Statistics {
  mean: number;
  median: number;
  stdDev: number;
}

export interface SpeciesStats extends Statistics {
  min: number;
  max: number;
  count: number;
}

export interface FeatureStatsBySpecies {
  [species: string]: SpeciesStats;
}

export async function loadIrisData(): Promise<IrisData[]> {
  // Handle both client-side and server-side contexts
  let url = '/data/Iris.csv';
  
  // For server-side API routes, we need to use the full URL or read from file system
  if (typeof window === 'undefined') {
    // Server-side: construct full URL or use file system
    const fs = await import('fs');
    const path = await import('path');
    
    try {
      const filePath = path.join(process.cwd(), 'public', 'data', 'Iris.csv');
      const csvText = fs.readFileSync(filePath, 'utf-8');
      
      return new Promise((resolve) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            resolve(results.data as IrisData[]);
          }
        });
      });
    } catch (error) {
      throw new Error(`Failed to load Iris data from file system: ${error}`);
    }
  }
  
  // Client-side: use fetch
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch Iris data: ${response.statusText}`);
  }
  const csvText = await response.text();
  
  return new Promise((resolve) => {
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        resolve(results.data as IrisData[]);
      }
    });
  });
}

export function calculateStatistics(data: number[]): Statistics {
  return {
    mean: mean(data) || 0,
    median: median(data) || 0,
    stdDev: deviation(data) || 0
  };
}

export function getFeatureData(data: IrisData[], feature: keyof Omit<IrisData, 'Id' | 'Species'>): number[] {
  return data.map(item => item[feature] as number);
}

export function countBySpecies(data: IrisData[]): Record<string, number> {
  return data.reduce((acc, item) => {
    acc[item.Species] = (acc[item.Species] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

export function extractFeatureFromQuery(query: string): string | null {
  const featureMap: Record<string, string> = {
    'sepal length': 'SepalLengthCm',
    'sepal width': 'SepalWidthCm',
    'petal length': 'PetalLengthCm',
    'petal width': 'PetalWidthCm'
  };
  
  const queryLower = query.toLowerCase();
  for (const [key, value] of Object.entries(featureMap)) {
    if (queryLower.includes(key)) {
      return value;
    }
  }
  return null;
}

export function getStatsBySpeciesForFeature(
  data: IrisData[],
  feature: keyof Omit<IrisData, 'Id' | 'Species'>
): FeatureStatsBySpecies {
  const speciesGroups = data.reduce((acc, item) => {
    if (!acc[item.Species]) {
      acc[item.Species] = [];
    }
    acc[item.Species].push(item[feature] as number);
    return acc;
  }, {} as Record<string, number[]>);

  const result: FeatureStatsBySpecies = {};
  
  for (const [species, values] of Object.entries(speciesGroups)) {
    const baseStats = calculateStatistics(values);
    result[species] = {
      ...baseStats,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    };
  }
  
  return result;
}

export function formatFeatureStatsResponse(
  feature: string,
  statsBySpecies: FeatureStatsBySpecies
): Record<string, any> {
  const formattedStats = Object.entries(statsBySpecies).map(([species, speciesStats]) => ({
    Species: species,
    Mean: speciesStats.mean.toFixed(2),
    Median: speciesStats.median.toFixed(2),
    'Standard Deviation': speciesStats.stdDev.toFixed(2),
    Min: speciesStats.min.toFixed(2),
    Max: speciesStats.max.toFixed(2),
    Count: speciesStats.count
  }));

  const insights = [];
  let highest = { species: '', value: -Infinity };
  let lowest = { species: '', value: Infinity };
  
  for (const [species, specStats] of Object.entries(statsBySpecies)) {
    if (specStats.mean > highest.value) {
      highest = { species, value: specStats.mean };
    }
    if (specStats.mean < lowest.value) {
      lowest = { species, value: specStats.mean };
    }
  }

  insights.push(
    `${highest.species} has the highest average ${feature} at ${highest.value.toFixed(2)} cm`,
    `${lowest.species} has the lowest average ${feature} at ${lowest.value.toFixed(2)} cm`
  );

  return {
    FeatureStatistics: formattedStats,
    KeyInsights: insights
  };
}