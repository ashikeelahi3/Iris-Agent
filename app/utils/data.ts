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