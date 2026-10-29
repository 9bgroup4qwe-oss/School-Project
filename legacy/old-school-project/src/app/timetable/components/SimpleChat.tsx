'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Download, Copy, CheckCircle, Clock, Calendar, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  extractedData?: any;
}

interface ExtractedInfo {
  classes: Array<{
    subject: string;
    day: string;
    startTime: string;
    endTime: string;
    location?: string;
  }>;
  activities: Array<{
    name: string;
    days: string[];
    startTime: string;
    endTime: string;
  }>;
  preferences: {
    studyTime: string;
    studyHours: number;
    wakeTime: string;
    sleepTime: string;
    difficultSubjects: string[];
  };
  schoolInfo: {
    type: string;
    grade: string;
  };
}

export function SimpleChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<ExtractedInfo>({
    classes: [],
    activities: [],
    preferences: {
      studyTime: '',
      studyHours: 3,
      wakeTime: '07:00',
      sleepTime: '22:00',
      difficultSubjects: []
    },
    schoolInfo: {
      type: '',
      grade: ''
    }
  });
  const [generatedTimetable, setGeneratedTimetable] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      type: 'ai',
      content: "Hello! I'm here to help you create your perfect timetable. Just tell me about your schedule in simple terms. For example:\n\n• \"I have math class on Monday at 9 AM\"\n• \"I play basketball on Wednesdays from 4-6 PM\"\n• \"I like studying in the evening for 2 hours\"\n\nWhat's your schedule like?",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call AI API
      const response = await fetch('/api/ai/timetable/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputValue,
          conversationHistory: messages.slice(-10).map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          currentInfo: extractedInfo
        })
      });

      const data = await response.json();

      // Update extracted info if provided
      if (data.extractedInfo) {
        setExtractedInfo(prev => ({
          classes: [...(prev.classes || []), ...(data.extractedInfo.data?.classes || [])],
          activities: [...(prev.activities || []), ...(data.extractedInfo.data?.activities || [])],
          preferences: {
            ...(prev.preferences || {}),
            ...(data.extractedInfo.data?.preferences || {})
          },
          schoolInfo: {
            ...(prev.schoolInfo || {}),
            ...(data.extractedInfo.data?.schoolInfo || {})
          }
        }));
      }

      // Create AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response,
        timestamp: new Date(),
        extractedData: data.extractedInfo
      };

      setMessages(prev => [...prev, aiMessage]);

      // Generate timetable if AI has enough info
      if (data.shouldGenerate && data.timetable) {
        setGeneratedTimetable(data.timetable);

        const finalMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: "Perfect! I've generated your timetable based on everything you've told me. You can copy it as JSON or download it. Is there anything you'd like to change?",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, finalMessage]);
      }
    } catch (error) {
      console.error('Error:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm having trouble right now. Could you try again, or tell me your schedule in a different way?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = async () => {
    if (generatedTimetable) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(generatedTimetable, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const downloadJSON = () => {
    if (generatedTimetable) {
      const blob = new Blob([JSON.stringify(generatedTimetable, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `timetable-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const regenerateTimetable = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/timetable/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Please generate the timetable now with all the information I have provided',
          conversationHistory: messages.slice(-10).map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          currentInfo: extractedInfo,
          generateNow: true
        })
      });

      const data = await response.json();
      if (data.timetable) {
        setGeneratedTimetable(data.timetable);

        const message: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: "I've updated your timetable with the latest information!",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, message]);
      }
    } catch (error) {
      console.error('Error regenerating:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick suggestion buttons
  const suggestions = [
    "Tell me about your classes",
    "What are your study habits?",
    "Do you have any activities?",
    "Generate my timetable"
  ];

  const handleSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Chat Section */}
      <div className="flex-1 flex flex-col bg-gray-800/50 rounded-xl border border-gray-700">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Timetable Assistant</h3>
              <p className="text-xs text-gray-400">Tell me about your schedule</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                <div
                  className={`p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1 px-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {message.type === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-400 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestion(suggestion)}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tell me about your schedule..."
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              className="bg-blue-600 hover:bg-blue-700 px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="w-80 space-y-4">
        {/* Extracted Information */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Your Information
          </h3>

          <div className="space-y-3 text-sm">
            {extractedInfo?.schoolInfo?.type && (
              <div>
                <p className="text-gray-400">School:</p>
                <p className="text-white">{extractedInfo.schoolInfo.type} - {extractedInfo.schoolInfo.grade || 'Grade not specified'}</p>
              </div>
            )}

            {extractedInfo?.classes && extractedInfo.classes.length > 0 && (
              <div>
                <p className="text-gray-400 mb-1">Classes ({extractedInfo.classes.length}):</p>
                <div className="space-y-1">
                  {extractedInfo.classes.map((cls, idx) => (
                    <div key={idx} className="text-white text-xs bg-gray-700/50 p-2 rounded">
                      <p className="font-medium">{cls.subject}</p>
                      <p className="text-gray-400">{cls.day} • {cls.startTime} - {cls.endTime}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {extractedInfo?.activities && extractedInfo.activities.length > 0 && (
              <div>
                <p className="text-gray-400 mb-1">Activities ({extractedInfo.activities.length}):</p>
                <div className="space-y-1">
                  {extractedInfo.activities.map((act, idx) => (
                    <div key={idx} className="text-white text-xs bg-gray-700/50 p-2 rounded">
                      <p className="font-medium">{act.name}</p>
                      <p className="text-gray-400">{act.days?.join(', ') || 'Days not specified'} • {act.startTime} - {act.endTime}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {extractedInfo?.preferences?.studyTime && (
              <div>
                <p className="text-gray-400">Study Preferences:</p>
                <p className="text-white text-xs">
                  {extractedInfo.preferences.studyTime} • {extractedInfo.preferences.studyHours || 3}h/day
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Generated Timetable */}
        {generatedTimetable && (
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Timetable Generated
            </h3>

            <div className="space-y-2">
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                {copied ? <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy JSON'}
              </Button>

              <Button
                onClick={downloadJSON}
                size="sm"
                className="w-full justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Download File
              </Button>

              <Button
                onClick={regenerateTimetable}
                variant="outline"
                size="sm"
                className="w-full justify-start"
                disabled={isLoading}
              >
                <Clock className="w-4 h-4 mr-2" />
                Update Timetable
              </Button>
            </div>

            <div className="mt-3 p-2 bg-gray-900/50 rounded max-h-40 overflow-y-auto">
              <pre className="text-xs text-gray-400">
                {JSON.stringify(generatedTimetable, null, 2).substring(0, 500)}
                {JSON.stringify(generatedTimetable, null, 2).length > 500 && '...'}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}