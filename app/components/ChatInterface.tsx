'use client';

import { useState, useRef } from 'react';
import Message from './Message';
import { DataVisualization } from './DataVisualization';
import { ExportTools } from './ExportTools';
import { AnalysisSuggestions } from './AnalysisSuggestions';
import { QuickAnalysis } from './QuickAnalysis';
import { FloatingActions } from './FloatingActions';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  reasoning?: any[];
  visualization?: any;
  exportData?: any;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);  const [showSuggestions, setShowSuggestions] = useState(true);
  const chartRef = useRef<HTMLDivElement>(null);
  const addMessage = (content: string, isUser: boolean, reasoning?: any[], visualization?: any, exportData?: any) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      isUser,
      timestamp: new Date().toLocaleTimeString(),
      reasoning,
      visualization,
      exportData,
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = addMessage(input, true);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Try the main AI API first
      let response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: currentInput,
          messages: messages.map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.content,
          })),
        }),
      });

      // If main API fails with quota/auth issues, try demo mode
      if (!response.ok && (response.status === 429 || response.status === 401)) {
        console.log('Falling back to demo mode due to API limitations');
        response = await fetch('/api/demo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: currentInput,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle specific error types with user-friendly messages
        if (response.status === 429) {
          throw new Error(errorData.userMessage || 'The AI service is temporarily unavailable due to quota limits. Please try again later.');
        } else if (response.status === 401) {
          throw new Error(errorData.userMessage || 'Authentication with the AI service failed. Please check the configuration.');
        } else {
          throw new Error(errorData.userMessage || errorData.error || 'Failed to get response from the AI service');
        }
      }

      const data = await response.json();
      
      // Extract visualization and export data from response
      let visualization = null;
      let exportData = null;
      
      if (data.reasoning) {
        const actionSteps = data.reasoning.filter((step: any) => step.type === 'action');
        actionSteps.forEach((step: any) => {
          if (step.content.includes('visualization') || step.content.includes('chart') || step.content.includes('plot')) {
            // Try to extract visualization parameters from the reasoning
            const content = step.content.toLowerCase();
            if (content.includes('scatter')) {
              visualization = { type: 'scatter', title: 'Data Visualization' };
            } else if (content.includes('histogram') || content.includes('distribution')) {
              visualization = { type: 'bar', title: 'Distribution Analysis' };
            } else if (content.includes('pie')) {
              visualization = { type: 'pie', title: 'Category Distribution' };
            }
          }
          
          if (step.content.includes('export') || step.content.includes('download')) {
            exportData = { results: data.response };
          }
        });
      }
      
      // Add demo mode indicator if applicable
      let replyContent = data.reply;
      if (data.demoMode) {
        replyContent = `🎮 **Demo Mode**: ${data.reply}`;
      }
      
      addMessage(replyContent, false, data.reasoning, visualization, exportData);
    } catch (error) {
      console.error('Error:', error);
      addMessage(
        `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        false
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
  };

  const handleClearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex-none p-4 border-b border-gray-200 bg-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Iris Dataset AI Assistant</h1>
            <p className="text-sm text-gray-600">Ask questions about the Iris dataset and get AI-powered analysis</p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Chat
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>            <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
            <p className="text-gray-600 mb-3">Ask questions about the Iris dataset analysis</p>
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Note:</strong> If OpenAI API quota is exceeded, the system will automatically switch to demo mode with pre-computed examples.
              </p>
            </div>
              {/* Analysis Suggestions */}
            {showSuggestions && (
              <div className="space-y-6">
                <AnalysisSuggestions onSuggestionClick={handleSuggestionClick} />
                <QuickAnalysis onAnalysisClick={handleSuggestionClick} />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              <button
                onClick={() => setInput("What are the basic statistics for sepal length?")}
                className="p-3 text-sm text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                📊 Basic statistics for sepal length
              </button>
              <button
                onClick={() => setInput("Compare the mean petal width across different species")}
                className="p-3 text-sm text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                🌸 Compare species by petal width
              </button>
              <button
                onClick={() => setInput("What is the correlation between sepal length and petal length?")}
                className="p-3 text-sm text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                🔗 Correlation analysis
              </button>
              <button
                onClick={() => setInput("Show me the distribution of species in the dataset")}
                className="p-3 text-sm text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                📈 Species distribution
              </button>
            </div>
          </div>        ) : (
          messages.map((message) => (
            <div key={message.id}>
              <Message
                content={message.content}
                isUser={message.isUser}
                timestamp={message.timestamp}
              />
              
              {/* Show visualization for AI messages if available */}
              {!message.isUser && message.visualization && (
                <div className="ml-4 mt-4" ref={chartRef}>
                  <DataVisualization
                    data={[]} // Will be populated from actual analysis
                    type={message.visualization.type}
                    title={message.visualization.title}
                  />
                </div>
              )}
                {/* Show export tools for AI messages if available */}              {!message.isUser && message.exportData && (
                <div className="ml-4 mt-2">
                  <ExportTools
                    analysisResults={message.exportData.results}
                    chartRef={message.visualization ? chartRef : null}
                  />
                </div>
              )}
              
              {/* Show reasoning steps for AI messages */}
              {!message.isUser && message.reasoning && message.reasoning.length > 0 && (
                <div className="ml-4 mt-2 p-3 bg-gray-50 rounded-lg text-xs">
                  <details className="cursor-pointer">
                    <summary className="font-medium text-gray-700 mb-2">Show reasoning steps</summary>
                    <div className="space-y-2">
                      {message.reasoning.map((step: any, index: number) => {
                        try {
                          const parsed = JSON.parse(step.content);
                          if (parsed.type === 'plan') {
                            return (
                              <div key={index} className="p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                                <div className="font-medium text-blue-800">📋 Plan</div>
                                <div className="text-blue-700">{parsed.plan}</div>
                              </div>
                            );
                          }
                          if (parsed.type === 'action') {
                            return (
                              <div key={index} className="p-2 bg-green-50 rounded border-l-4 border-green-400">
                                <div className="font-medium text-green-800">⚡ Action</div>
                                <div className="text-green-700">
                                  <div className="font-mono">{parsed.function}({JSON.stringify(parsed.input, null, 2)})</div>
                                </div>
                              </div>
                            );
                          }
                          if (parsed.type === 'observation') {
                            return (
                              <div key={index} className="p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                                <div className="font-medium text-yellow-800">👁️ Observation</div>
                                <div className="text-yellow-700">
                                  <pre className="whitespace-pre-wrap font-mono text-xs">
                                    {typeof parsed.observation === 'string' 
                                      ? parsed.observation 
                                      : JSON.stringify(parsed.observation, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            );
                          }
                        } catch (e) {
                          return null;
                        }
                        return null;
                      })}
                    </div>
                  </details>
                </div>
              )}
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 rounded-lg p-3 max-w-[90%]">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-none p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the Iris dataset..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>        <p className="text-xs text-gray-500 mt-2">
          Powered by OpenAI GPT-4o-mini with demo mode fallback • Ask about statistics, correlations, species comparisons, and more
        </p>
      </div>      {/* Floating Actions */}
      <FloatingActions
        onShowSuggestions={() => setShowSuggestions(true)}
        onClearChat={handleClearChat}
        onExportChat={() => {
          const lastMessage = messages[messages.length - 1];
          if (lastMessage && !lastMessage.isUser && lastMessage.exportData) {
            // Trigger export functionality
            console.log('Export triggered for:', lastMessage.exportData);
          }
        }}
      />
    </div>
  );
}
