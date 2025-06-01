'use client';

import { useState, useEffect } from 'react';
import Message from './Message';
import Image from 'next/image';
import styles from './loading.module.css';
import { useDashboard } from '../context/DashboardContext';
import BivariateTable from './BivariateTable';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: number;
  content: string;
  isUser: boolean;
  timestamp: string;
  steps?: Array<{
    type: string;
    plan?: string;
    function?: string;
    input?: string;
    observation?: string;
    output?: string;
  }>;
}

export default function Sidebar() {
  const { addAnalysisResult } = useDashboard();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: 'Hello! I\'m an AI Statistical Analysis Assistant specialized in the Iris dataset. I can help you analyze the famous iris flower dataset with 150 samples across 3 species.\n\n🌸 **Try asking me:**\n• "What are the statistics for sepal length?"\n• "Show me the species distribution"\n• "Compare petal width across different species"\n• "Give me a dataset summary"\n• "Mean of each species" (shows all 4 feature means)\n• "What correlations exist between features?"\n• "Show me bivariate correlations for the dataset"',
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const main = document.querySelector('main');
    if (main) {
      main.dataset.expanded = (!isCollapsed).toString();
    }
  }, [isCollapsed]);
  const formatResponse = (response: any): string => {
    if (typeof response === 'string') return response;
    if (typeof response === 'object' && response !== null) {
      const sections = Object.entries(response).map(([key, value]) => {
        let content = '';
        if (Array.isArray(value)) {
          content = value.map(item => `- ${item}`).join('\n');
        } else if (typeof value === 'object' && value !== null) {
          content = Object.entries(value)
            .map(([k, v]) => `- **${k}**: ${v}`)
            .join('\n');
        } else {
          content = String(value);
        }
        return `## ${key}\n\n${content}`;
      });
      return sections.join('\n\n');
    }
    return String(response);
  };

  const addAnalysisResultToDashboard = (query: string, response: any, steps: any[]) => {
    const queryLower = query.toLowerCase();
    const responseStr = formatResponse(response);
    const responseLower = responseStr.toLowerCase();
    
    // Detect bivariate/correlation analysis
    if (queryLower.includes('correlation') || queryLower.includes('bivariate') || 
        responseLower.includes('correlation matrix') || responseLower.includes('bivariate')) {
      addAnalysisResult({
        type: 'bivariate',
        title: 'Bivariate Correlation Analysis',
        component: <BivariateTable showOnMount={true} />,
        query: query
      });
    }
    // Detect feature statistics
    else if (queryLower.includes('statistics') || queryLower.includes('mean') || 
             queryLower.includes('standard deviation') || queryLower.includes('feature')) {
      addAnalysisResult({
        type: 'feature',
        title: 'Feature Statistics Analysis',
        component: (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{responseStr}</ReactMarkdown>
          </div>
        ),
        query: query
      });
    }
    // Detect species comparison or any other type
    else {
      addAnalysisResult({
        type: 'summary',
        title: 'Analysis Result',
        component: (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{responseStr}</ReactMarkdown>
          </div>
        ),
        query: query
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      content: inputMessage,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentMessage = inputMessage;
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.isUser ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          conversationHistory
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (!data.reply) {
        throw new Error('No reply received from AI Agent');
      }      const aiMessage: Message = {
        id: Date.now(),
        content: typeof data.reply === 'string' ? data.reply : data.reply,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        steps: data.steps || []
      };

      setMessages(prev => [...prev, aiMessage]);
      addAnalysisResultToDashboard(currentMessage, data.reply, data.steps);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: Date.now(),
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className={`fixed left-0 top-16 bottom-0 bg-white z-10 transition-all duration-300 ${isCollapsed ? 'w-12' : 'w-[300px]'} border-r border-gray-200`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute right-2 top-3 transform w-8 h-8 bg-white cursor-pointer flex items-center justify-center hover:bg-gray-50 transition-colors z-20"
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <svg
          className={`w-4 h-4 text-gray-800 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : 'rotate-0'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <div className={`flex flex-col h-full ${isCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'} transition-all duration-200`}>
        <div className="flex items-center p-2.5 border-b border-gray-200">
          <Image
            src="/avatar.png"
            alt="Statistical Analysis Assistant"
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="ml-2 font-semibold text-gray-900">Statistical Analysis Assistant</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5 space-y-4">
          {messages.map((message) => (
            <Message
              key={message.id}
              content={message.content}
              isUser={message.isUser}
              timestamp={message.timestamp}
              steps={message.steps}
            />
          ))}
          {isLoading && (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingDots}>
                <div className={styles.loadingDot}></div>
                <div className={styles.loadingDot}></div>
                <div className={styles.loadingDot}></div>
              </div>
              <span className={styles.loadingText}>AI Agent is thinking...</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isLoading ? "AI Agent is processing..." : "Enter a message..."}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              title='submit'
              disabled={!inputMessage.trim() || isLoading}
              type="submit"
              className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </aside>
  );
}