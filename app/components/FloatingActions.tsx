"use client";

import React, { useState } from 'react';

interface FloatingActionsProps {
  onShowSuggestions: () => void;
  onClearChat: () => void;
  onExportChat: () => void;
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({
  onShowSuggestions,
  onClearChat,
  onExportChat
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: "💡",
      label: "Show Suggestions",
      onClick: () => {
        onShowSuggestions();
        setIsOpen(false);
      }
    },
    {
      icon: "🗑️",
      label: "Clear Chat",
      onClick: () => {
        onClearChat();
        setIsOpen(false);
      }
    },
    {
      icon: "📄",
      label: "Export Chat",
      onClick: () => {
        onExportChat();
        setIsOpen(false);
      }
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action buttons */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-2 animate-in slide-in-from-bottom-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="flex items-center space-x-2 bg-white shadow-lg rounded-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors border"
            >
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
      
      {/* Main FAB */}
      <button
        title='open or not'
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center ${
          isOpen ? 'rotate-45' : ''
        }`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
  );
};
