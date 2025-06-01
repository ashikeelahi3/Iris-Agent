import { mean, median, deviation, variance, min, max, quantile } from 'd3-array';
import { IrisData } from '../utils/data';

// Statistical Analysis Tools
export class StatisticalTools {
  static calculateMean(data: IrisData[], column: keyof Omit<IrisData, 'Id' | 'Species'>): number {
    if (!Array.isArray(data) || data.length === 0 || !column) return NaN;
    const values = data.map(item => Number(item[column])).filter(val => !isNaN(val));
    if (values.length === 0) return NaN;
    return mean(values) || NaN;
  }

  static calculateMedian(data: IrisData[], column: keyof Omit<IrisData, 'Id' | 'Species'>): number {
    if (!Array.isArray(data) || data.length === 0 || !column) return NaN;
    const values = data.map(item => Number(item[column])).filter(val => !isNaN(val));
    if (values.length === 0) return NaN;
    return median(values) || NaN;
  }

  static calculateStandardDeviation(data: IrisData[], column: keyof Omit<IrisData, 'Id' | 'Species'>): number {
    if (!Array.isArray(data) || data.length === 0 || !column) return NaN;
    const values = data.map(item => Number(item[column])).filter(val => !isNaN(val));
    if (values.length === 0) return NaN;
    return deviation(values) || NaN;
  }

  static calculateVariance(data: IrisData[], column: keyof Omit<IrisData, 'Id' | 'Species'>): number {
    if (!Array.isArray(data) || data.length === 0 || !column) return NaN;
    const values = data.map(item => Number(item[column])).filter(val => !isNaN(val));
    if (values.length === 0) return NaN;
    return variance(values) || NaN;
  }

  static calculateCount(data: IrisData[], column: keyof IrisData, value: string | number): number {
    if (!Array.isArray(data) || !column) return 0;
    return data.filter(item => String(item[column]) === String(value)).length;
  }

  static calculateCorrelation(data: IrisData[], column1: keyof Omit<IrisData, 'Id' | 'Species'>, column2: keyof Omit<IrisData, 'Id' | 'Species'>): number {
    if (!Array.isArray(data) || data.length === 0 || !column1 || !column2) return NaN;
    
    const values1 = data.map(item => Number(item[column1])).filter(val => !isNaN(val));
    const values2 = data.map(item => Number(item[column2])).filter(val => !isNaN(val));
    
    if (values1.length === 0 || values1.length !== values2.length) return NaN;
    
    const mean1 = mean(values1) || 0;
    const mean2 = mean(values2) || 0;
    
    let numerator = 0;
    let sum1 = 0;
    let sum2 = 0;
    
    for (let i = 0; i < values1.length; i++) {
      const diff1 = values1[i] - mean1;
      const diff2 = values2[i] - mean2;
      numerator += diff1 * diff2;
      sum1 += diff1 * diff1;
      sum2 += diff2 * diff2;
    }
    
    const denominator = Math.sqrt(sum1 * sum2);
    return denominator === 0 ? NaN : numerator / denominator;
  }

  static calculateMin(data: IrisData[], column: keyof Omit<IrisData, 'Id' | 'Species'>): number {
    if (!Array.isArray(data) || data.length === 0 || !column) return NaN;
    const values = data.map(item => Number(item[column])).filter(val => !isNaN(val));
    return min(values) || NaN;
  }

  static calculateMax(data: IrisData[], column: keyof Omit<IrisData, 'Id' | 'Species'>): number {
    if (!Array.isArray(data) || data.length === 0 || !column) return NaN;
    const values = data.map(item => Number(item[column])).filter(val => !isNaN(val));
    return max(values) || NaN;
  }

  static calculatePercentile(data: IrisData[], column: keyof Omit<IrisData, 'Id' | 'Species'>, percentile: number): number {
    if (!Array.isArray(data) || data.length === 0 || !column || percentile < 0 || percentile > 100) return NaN;
    const values = data.map(item => Number(item[column])).filter(val => !isNaN(val));
    if (values.length === 0) return NaN;
    return quantile(values.sort((a, b) => a - b), percentile / 100) || NaN;
  }

  static getDescriptiveStats(data: IrisData[], column: keyof Omit<IrisData, 'Id' | 'Species'>) {
    if (!Array.isArray(data) || data.length === 0 || !column) return null;
    
    return {
      count: data.length,
      mean: this.calculateMean(data, column),
      median: this.calculateMedian(data, column),
      standardDeviation: this.calculateStandardDeviation(data, column),
      variance: this.calculateVariance(data, column),
      min: this.calculateMin(data, column),
      max: this.calculateMax(data, column),
      q25: this.calculatePercentile(data, column, 25),
      q75: this.calculatePercentile(data, column, 75)
    };
  }
}

// Data Manipulation Tools
export class DataTools {
  static filterData(data: IrisData[], filterFn: (item: IrisData) => boolean): IrisData[] {
    return data.filter(filterFn);
  }

