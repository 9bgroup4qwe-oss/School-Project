import { Bot, User, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  quickReplies?: string[];
}

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
}

export function MessageBubble({ message, isLast }: MessageBubbleProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(message.type === 'ai');

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 50);

    // Typing effect for AI messages
    if (message.type === 'ai') {
      let index = 0;
      const timer = setInterval(() => {
        if (index < message.content.length) {
          setDisplayedContent(message.content.slice(0, index + 1));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(timer);
        }
      }, 20);

      return () => clearInterval(timer);
    } else {
      setDisplayedContent(message.content);
    }
  }, [message]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div
      className={`message-bubble ${message.type} ${isVisible ? 'visible' : ''} ${isLast ? 'last' : ''}`}
    >
      {message.type === 'ai' && (
        <div className="message-avatar">
          <Bot size={20} />
        </div>
      )}

      <div className="message-content">
        <div className="message-bubble-content">
          {isTyping && message.type === 'ai' ? (
            <div className="typing-content">
              {displayedContent}
              <span className="typing-cursor">|</span>
            </div>
          ) : (
            <p>{displayedContent}</p>
          )}
        </div>

        <div className="message-meta">
          <span className="message-time">
            <Clock size={12} />
            {formatTime(message.timestamp)}
          </span>
          <span className="message-sender">
            {message.type === 'ai' ? 'AI Assistant' : 'You'}
          </span>
        </div>
      </div>

      {message.type === 'user' && (
        <div className="message-avatar">
          <User size={20} />
        </div>
      )}
    </div>
  );
}