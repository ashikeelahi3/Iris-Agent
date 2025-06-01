import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { 
  loadIrisData, 
  calculateStatistics, 
  getFeatureData, 
  countBySpecies,
  extractFeatureFromQuery,
  getStatsBySpeciesForFeature,
  formatFeatureStatsResponse 
} from '../../utils/data';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Statistical Analysis Tools for Iris Dataset
async function calculateFeatureStatistics(feature: string) {
  try {
    const data = await loadIrisData();
    const validFeatures = ['SepalLengthCm', 'SepalWidthCm', 'PetalLengthCm', 'PetalWidthCm'];
    
    if (!validFeatures.includes(feature)) {
      return `Invalid feature. Available features: ${validFeatures.join(', ')}`;
    }
    
    const featureData = getFeatureData(data, feature as any);
    const stats = calculateStatistics(featureData);
    
    return `Feature: ${feature}
Mean: ${stats.mean.toFixed(2)}
Median: ${stats.median.toFixed(2)}
Standard Deviation: ${stats.stdDev.toFixed(2)}
Min: ${Math.min(...featureData).toFixed(2)}
Max: ${Math.max(...featureData).toFixed(2)}
Sample Size: ${featureData.length}`;
  } catch (error) {
    return `Error calculating statistics for ${feature}: ${error}`;
  }
}

async function getSpeciesDistribution() {
  try {
    const data = await loadIrisData();
    const distribution = countBySpecies(data);
    const total = data.length;
    
    let result = 'Species Distribution:\n';
    for (const [species, count] of Object.entries(distribution)) {
      const percentage = ((count / total) * 100).toFixed(1);
      result += `${species}: ${count} samples (${percentage}%)\n`;
    }
    result += `Total: ${total} samples`;
    
    return result;
  } catch (error) {
    return `Error getting species distribution: ${error}`;
  }
}

async function compareFeaturesBySpecies(feature: string) {
  try {
    const data = await loadIrisData();
    const validFeatures = ['SepalLengthCm', 'SepalWidthCm', 'PetalLengthCm', 'PetalWidthCm'];
    
    if (!validFeatures.includes(feature)) {
      return `Invalid feature. Available features: ${validFeatures.join(', ')}`;
    }
    
    const speciesGroups: { [key: string]: number[] } = {};
    
    data.forEach(item => {
      if (!speciesGroups[item.Species]) {
        speciesGroups[item.Species] = [];
      }
      speciesGroups[item.Species].push(item[feature as keyof typeof item] as number);
    });
    
    let result = `${feature} Statistics by Species:\n`;
    
    for (const [species, values] of Object.entries(speciesGroups)) {
      const stats = calculateStatistics(values);
      result += `\n${species}:
  Mean: ${stats.mean.toFixed(2)}
  Median: ${stats.median.toFixed(2)}
  Std Dev: ${stats.stdDev.toFixed(2)}
  Min: ${Math.min(...values).toFixed(2)}
  Max: ${Math.max(...values).toFixed(2)}
  Count: ${values.length}\n`;
    }
    
    return result;
  } catch (error) {
    return `Error comparing ${feature} by species: ${error}`;
  }
}

async function getDatasetSummary() {
  try {
    const data = await loadIrisData();
    const distribution = countBySpecies(data);
    
    let summary = `Iris Dataset Summary:
Total Samples: ${data.length}
Features: SepalLengthCm, SepalWidthCm, PetalLengthCm, PetalWidthCm
Species: ${Object.keys(distribution).length}

Species Distribution:`;
    
    for (const [species, count] of Object.entries(distribution)) {
      summary += `\n- ${species}: ${count} samples`;
    }
    
    return summary;
  } catch (error) {
    return `Error getting dataset summary: ${error}`;
  }
}

async function getAllFeatureMeansBySpecies() {
  try {
    const data = await loadIrisData();
    const validFeatures = ['SepalLengthCm', 'SepalWidthCm', 'PetalLengthCm', 'PetalWidthCm'];
    
    const speciesGroups: { [key: string]: { [feature: string]: number[] } } = {};
    
    // Group data by species and feature
    data.forEach(item => {
      if (!speciesGroups[item.Species]) {
        speciesGroups[item.Species] = {};
        validFeatures.forEach(feature => {
          speciesGroups[item.Species][feature] = [];
        });
      }
      
      validFeatures.forEach(feature => {
        speciesGroups[item.Species][feature].push(item[feature as keyof typeof item] as number);
      });
    });
    
    let result = 'Mean Values for All Features by Species:\n\n';
    
    for (const [species, featureData] of Object.entries(speciesGroups)) {
      result += `${species}:\n`;
      
      validFeatures.forEach(feature => {
        const values = featureData[feature];
        const stats = calculateStatistics(values);
        result += `  ${feature}: ${stats.mean.toFixed(2)} cm\n`;
      });
      
      result += `  Sample Count: ${featureData[validFeatures[0]].length}\n\n`;
    }
    
    return result;
  } catch (error) {
    return `Error calculating feature means by species: ${error}`;
  }
}

