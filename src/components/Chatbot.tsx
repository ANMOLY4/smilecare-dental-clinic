import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Smile, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

// @ts-ignore
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

// Note: Ensure VITE_GEMINI_API_KEY or use process.env.GEMINI_API_KEY if proxied via vite.config.ts define
// In the current setup, process.env.GEMINI_API_KEY is defined in vite.config.ts.
const apiKey = typeof process.env !== 'undefined' && process.env.GEMINI_API_KEY 
  ? process.env.GEMINI_API_KEY 
  // @ts-ignore
  : import.meta.env.VITE_GEMINI_API_KEY;

const aiClient = new GoogleGenAI({ apiKey: apiKey || '' });

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: "Hi! I'm the SmileCare virtual assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      
      const chat = await aiClient.chats.create({
         model: 'gemini-2.5-flash',
         config: {
           systemInstruction: "You are a helpful, polite, and professional front-desk assistant for SmileCare Dental Point in Raipur, owned by Dr. Neha Sahu. The clinic is located at Shankar Nagar, Raipur. Phone: +91 9874512301. Email: smilecare.raipur@gmail.com. You help users understand dental services, book appointments, and answer general clinic queries. Keep your responses concise and friendly."
         }
      });
      
      // Simulate providing history by generating from the last user message + context
      // Note: Ideally we restore history, but for simplicity we'll just send a direct message
      // and append recent dialog context in the prompt if we didn't use the create() method properly.
      // But the chat instance holds history, let's just make a stateless generateContent call with full history.
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          ...history,
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
           systemInstruction: "You are a helpful, polite, and professional front-desk assistant for SmileCare Dental Point in Raipur, owned by Dr. Neha Sahu. The clinic is located at Shankar Nagar, Raipur. Phone: +91 9874512301. Email: smilecare.raipur@gmail.com. You help users understand dental services (General, Cosmetic, Root Canal, Orthodontics, Implants, Pediatric), book appointments, and answer general clinic queries. Keep your responses concise and friendly."
        }
      });

      if (response.text) {
        setMessages(prev => [...prev, { role: 'model', content: response.text! }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting right now. Please call us at +91 9874512301." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        initial={{ scale: 0 }}
        animate={{ scale: isOpen ? 0 : 1 }}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-purple-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-purple-700 transition-colors z-50 ${isOpen ? 'pointer-events-none' : ''}`}
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[550px] max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-purple-600 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <Smile className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">SmileCare Assistant</h3>
                  <p className="text-xs text-purple-100">Usually replies instantly</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-purple-600 text-white rounded-br-sm' 
                      : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-2 shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                    <span className="text-xs text-gray-500">Typing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleSend} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