  static filterIrisData(data: IrisData[], species?: string, minSepalLength?: number, maxSepalLength?: number): IrisData[] {
    return data.filter(item => {
      if (species && item.Species !== species) return false;
      if (minSepalLength !== undefined && item.SepalLengthCm < minSepalLength) return false;
      if (maxSepalLength !== undefined && item.SepalLengthCm > maxSepalLength) return false;
      return true;
    });
  }

  static sortData(data: IrisData[], column: keyof IrisData, order: 'asc' | 'desc' = 'asc'): IrisData[] {
    if (!Array.isArray(data) || !column) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal);
      const bStr = String(bVal);
      return order === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }

  static groupBy(data: IrisData[], column: keyof IrisData): Record<string, IrisData[]> {
    if (!Array.isArray(data) || !column) return {};
    
    return data.reduce((acc, item) => {
      const key = String(item[column]);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, IrisData[]>);
  }

  static getUniqueValues(data: IrisData[], column: keyof IrisData): (string | number)[] {
    if (!Array.isArray(data) || !column) return [];
    return [...new Set(data.map(item => item[column]))];
  }

  static selectColumns(data: IrisData[], columns: (keyof IrisData)[]): Partial<IrisData>[] {
    if (!Array.isArray(data) || !Array.isArray(columns)) return data;
    
    return data.map(item => {
      const newItem: Partial<IrisData> = {};
      columns.forEach(col => {
        if (col in item) {
          (newItem as any)[col] = item[col];
        }
      });
      return newItem;
    });
  }

  static getDataInfo(data: IrisData[]) {
    if (!Array.isArray(data) || data.length === 0) return null;
    
    const sample = data[0];
    const columns = Object.keys(sample) as (keyof IrisData)[];
    
    return {
      totalRows: data.length,
      columns: columns,
      columnTypes: columns.reduce((acc, col) => {
        const sampleValue = sample[col];
        acc[col] = typeof sampleValue;
        return acc;
      }, {} as Record<keyof IrisData, string>),
      speciesCount: this.getUniqueValues(data, 'Species').length,
      uniqueSpecies: this.getUniqueValues(data, 'Species')
    };
  }
}

// Analysis Tools
export class AnalysisTools {
  static createCrossTabulation(data: IrisData[], column1: keyof IrisData, column2: keyof IrisData): Record<string, Record<string, number>> {
    if (!Array.isArray(data) || !column1 || !column2) return {};
    
    const crosstab: Record<string, Record<string, number>> = {};
    
    data.forEach(item => {
      const key1 = String(item[column1]);
      const key2 = String(item[column2]);
      
      if (!crosstab[key1]) crosstab[key1] = {};
      if (!crosstab[key1][key2]) crosstab[key1][key2] = 0;
      crosstab[key1][key2]++;
    });
    
    return crosstab;
  }

  static createFrequencyTable(data: IrisData[], column: keyof IrisData): Record<string, number> {
    if (!Array.isArray(data) || !column) return {};
    
    const freq: Record<string, number> = {};
    data.forEach(item => {
      const key = String(item[column]);
      freq[key] = (freq[key] || 0) + 1;
    });
    
    return freq;
  }

  static compareGroups(data: IrisData[], groupColumn: keyof IrisData, measureColumn: keyof Omit<IrisData, 'Id' | 'Species'>): Record<string, any> {
    if (!Array.isArray(data) || !groupColumn || !measureColumn) return {};
    
    const groups = DataTools.groupBy(data, groupColumn);
    const comparison: Record<string, any> = {};
    
    Object.keys(groups).forEach(groupKey => {
      const groupData = groups[groupKey];
      comparison[groupKey] = StatisticalTools.getDescriptiveStats(groupData, measureColumn);
    });
    
    return comparison;
  }
}

// Visualization Tools
export class VisualizationTools {
  static generateScatterPlotData(data: IrisData[], xColumn: keyof IrisData, yColumn: keyof IrisData, groupBy?: keyof IrisData) {
    return {
      type: 'scatter',
      data: data.map(item => ({
        x: Number(item[xColumn]),
        y: Number(item[yColumn]),
        group: groupBy ? String(item[groupBy]) : 'all',
        id: item.Id
      })),
      xLabel: String(xColumn),
      yLabel: String(yColumn),
      groupLabel: groupBy ? String(groupBy) : undefined
    };
  }

  static generateHistogramData(data: IrisData[], column: keyof IrisData, bins: number = 10) {
    const values = data.map(item => Number(item[column])).filter(val => !isNaN(val));
    const minVal = min(values) || 0;
    const maxVal = max(values) || 0;
    const binWidth = (maxVal - minVal) / bins;
    
    const binData = Array(bins).fill(0).map((_, i) => ({
      range: `${(minVal + i * binWidth).toFixed(2)}-${(minVal + (i + 1) * binWidth).toFixed(2)}`,
      count: 0,
      binStart: minVal + i * binWidth,
      binEnd: minVal + (i + 1) * binWidth
    }));

    values.forEach(value => {
      const binIndex = Math.min(Math.floor((value - minVal) / binWidth), bins - 1);
      binData[binIndex].count++;
    });

    return {
      type: 'histogram',
      data: binData,
      column: String(column)
    };
  }