async function getBivariateCorrelations() {
  try {
    const data = await loadIrisData();
    const validFeatures = ['SepalLengthCm', 'SepalWidthCm', 'PetalLengthCm', 'PetalWidthCm'];
    
    // Calculate correlation matrix
    const correlations: { [key: string]: { [key: string]: number } } = {};
    
    for (const feature1 of validFeatures) {
      correlations[feature1] = {};
      for (const feature2 of validFeatures) {
        const data1 = getFeatureData(data, feature1 as any);
        const data2 = getFeatureData(data, feature2 as any);
        correlations[feature1][feature2] = calculateCorrelation(data1, data2);
      }
    }
    
    // Format as table
    let result = 'Bivariate Correlation Matrix:\n\n';
    result += 'Feature'.padEnd(16) + validFeatures.map(f => f.replace('Cm', '').padEnd(12)).join('') + '\n';
    result += '-'.repeat(16 + validFeatures.length * 12) + '\n';
    
    for (const feature1 of validFeatures) {
      result += feature1.replace('Cm', '').padEnd(16);
      for (const feature2 of validFeatures) {
        const corr = correlations[feature1][feature2];
        result += corr.toFixed(3).padEnd(12);
      }
      result += '\n';
    }
    
    result += '\nInterpretation:\n';
    result += '• 1.0 = Perfect positive correlation\n';
    result += '• 0.0 = No correlation\n';
    result += '• -1.0 = Perfect negative correlation\n';
    result += '• |r| > 0.7 = Strong correlation\n';
    result += '• |r| > 0.3 = Moderate correlation\n';
    
    return result;
  } catch (error) {
    return `Error calculating bivariate correlations: ${error}`;
  }
}

// Helper function to calculate Pearson correlation coefficient
function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n !== y.length || n === 0) return 0;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
  const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
}

const tools = {
  "calculateFeatureStatistics": calculateFeatureStatistics,
  "getSpeciesDistribution": getSpeciesDistribution,
  "compareFeaturesBySpecies": compareFeaturesBySpecies,
  "getDatasetSummary": getDatasetSummary,
  "getAllFeatureMeansBySpecies": getAllFeatureMeansBySpecies,
  "getBivariateCorrelations": getBivariateCorrelations
}

const SYSTEM_PROMPT = `
You are an AI Statistical Analysis Assistant specialized in analyzing the Iris dataset with START, PLAN, ACTION, Observation and Output State.
Wait for the user prompt and first PLAN using available statistical analysis tools.
After Planning, Take the action with appropriate tools and wait for Observation based on Action.
Once you get the observation, Return the AI response based on START prompt and observations with clear statistical insights.

You must respond with valid JSON format only. Strictly follow the JSON output format as in example.

Available Statistical Analysis Tools:
- function calculateFeatureStatistics(feature: string): string
  Calculates mean, median, standard deviation, min, max for a specific feature
  Valid features: SepalLengthCm, SepalWidthCm, PetalLengthCm, PetalWidthCm

- function getSpeciesDistribution(): string
  Returns the distribution of species in the dataset with counts and percentages

- function compareFeaturesBySpecies(feature: string): string
  Compares statistical measures of a feature across different iris species

- function getDatasetSummary(): string
  Provides an overview of the entire iris dataset

- function getAllFeatureMeansBySpecies(): string
  Calculates the mean values for ALL 4 features (SepalLengthCm, SepalWidthCm, PetalLengthCm, PetalWidthCm) for each species
  Use this when user asks for "mean of each species", "all feature means by species", or similar comprehensive requests

- function getBivariateCorrelations(): string
  Calculates correlation matrix between all feature pairs, showing relationships between variables
  Use this when user asks for "correlations", "bivariate analysis", "feature relationships", or "correlation table"

- function getBivariateCorrelations(): string
  Calculates bivariate correlations between all feature pairs and returns a correlation matrix
  Features: SepalLengthCm, SepalWidthCm, PetalLengthCm, PetalWidthCm

Example JSON workflow for comprehensive species analysis:
START
{ "type": "user", "user": "Mean of each species" }
{ "type": "plan", "plan": "I will calculate the mean values for all 4 features across each iris species using getAllFeatureMeansBySpecies" }
{ "type": "action", "function": "getAllFeatureMeansBySpecies", "input": "" }
{ "type": "observation", "observation": "Mean Values for All Features by Species:\n\nIris-setosa:\n  SepalLengthCm: 5.01 cm\n  SepalWidthCm: 3.43 cm\n  PetalLengthCm: 1.46 cm\n  PetalWidthCm: 0.25 cm\n  Sample Count: 50\n\nIris-versicolor:\n  SepalLengthCm: 5.94 cm\n  SepalWidthCm: 2.77 cm\n  PetalLengthCm: 4.26 cm\n  PetalWidthCm: 1.33 cm\n  Sample Count: 50\n\nIris-virginica:\n  SepalLengthCm: 6.59 cm\n  SepalWidthCm: 2.97 cm\n  PetalLengthCm: 5.55 cm\n  PetalWidthCm: 2.03 cm\n  Sample Count: 50" }
{ "type": "output", "output": "🌸 **Mean Values for All Features by Species:**\n\n**Iris-setosa (Smallest overall):**\n- Sepal Length: 5.01 cm\n- Sepal Width: 3.43 cm (widest sepals)\n- Petal Length: 1.46 cm (shortest petals)\n- Petal Width: 0.25 cm (narrowest petals)\n\n**Iris-versicolor (Medium-sized):**\n- Sepal Length: 5.94 cm\n- Sepal Width: 2.77 cm\n- Petal Length: 4.26 cm\n- Petal Width: 1.33 cm\n\n**Iris-virginica (Largest overall):**\n- Sepal Length: 6.59 cm (longest sepals)\n- Sepal Width: 2.97 cm\n- Petal Length: 5.55 cm (longest petals)\n- Petal Width: 2.03 cm (widest petals)\n\n📊 **Key Insights:**\n- Clear size progression: setosa < versicolor < virginica\n- Iris-setosa has uniquely wide sepals but tiny petals\n- Iris-virginica dominates in most measurements except sepal width\n- Each species has 50 samples for balanced analysis" }

Always respond with a valid JSON object following this structure. Focus on providing clear statistical insights and interpretations.
`

