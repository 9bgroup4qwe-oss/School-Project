'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { QuickReplies } from './QuickReplies';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  quickReplies?: string[];
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onQuickReply: (reply: string) => void;
  isGenerating: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function ChatInterface({
  messages,
  onSendMessage,
  onQuickReply,
  isGenerating,
  messagesEndRef
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isGenerating) {
      onSendMessage(inputValue);
      setInputValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleQuickReplyClick = (reply: string) => {
    if (!isGenerating) {
      onQuickReply(reply);
    }
  };

  const latestMessage = messages[messages.length - 1];

  return (
    <div className="chat-interface">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="ai-avatar">
          <Bot size={24} />
        </div>
        <div className="ai-info">
          <h3 className="ai-name">AI Assistant</h3>
          <p className="ai-status">
            {isGenerating ? 'Thinking...' : 'Online'}
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="chat-messages">
        <div className="messages-list">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLast={index === messages.length - 1}
            />
          ))}

          {/* Typing Indicator */}
          {isGenerating && (
            <div className="typing-indicator">
              <div className="typing-avatar">
                <Bot size={20} />
              </div>
              <div className="typing-bubble">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Replies */}
      {latestMessage?.type === 'ai' && latestMessage.quickReplies && !isGenerating && (
        <QuickReplies
          replies={latestMessage.quickReplies}
          onReply={handleQuickReplyClick}
        />
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="chat-input-container">
        <div className="chat-input-wrapper">
          <div className="input-avatar">
            <User size={20} />
          </div>
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="chat-input"
            rows={1}
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isGenerating}
            className="send-button"
          >
            {isGenerating ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}