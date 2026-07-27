'use client';

import { useState } from 'react';

interface QuickRepliesProps {
  replies: string[];
  onReply: (reply: string) => void;
}

export function QuickReplies({ replies, onReply }: QuickRepliesProps) {
  const [selectedReply, setSelectedReply] = useState<string | null>(null);

  const handleReplyClick = (reply: string) => {
    setSelectedReply(reply);
    setTimeout(() => {
      onReply(reply);
      setSelectedReply(null);
    }, 200);
  };

  return (
    <div className="quick-replies">
      <div className="quick-replies-container">
        {replies.map((reply, index) => (
          <button
            key={reply}
            onClick={() => handleReplyClick(reply)}
            className={`quick-reply-button ${selectedReply === reply ? 'selected' : ''}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {reply}
          </button>
        ))}
      </div>
    </div>
  );
}