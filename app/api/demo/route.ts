import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { IrisData } from '../../utils/data';
import { FunctionExecutor } from '../../lib/executor';

function loadIrisData(): IrisData[] {
  const filePath = path.join(process.cwd(), 'public', 'data', 'Iris.csv');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  const result = Papa.parse(fileContent, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  
  return result.data as IrisData[];
}

// Demo AI responses for common queries with visualization data
const demoResponses: Record<string, any> = {
  'basic statistics sepal length': {
    plan: "I will use getDescriptiveStats to calculate comprehensive statistics for SepalLengthCm.",
    function: "getDescriptiveStats",
    input: { data: "iris", column: "SepalLengthCm" },
    output: "Here are the basic statistics for sepal length: The mean sepal length is 5.84 cm with a standard deviation of 0.83 cm. The minimum value is 4.30 cm and the maximum is 7.90 cm. The median is 5.80 cm, with 25th percentile at 5.10 cm and 75th percentile at 6.40 cm.",
    visualization: { type: 'bar', title: 'Sepal Length Distribution', column: 'SepalLengthCm' }
  },
  'compare species petal width': {
    plan: "I will use compareGroups to compare petal width statistics across different species.",
    function: "compareGroups", 
    input: { data: "iris", groupColumn: "Species", measureColumn: "PetalWidthCm" },
    output: "Here's the comparison of mean petal width across species: Setosa has the smallest mean petal width at 0.25 cm, followed by Versicolor at 1.33 cm, and Virginica has the largest at 2.03 cm. This shows a clear progression in petal width from Setosa to Virginica species.",
    visualization: { type: 'bar', title: 'Petal Width by Species', xColumn: 'Species', yColumn: 'PetalWidthCm' }
  },
  'correlation sepal petal length': {
    plan: "I will use calculateCorrelation to find the relationship between sepal length and petal length.",
    function: "calculateCorrelation",
    input: { data: "iris", column1: "SepalLengthCm", column2: "PetalLengthCm" },
    output: "The correlation between sepal length and petal length is 0.87, indicating a strong positive correlation. This means that as sepal length increases, petal length tends to increase as well.",
    visualization: { type: 'scatter', title: 'Sepal Length vs Petal Length', xColumn: 'SepalLengthCm', yColumn: 'PetalLengthCm', groupBy: 'Species' }
  },
  'species distribution': {
    plan: "I will use createFrequencyTable to show the distribution of species in the dataset.",
    function: "createFrequencyTable",
    input: { data: "iris", column: "Species" },
    output: "The dataset contains an equal distribution of species: 50 samples each of Iris-setosa, Iris-versicolor, and Iris-virginica, for a total of 150 samples. This balanced distribution makes it ideal for classification and comparison tasks.",
    visualization: { type: 'pie', title: 'Species Distribution', xColumn: 'Species' }
  },
  'correlation matrix': {
    plan: "I will generate a correlation matrix for all numerical features.",
    function: "generateCorrelationMatrix",
    input: { data: "iris" },
    output: "Here's the correlation matrix for all numerical features:\n\n**Strong correlations found:**\n- Sepal Length vs Petal Length: 0.87 (very strong positive)\n- Petal Length vs Petal Width: 0.96 (very strong positive)\n- Sepal Length vs Petal Width: 0.82 (strong positive)\n\n**Weak correlation:**\n- Sepal Width vs other features: generally weak correlations\n\nThis suggests that petal measurements are highly correlated with each other and with sepal length.",
    visualization: { type: 'bar', title: 'Feature Correlations', xColumn: 'Feature', yColumn: 'Correlation' }
  }
};

function findBestMatch(query: string): string | null {
  const queryLower = query.toLowerCase();
  
  for (const [key, _] of Object.entries(demoResponses)) {
    const keywords = key.split(' ');
    const matches = keywords.filter(keyword => queryLower.includes(keyword));
    if (matches.length >= 2) {
      return key;
    }
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    // Initialize data context
    const dataContext = {
      iris: loadIrisData(),
      lastResult: null,
    };

    // Find a matching demo response
    const matchKey = findBestMatch(query);
    
    if (matchKey) {
      const demo = demoResponses[matchKey];
      
      try {
        // Execute the actual function to get real results
        const observation = await FunctionExecutor.executeFunction(
          demo.function,
          demo.input,
          dataContext
        );

        // Create realistic reasoning steps
        const reasoning = [
          { role: 'assistant', content: JSON.stringify({ type: 'plan', plan: demo.plan }) },
          { role: 'assistant', content: JSON.stringify({ type: 'action', function: demo.function, input: demo.input }) },
          { role: 'user', content: JSON.stringify({ type: 'observation', observation }) }
        ];

        // Generate output based on actual results
        let output = demo.output;
        if (typeof observation === 'object' && observation !== null) {
          if (demo.function === 'getDescriptiveStats') {
            output = `Here are the basic statistics for sepal length: The mean is ${observation.mean?.toFixed(2)} cm with a standard deviation of ${observation.standardDeviation?.toFixed(2)} cm. The minimum value is ${observation.min?.toFixed(2)} cm and the maximum is ${observation.max?.toFixed(2)} cm. The median is ${observation.median?.toFixed(2)} cm.`;
          } else if (demo.function === 'compareGroups') {
            const species = Object.keys(observation);
            const means = species.map(s => `${s}: ${observation[s]?.mean?.toFixed(2)} cm`).join(', ');
            output = `Here's the comparison of mean petal width across species: ${means}. This shows clear differences between the species.`;
          } else if (demo.function === 'calculateCorrelation') {
            output = `The correlation between sepal length and petal length is ${observation?.toFixed(3)}, indicating a ${Math.abs(observation) > 0.7 ? 'strong' : 'moderate'} ${observation > 0 ? 'positive' : 'negative'} correlation.`;
          } else if (demo.function === 'createFrequencyTable') {
            const total = Object.values(observation).reduce((sum: number, count: any) => sum + count, 0);
            const distribution = Object.entries(observation).map(([species, count]) => `${count} ${species}`).join(', ');
            output = `The dataset contains: ${distribution}, for a total of ${total} samples. This provides a ${Object.keys(observation).length === 3 ? 'balanced' : 'varied'} distribution across species.`;          } else if (demo.function === 'generateCorrelationMatrix') {
            const correlations = Object.entries(observation).map(([key, value]) => `${key}: ${(value as number).toFixed(2)}`).join(', ');
            output = `Here's the correlation matrix for all numerical features: ${correlations}. Strong correlations found between petal length and width, and between sepal length and petal length.`;
          }
        }        return NextResponse.json({
          success: true,
          messages: [
            { role: 'user', content: query },
            { role: 'assistant', content: output }
          ],
          reply: output,
          reasoning: reasoning,
          visualization: demo.visualization,
          exportData: { results: observation },
          demoMode: true
        });

      } catch (executionError) {
        console.error('Function execution error:', executionError);        return NextResponse.json({
          success: true,
          messages: [
            { role: 'user', content: query },
            { role: 'assistant', content: demo.output }
          ],
          reply: demo.output,
          reasoning: [
            { role: 'assistant', content: JSON.stringify({ type: 'plan', plan: demo.plan }) },
            { role: 'assistant', content: JSON.stringify({ type: 'action', function: demo.function, input: demo.input }) }
          ],
          visualization: demo.visualization,
          exportData: { results: 'Demo data - actual computation failed' },
          demoMode: true
        });
      }
    }

    // Default response for unmatched queries
    return NextResponse.json({
      success: true,
      messages: [
        { role: 'user', content: query },
        { role: 'assistant', content: 'I understand you want to analyze the Iris dataset. Currently, I\'m running in demo mode. Please try asking about: basic statistics for sepal length, comparing species by petal width, correlation analysis, or species distribution.' }
      ],
      reply: 'I understand you want to analyze the Iris dataset. Currently, I\'m running in demo mode. Please try asking about: basic statistics for sepal length, comparing species by petal width, correlation analysis, or species distribution.',
      reasoning: [],
      demoMode: true
    });

  } catch (error) {
    console.error('Demo API route error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error in demo mode',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
