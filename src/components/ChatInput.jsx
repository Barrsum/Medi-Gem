// src/components/ChatInput.jsx

export default function ChatInput({ input, setInput, handleSubmit, isLoading }) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        handleSubmit(e);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-black/30 border-t border-gray-100/20">
      <div className="relative max-w-4xl mx-auto">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask anything about your symptoms..."
          rows="1"
          className="w-full p-3 pr-20 text-gray-200 bg-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 font-semibold text-black bg-gray-200 rounded-md hover:bg-white disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </div>
    </form>
  );
}