// src/components/ChatMessage.jsx
import ReactMarkdown from 'react-markdown';

export default function ChatMessage({ message, isUser }) {
  const wrapperClasses = `flex items-start gap-3 ${isUser ? 'justify-end' : ''}`;
  const bubbleClasses = `max-w-xl p-4 rounded-lg shadow-md prose prose-invert prose-p:my-0 prose-headings:my-1
    ${isUser ? 'bg-gray-700 text-white' : 'bg-blue-900/50 text-gray-200'}`;
  
  // A simple user icon
  const UserIcon = () => (
    <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0"></div>
  );
  
  // A simple AI icon
  const AiIcon = () => (
    <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0"></div>
  );

  return (
    <div className={wrapperClasses}>
      {!isUser && <AiIcon />}
      <div className={bubbleClasses}>
        <ReactMarkdown>{message}</ReactMarkdown>
      </div>
      {isUser && <UserIcon />}
    </div>
  );
}