'use client';

import { useState } from 'react';

interface MessageProps {
  content: string | Record<string, any>;
  isUser: boolean;
  timestamp?: string;
  steps?: Array<{
    type: string;
    plan?: string;
    function?: string;
    input?: string;
    observation?: string;
    output?: string;
  }>;
}

const formatContent = (content: string | Record<string, any>): string => {
  if (typeof content === 'string') return content;
  return Object.entries(content)
    .map(([key, value]) => {
      const formattedValue = Array.isArray(value)
        ? value.map(item => `  - ${item}`).join('\n')
        : typeof value === 'object' && value !== null
        ? Object.entries(value)
            .map(([k, v]) => `  - **${k}**: ${v}`)
            .join('\n')
        : String(value);
      return `**${key}**\n${formattedValue}`;
    })
    .join('\n\n');
};

export default function Message({ content, isUser, timestamp, steps }: MessageProps) {
  const [showSteps, setShowSteps] = useState(false);
  const formattedContent = formatContent(content);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[90%] rounded-lg p-2.5 ${
          isUser
            ? 'bg-indigo-600 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none'
        }`}
      >
        <div className="text-sm whitespace-pre-wrap">{formattedContent}</div>
        
        {!isUser && steps && steps.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              {showSteps ? 'Hide' : 'Show'} agent steps ({steps.length})
            </button>
            
            {showSteps && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                {steps.map((step, index) => (
                  <div key={index} className="mb-1">
                    {step.type === 'plan' && (
                      <div className="text-blue-600">
                        <strong>Plan:</strong> {step.plan}
                      </div>
                    )}
                    {step.type === 'action' && (
                      <div className="text-green-600">
                        <strong>Action:</strong> {step.function}({step.input})
                      </div>
                    )}
                    {step.type === 'observation' && (
                      <div className="text-orange-600">
                        <strong>Observation:</strong> {step.observation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {timestamp && (
          <span className={`text-xs mt-1 block ${isUser ? 'text-indigo-200' : 'text-gray-500'}`}>
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
}