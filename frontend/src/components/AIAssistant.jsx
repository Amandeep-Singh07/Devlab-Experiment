import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiX, FiSend, FiLoader } from 'react-icons/fi';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import './AIAssistant.css';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useContext(AuthContext);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Don't show the widget if the user is not logged in
  if (!user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const context = window.location.pathname.includes('/experiment/') 
        ? `User is currently viewing an experiment at ${window.location.pathname}.`
        : `User is navigating the DevLab dashboard.`;

      const response = await api.post('/ai/ask', {
        prompt: userMessage,
        context: context
      });

      setMessages(prev => [...prev, { role: 'ai', content: response.data.text }]);
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage = error.response?.data?.message || 'Sorry, I encountered an error while processing your request. Please ensure your Gemini API key is configured.';
      setMessages(prev => [...prev, { role: 'ai', content: errorMessage, isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatText = (text) => {
    let formattedText = text;
    formattedText = formattedText.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    formattedText = formattedText.replace(/`([^`]+)`/g, '<code>$1</code>');
    formattedText = formattedText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/\n/g, '<br />');
    
    return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  return (
    <div className="ai-assistant-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="ai-chat-window"
          >
            <div className="ai-chat-header">
              <div className="ai-chat-title">
                <FiMessageSquare className="ai-icon" />
                <span>DevLab AI</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="ai-close-btn">
                <FiX />
              </button>
            </div>
            
            <div className="ai-chat-messages">
              {messages.length === 0 ? (
                <div className="ai-welcome-message">
                  👋 Hi {user.name}! I'm your DevLab AI Assistant. Ask me to explain an error, compare technologies, or help you understand an experiment.
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`ai-message ${msg.role === 'user' ? 'user-message' : 'ai-response'} ${msg.isError ? 'ai-error' : ''}`}>
                    {msg.role === 'ai' ? formatText(msg.content) : msg.content}
                  </div>
                ))
              )}
              {isLoading && (
                <div className="ai-message ai-response ai-loading">
                  <FiLoader className="spin-icon" /> Thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="ai-chat-input-form">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something..."
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading || !input.trim()}>
                <FiSend />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="ai-fab-button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FiX size={24} /> : <FiMessageSquare size={24} />}
      </motion.button>
    </div>
  );
};

export default AIAssistant;
