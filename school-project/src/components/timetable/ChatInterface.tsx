'use client';

import { useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Message } from '@/types/timetable';
import { Button } from '@/components/ui/button';

interface ChatInterfaceProps {
  showChat: boolean;
  messages: Message[];
  inputValue: string;
  isLoading: boolean;
  timetable: any;
  onShowChatChange: (show: boolean) => void;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onCopy?: () => void;
  onDownload?: () => void;
  copied?: boolean;
}

export function ChatInterface({
  showChat,
  messages,
  inputValue,
  isLoading,
  timetable,
  onShowChatChange,
  onInputChange,
  onSendMessage,
  onKeyPress,
  onCopy,
  onDownload,
  copied
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!showChat) return null;

  return (
    <div className="ai-chat-overlay">
      <div className="ai-chat-panel">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Assistant</h3>
              <p className="text-xs text-gray-400">
                {timetable ? 'Modify your timetable' : 'Create your timetable'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onShowChatChange(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-welcome">
              <p>Hi! I can help you {timetable ? 'modify' : 'create'} your timetable.</p>
              <p className="text-sm text-gray-400 mt-2">
                {timetable
                  ? 'Try: "Move math to 10 AM" or "Add study time on Tuesday"'
                  : 'Tell me about your classes and schedule'}
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.type === 'user' ? 'user-message' : 'ai-message'}`}
            >
              <div className="message-content">
                <p>{message.content}</p>
              </div>
              <p className="message-time">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))}

          {isLoading && (
            <div className="message ai-message">
              <div className="typing-indicator">
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

        {/* Actions */}
        {timetable && onCopy && onDownload && (
          <div className="chat-actions">
            <Button
              onClick={onCopy}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {copied ? 'Copied!' : 'Copy JSON'}
            </Button>
            <Button
              onClick={onDownload}
              size="sm"
              className="flex-1"
            >
              Download
            </Button>
          </div>
        )}

        {/* Input */}
        <div className="chat-input">
          <div className="input-wrapper">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder={
                timetable
                  ? "What would you like to change?"
                  : "Tell me about your schedule..."
              }
              className="chat-input-field"
              disabled={isLoading}
            />
            <button
              onClick={onSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="send-button"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}