  static generateCorrelationMatrix(data: IrisData[]) {
    const numericColumns: (keyof Omit<IrisData, 'Id' | 'Species'>)[] = 
      ['SepalLengthCm', 'SepalWidthCm', 'PetalLengthCm', 'PetalWidthCm'];
    
    const matrix: { [key: string]: { [key: string]: number } } = {};
    
    numericColumns.forEach(col1 => {
      matrix[String(col1)] = {};
      numericColumns.forEach(col2 => {
        matrix[String(col1)][String(col2)] = StatisticalTools.calculateCorrelation(data, col1, col2);
      });
    });

    return {
      type: 'correlation_matrix',
      data: matrix,
      columns: numericColumns.map(String)
    };
  }
}

// Advanced Analysis Tools
export class AdvancedAnalysisTools {
  static findOutliers(data: IrisData[], column: keyof Omit<IrisData, 'Id' | 'Species'>, method: 'iqr' | 'zscore' = 'iqr') {
    const values = data.map(item => Number(item[column])).filter(val => !isNaN(val));
    
    if (method === 'iqr') {
      const q1 = quantile(values, 0.25) || 0;
      const q3 = quantile(values, 0.75) || 0;
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      
      return data.filter(item => {
        const value = Number(item[column]);
        return value < lowerBound || value > upperBound;
      }).map(item => ({
        ...item,
        outlierReason: Number(item[column]) < lowerBound ? 'below_q1' : 'above_q3'
      }));
    }
    
    // Z-score method
    const meanVal = mean(values) || 0;
    const stdDev = deviation(values) || 0;
    
    return data.filter(item => {
      const zScore = Math.abs((Number(item[column]) - meanVal) / stdDev);
      return zScore > 2; // 2 standard deviations
    }).map(item => ({
      ...item,
      zScore: (Number(item[column]) - meanVal) / stdDev
    }));
  }

  static calculateConfidenceInterval(data: IrisData[], column: keyof Omit<IrisData, 'Id' | 'Species'>, confidence: number = 0.95) {
    const values = data.map(item => Number(item[column])).filter(val => !isNaN(val));
    const meanVal = mean(values) || 0;
    const stdDev = deviation(values) || 0;
    const n = values.length;
    
    // Using t-distribution approximation
    const tValue = confidence === 0.95 ? 1.96 : confidence === 0.99 ? 2.576 : 1.645;
    const marginOfError = tValue * (stdDev / Math.sqrt(n));
    
    return {
      mean: meanVal,
      lowerBound: meanVal - marginOfError,
      upperBound: meanVal + marginOfError,
      confidence,
      sampleSize: n
    };
  }

  static calculateFeatureImportance(data: IrisData[]) {
    const numericColumns: (keyof Omit<IrisData, 'Id' | 'Species'>)[] = 
      ['SepalLengthCm', 'SepalWidthCm', 'PetalLengthCm', 'PetalWidthCm'];
    
    const species = ['Iris-setosa', 'Iris-versicolor', 'Iris-virginica'];
    const importance: { [key: string]: number } = {};
    
    // Simple variance-based importance (higher variance across species means more separating power)
    numericColumns.forEach(column => {
      const speciesMeans = species.map(sp => {
        const speciesData = data.filter(item => item.Species === sp);
        return StatisticalTools.calculateMean(speciesData, column);
      });
      
      const overallMean = StatisticalTools.calculateMean(data, column);
      const betweenSpeciesVariance = mean(speciesMeans.map(m => Math.pow(m - overallMean, 2))) || 0;
      
      importance[String(column)] = betweenSpeciesVariance;
    });
    
    // Normalize to percentages
    const totalImportance = Object.values(importance).reduce((sum, val) => sum + val, 0);
    Object.keys(importance).forEach(key => {
      importance[key] = (importance[key] / totalImportance) * 100;
    });
    
    return importance;
  }

  static performDetailedSpeciesComparison(data: IrisData[]) {
    const species = ['Iris-setosa', 'Iris-versicolor', 'Iris-virginica'];
    const numericColumns: (keyof Omit<IrisData, 'Id' | 'Species'>)[] = 
      ['SepalLengthCm', 'SepalWidthCm', 'PetalLengthCm', 'PetalWidthCm'];
    
    const comparison: { [species: string]: any } = {};
    
    species.forEach(sp => {
      const speciesData = data.filter(item => item.Species === sp);
      comparison[sp] = {
        count: speciesData.length,
        statistics: {}
      };
      
      numericColumns.forEach(column => {
        const stats = StatisticalTools.getDescriptiveStats(speciesData, column);
        const ci = this.calculateConfidenceInterval(speciesData, column);
        
        comparison[sp].statistics[String(column)] = {
          ...stats,
          confidenceInterval: ci
        };
      });
    });
    
    return comparison;
  }
}
