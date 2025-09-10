import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import type { ChatMessage } from './index';

interface ChatbotProps {
  onClose: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => { 
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'model', parts: [{ text: "Hello! I'm LearnSphere Tutor." }] }]); 
  const [input, setInput] = useState(''); 
  const [isLoading, setIsLoading] = useState(false); 
  const messagesEndRef = useRef<HTMLDivElement>(null); 
  
  useEffect(() => { 
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages]); 
  
  const handleSendMessage = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (!input.trim() || isLoading) return; 
    
    const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] }; 
    setMessages(prev => [...prev, userMessage]); 
    setInput(''); 
    setIsLoading(true); 
    
    try { 
      const response = await axios.post<{ reply: string }>('http://localhost:5001/api/chat', { 
        message: input, 
        history: messages 
      }); 
      const modelMessage: ChatMessage = { 
        role: 'model', 
        parts: [{ text: response.data.reply }] 
      }; 
      setMessages(prev => [...prev, modelMessage]); 
    } catch (error: any) { 
      const serverErrorMessage = error.response?.data?.message || "Sorry, I'm having trouble connecting."; 
      const errorMessage: ChatMessage = { 
        role: 'model', 
        parts: [{ text: serverErrorMessage }] 
      }; 
      setMessages(prev => [...prev, errorMessage]); 
    } finally { 
      setIsLoading(false); 
    } 
  }; 
  
  return ( 
    <div className="fixed bottom-24 right-5 w-96 h-[60vh] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 flex justify-between items-center rounded-t-lg">
        <h3 className="text-lg font-bold text-white">AI Tutor</h3>
        <button 
          onClick={onClose} 
          className="text-white hover:text-gray-200 text-2xl leading-none"
        >
          &times;
        </button>
      </header>
      
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`mb-3 p-3 rounded-lg max-w-[85%] ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white ml-auto' 
                : 'bg-white border border-gray-200 shadow-sm'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">
              {msg.parts[0].text}
            </p>
          </div>
        ))}
        
        {isLoading && (
          <div className="bg-white p-3 rounded-lg max-w-[85%] border border-gray-200 shadow-sm">
            <p className="text-gray-600 text-sm italic">Tutor is typing...</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white">
        <div className="flex items-center bg-gray-100 rounded-lg border border-gray-200">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Ask a question..." 
            className="w-full bg-transparent p-2 text-gray-800 focus:outline-none" 
            disabled={isLoading} 
          />
          <button 
            type="submit" 
            className="p-2 text-blue-600 hover:text-blue-700 rounded-lg m-1" 
            disabled={isLoading}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 rotate-90" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
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
  ); 
};

export default Chatbot;