import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

export default function ChatPanel({ messages, onSendMessage, currentUser }) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-1/2 border-t-2 border-gray-300">
      <div className="px-4 py-3 border-b-2 border-gray-300">
        <h3 className="font-bold">Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col ${msg.user?._id === currentUser?._id ? 'items-end' : 'items-start'}`}
          >
            <span className="text-xs text-gray-600 mb-1">
              {msg.userName || msg.user?.name}
            </span>
            <div
              className={`px-3 py-2 rounded-lg max-w-[80%] ${
                msg.user?._id === currentUser?._id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t-2 border-gray-300">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