interface ConversationResponse {
  reply: string;
  steps: any[];
  conversationHistory: ChatCompletionMessageParam[];
  success: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json();
    console.log('Received request:', { message, conversationHistoryLength: conversationHistory.length });

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    // Initialize conversation with system prompt
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];
    
    // Add conversation history (excluding any existing system prompts)
    const historyMessages = conversationHistory.filter((msg: ChatCompletionMessageParam) => msg.role !== 'system');
    // Only keep the last 10 user/assistant messages to reduce token usage
    const rollingHistory = historyMessages.slice(-10);
    messages.push(...rollingHistory);

    // Add user message
    const userQuery = {
      type: 'user',
      user: message
    };
    messages.push({ role: 'user', content: JSON.stringify(userQuery) });

    console.log('Starting agent execution loop...');

    let finalOutput = '';
    let steps = [];
    let loopCount = 0;
    const maxLoops = 10; // Prevent infinite loops

    // Agent execution loop
    while (loopCount < maxLoops) {
      loopCount++;
      console.log(`Agent loop iteration ${loopCount}`);
      const chat = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        response_format: { type: 'json_object' }
      });

      const result = chat.choices[0].message.content;
      if (!result) {
        console.log('No result from OpenAI, breaking loop');
        break;
      }

      console.log('Agent step:', result);
      messages.push({ role: 'assistant', content: result } as ChatCompletionMessageParam);

      let call;
      try {
        call = JSON.parse(result);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        throw new Error(`Invalid JSON response from AI: ${result}`);
      }

      steps.push(call);
      if (call.type === "output") {
        finalOutput = call.output;
        console.log('Found output, ending loop:', finalOutput);
        break;
      } else if (call.type === "action") {
        const fn = tools[call.function as keyof typeof tools];
        if (fn) {
          try {
            const observation = await fn(call.input);
            const obs = { "type": "observation", "observation": observation };
            messages.push({ role: "user", content: JSON.stringify(obs) } as ChatCompletionMessageParam);
            console.log('Added observation:', obs);
          } catch (toolError) {
            console.error('Tool execution error:', toolError);
            const errorObs = { "type": "observation", "observation": `Error: ${toolError}` };
            messages.push({ role: "user", content: JSON.stringify(errorObs) } as ChatCompletionMessageParam);
          }
        } else {
          console.error('Unknown function:', call.function);
          const errorObs = { "type": "observation", "observation": `Error: Unknown function ${call.function}` };
          messages.push({ role: "user", content: JSON.stringify(errorObs) } as ChatCompletionMessageParam);
        }
      }
    }

    if (loopCount >= maxLoops) {
      console.error('Agent loop exceeded maximum iterations');
      throw new Error('Agent execution exceeded maximum iterations');
    }

    if (!finalOutput) {
      console.error('No final output generated');
      throw new Error('Agent did not produce a final output');
    }

    console.log('Agent execution completed successfully');

    const response: ConversationResponse = {
      reply: finalOutput,
      steps: steps,
      conversationHistory: messages,
      success: true
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('AI Agent error:', error);

    // Provide specific error messages based on error type
    let errorMessage = 'Failed to get response from AI Agent';
    let errorDetails = error?.message || 'Unknown error occurred';

    if (error?.code === 'insufficient_quota') {
      errorMessage = 'OpenAI API quota exceeded';
      errorDetails = 'Please check your OpenAI API usage and billing';
    } else if (error?.code === 'invalid_api_key') {
      errorMessage = 'Invalid OpenAI API key';
      errorDetails = 'Please check your API key configuration';
    } else if (error?.code === 'rate_limit_exceeded') {
      errorMessage = 'Rate limit exceeded';
      errorDetails = 'Please wait a moment before trying again';
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        success: false
      },
      { status: 500 }
    );
  }
}
