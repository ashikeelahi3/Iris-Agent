import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { IrisData } from '../../utils/data';
import { FunctionExecutor } from '../../lib/executor';
import { SYSTEM_PROMPT } from '../../lib/systemPrompt';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export async function POST(request: NextRequest) {
  try {
    const { query, messages: previousMessages = [] } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Initialize data context
    const dataContext = {
      iris: loadIrisData(),
      lastResult: null,
    };

    // Initialize messages with system prompt and previous conversation
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...previousMessages,
      { role: 'user', content: JSON.stringify({ type: 'user', user: query }) },
    ];

    let iterations = 0;
    const maxIterations = 10; // Prevent infinite loops

    while (iterations < maxIterations) {
      iterations++;      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('No response from OpenAI');
        }

        let result;
        try {
          result = JSON.parse(content);
        } catch (parseError) {
          console.error('Failed to parse OpenAI response:', content);
          throw new Error('Invalid JSON response from AI');
        }

        messages.push({ role: 'assistant', content: JSON.stringify(result) });

        // If this is the final output, return the result
        if (result.type === 'output') {
          return NextResponse.json({
            success: true,
            messages: messages.slice(1), // Remove system prompt from returned messages
            reply: result.output,
            reasoning: messages.slice(1).filter((msg: any) => {
              try {
                const parsed = JSON.parse(msg.content);
                return ['plan', 'action', 'observation'].includes(parsed.type);
              } catch {
                return false;
              }
            }),
          });
        }

        // If this is an action, execute the function
        if (result.type === 'action') {
          try {
            const observation = await FunctionExecutor.executeFunction(
              result.function,
              result.input,
              dataContext
            );

            const observationMessage = {
              type: 'observation',
              observation: observation,
            };

            messages.push({
              role: 'user',
              content: JSON.stringify(observationMessage),
            });
          } catch (executionError) {
            console.error('Function execution error:', executionError);
            const errorMessage = {
              type: 'observation',
              observation: `Error: ${executionError instanceof Error ? executionError.message : 'Unknown error'}`,
            };

            messages.push({
              role: 'user',
              content: JSON.stringify(errorMessage),
            });
          }
        }      } catch (openaiError: any) {
        console.error('OpenAI API error:', openaiError);
        
        // Handle specific OpenAI errors
        if (openaiError?.status === 429) {
          return NextResponse.json(
            { 
              error: 'OpenAI API quota exceeded',
              details: 'The OpenAI API quota has been exceeded. Please check your OpenAI account billing and usage limits.',
              userMessage: 'The AI service is temporarily unavailable due to quota limits. Please try again later or check your OpenAI account.'
            },
            { status: 429 }
          );
        }
        
        if (openaiError?.status === 401) {
          return NextResponse.json(
            { 
              error: 'OpenAI API authentication failed',
              details: 'Invalid or missing OpenAI API key.',
              userMessage: 'Authentication with the AI service failed. Please check the API key configuration.'
            },
            { status: 401 }
          );
        }
        
        return NextResponse.json(
          { 
            error: 'Failed to get response from AI',
            details: openaiError instanceof Error ? openaiError.message : 'Unknown error',
            userMessage: 'The AI service encountered an error. Please try again.'
          },
          { status: 500 }
        );
      }
    }

    // If we reach max iterations
    return NextResponse.json(
      { error: 'Maximum iteration limit reached' },
      { status: 500 }
    );

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
