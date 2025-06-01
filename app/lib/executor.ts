import { IrisData } from '../utils/data';
import { StatisticalTools, DataTools, AnalysisTools } from './tools';

// Function execution handler
export class FunctionExecutor {
  static resolveDataset(dataReference: string | IrisData[], dataContext: any): IrisData[] {
    if (typeof dataReference === 'string') {
      if (dataReference === 'iris' && dataContext.iris) {
        return dataContext.iris;
      }
      if (dataReference === 'lastResult' && dataContext.lastResult) {
        return dataContext.lastResult;
      }
      throw new Error(`Unknown dataset reference: ${dataReference}`);
    }
    return dataReference;
  }

  static async executeFunction(functionName: string, input: any, dataContext: any): Promise<any> {
    console.log(`Executing function: ${functionName} with input:`, input);
    
    try {
      let result;
      
      // Resolve data parameter if it exists
      if (input.data) {
        input.data = this.resolveDataset(input.data, dataContext);
      }

      switch (functionName) {
        // Data manipulation
        case 'filterIrisData':
          result = DataTools.filterIrisData(
            input.data,
            input.species,
            input.minSepalLength,
            input.maxSepalLength
          );
          break;
        
        case 'sortData':
          result = DataTools.sortData(input.data, input.column, input.order);
          break;
        
        case 'groupBy':
          result = DataTools.groupBy(input.data, input.column);
          break;
        
        case 'getUniqueValues':
          result = DataTools.getUniqueValues(input.data, input.column);
          break;
        
        case 'selectColumns':
          result = DataTools.selectColumns(input.data, input.columns);
          break;
        
        case 'getDataInfo':
          result = DataTools.getDataInfo(input.data);
          break;

        // Statistical analysis
        case 'calculateMean':
          result = StatisticalTools.calculateMean(input.data, input.column);
          break;
        
        case 'calculateMedian':
          result = StatisticalTools.calculateMedian(input.data, input.column);
          break;
        
        case 'calculateStandardDeviation':
          result = StatisticalTools.calculateStandardDeviation(input.data, input.column);
          break;
        
        case 'calculateVariance':
          result = StatisticalTools.calculateVariance(input.data, input.column);
          break;
        
        case 'calculateCount':
          result = StatisticalTools.calculateCount(input.data, input.column, input.value);
          break;
        
        case 'calculateCorrelation':
          result = StatisticalTools.calculateCorrelation(input.data, input.column1, input.column2);
          break;
        
        case 'calculateMin':
          result = StatisticalTools.calculateMin(input.data, input.column);
          break;
        
        case 'calculateMax':
          result = StatisticalTools.calculateMax(input.data, input.column);
          break;
        
        case 'calculatePercentile':
          result = StatisticalTools.calculatePercentile(input.data, input.column, input.percentile);
          break;
        
        case 'getDescriptiveStats':
          result = StatisticalTools.getDescriptiveStats(input.data, input.column);
          break;

        // Analysis tools
        case 'createCrossTabulation':
          result = AnalysisTools.createCrossTabulation(input.data, input.column1, input.column2);
          break;
        
        case 'createFrequencyTable':
          result = AnalysisTools.createFrequencyTable(input.data, input.column);
          break;
        
        case 'compareGroups':
          result = AnalysisTools.compareGroups(input.data, input.groupColumn, input.measureColumn);
          break;

        default:
          throw new Error(`Unknown function: ${functionName}`);
      }

      // Store result in context if it's an array (dataset)
      if (Array.isArray(result)) {
        dataContext.lastResult = result;
      }

      console.log(`Function ${functionName} result:`, result);
      return result;
    } catch (error) {
      console.error(`Error executing function ${functionName}:`, error);
      throw error;
    }
  }
}
