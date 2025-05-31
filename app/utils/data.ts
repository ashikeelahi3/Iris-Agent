import Papa from 'papaparse';
// @ts-ignore
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
  const response = await fetch('/data/Iris.csv');
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