// src/pages/ChatPage.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Set up EventSource to receive streaming data from the server
      const eventSource = new EventSource('http://localhost:3001/api/chat');
      let fullResponse = '';

      // Send the entire conversation history to the backend
      const conversationHistory = [...messages, userMessage];
      const response = await fetch('http://localhost:3001/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: conversationHistory }),
      });

      if (!response.ok || !response.body) {
          throw new Error('Failed to get streaming response.');
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let firstChunk = true;

      const processStream = async () => {
          while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n\n');
              
              for (const line of lines) {
                  if (line.startsWith('data: ')) {
                      const data = JSON.parse(line.substring(6));
                      fullResponse += data.content;
                      
                      if (firstChunk) {
                          // On the first chunk, create the AI message
                          setMessages(prev => [...prev, { role: 'assistant', content: fullResponse }]);
                          firstChunk = false;
                      } else {
                          // On subsequent chunks, update the last AI message
                          setMessages(prev => {
                              const newMessages = [...prev];
                              newMessages[newMessages.length - 1].content = fullResponse;
                              return newMessages;
                          });
                      }
                  }
              }
          }
          setIsLoading(false);
      };

      processStream();

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again later." }]);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
        <header className="flex justify-between items-center p-4 bg-black/30 border-b border-gray-100/20">
            <h1 className="text-xl font-bold text-gray-100">AI Medical Assistant</h1>
            <Link to="/" className="text-sm text-gray-300 hover:underline">← Back to Dashboard</Link>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400">
                        <p>Welcome to MEDI-GEM AI Chat.</p>
                        <p className="text-sm">You can start by describing your symptoms.</p>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <ChatMessage key={index} message={msg.content} isUser={msg.role === 'user'} />
                ))}
                {isLoading && <ChatMessage message="..." isUser={false} />}
                <div ref={messagesEndRef} />
            </div>
        </main>
        
        <ChatInput
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
        />
    </div>
  );
}