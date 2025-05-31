'use client';

import { useState, useEffect } from 'react';
import Message from './Message';
import Image from 'next/image';

interface Message {
  id: number;
  content: string;
  isUser: boolean;
  timestamp: string;
}

export default function Sidebar() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: 'Hello! How can I help you today?',
      isUser: false,
      timestamp: '9:00 AM'
    }, {
      id: 2,
      content: 'I\'m here to assist you with your data analysis needs. What do you need help with?',
      isUser: false,
      timestamp: '9:01 AM'
    }, {
      id: 3,
      content: 'I need help with data visualization. Can you provide me with some sample data?',
      isUser: true,
      timestamp: '9:03 AM'
    }, {
      id: 4,
      content: 'Sure! Here is some sample data:',
      isUser: false,
      timestamp: '9:04 AM'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const main = document.querySelector('main');
    if (main) {
      main.dataset.expanded = (!isCollapsed).toString();
    }
  }, [isCollapsed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      content: inputMessage,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');
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
            alt="AI Assistant"
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="ml-2 font-semibold text-gray-900">AI Assistant</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5 space-y-4">
          {messages.map((message) => (
            <Message
              key={message.id}
              content={message.content}
              isUser={message.isUser}
              timestamp={message.timestamp}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Enter a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              title='submit'
              disabled={!inputMessage.trim()}
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