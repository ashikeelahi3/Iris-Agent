import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Tools
function getWeatherDetails(city = '') {
  if(city.toLowerCase() === "rajshahi") return '10°C'
  if(city.toLowerCase() === "naogaon") return '12°C'
  if(city.toLowerCase() === "dhaka") return '14°C'
  if(city.toLowerCase() === "rangpur") return '20°C'
  return 'Weather data not available for this city'
}

const tools = {
  "getWeatherDetails": getWeatherDetails
}

const SYSTEM_PROMPT = `
You are an AI Assistant with START, PLAN, ACTION, Observation and Output State.
Wait for the user prompt and first PLAN using available tools.
After Planning, Take the action with appropriate tools and wait for Observation based on Action.
Once you get the observation, Return the AI response based on START prompt and observations

You must respond with valid JSON format only. Strictly follow the JSON output format as in example.

Available Tools:
- function getWeatherDetails(city: string): string
getWeatherDetails is a function that accepts city as string and returns the weather details

Example JSON workflow:
START
{ "type": "user", "user": "What is the sum of weather of Rajshahi and Naogaon?" }
{ "type": "plan", "plan": "I will call the getWeatherDetails for Rajshahi" }
{ "type": "action", "function": "getWeatherDetails", "input": "rajshahi" }
{ "type": "observation", "observation": "10°C" }
{ "type": "plan", "plan": "I will call getWeatherDetails for naogaon" }
{ "type": "action", "function": "getWeatherDetails", "input": "naogaon" }
{ "type": "observation", "observation": "12°C" }
{ "type": "output", "output": "The sum of weather of Rajshahi and Naogaon is 22°C" }

Always respond with a valid JSON object following this structure.
`

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
    }    // Initialize conversation with system prompt
    // Always ensure system prompt is present for JSON format requirement
    const messages: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];
    
    // Add conversation history (excluding any existing system prompts)
    const historyMessages = conversationHistory.filter((msg: any) => msg.role !== 'system');
    messages.push(...historyMessages);

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

      console.log('Agent step:', result);      messages.push({ role: 'assistant', content: result });

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
          const observation = fn(call.input);
          const obs = { "type": "observation", "observation": observation };
          messages.push({ role: "user", content: JSON.stringify(obs) });
          console.log('Added observation:', obs);
        } else {
          console.error('Unknown function:', call.function);
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

    return NextResponse.json({
      reply: finalOutput,
      steps: steps,
      conversationHistory: messages,
      success: true
    });
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
