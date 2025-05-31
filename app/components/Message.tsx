'use client';

interface MessageProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
}

export default function Message({ content, isUser, timestamp }: MessageProps) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[90%] rounded-lg p-2.5 ${
          isUser
            ? 'bg-indigo-600 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none'
        }`}
      >
        <p className="text-sm">{content}</p>
        {timestamp && (
          <span className={`text-xs mt-1 block ${isUser ? 'text-indigo-200' : 'text-gray-500'}`}>
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
}