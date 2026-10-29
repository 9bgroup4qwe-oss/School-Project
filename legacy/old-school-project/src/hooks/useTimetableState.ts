import { useState, useEffect } from 'react';
import { TimetableData, TimetableState, ChatState, Message } from '@/types/timetable';
import { timetableAPI } from '@/services/timetableAPI';

export function useTimetableState() {
  // Timetable state
  const [timetable, setTimetable] = useState<TimetableData | null>(null);
  const [timetableId, setTimetableId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load active timetable on mount
  useEffect(() => {
    loadActiveTimetable();
  }, []);

  const loadActiveTimetable = async () => {
    try {
      const data = await timetableAPI.loadActiveTimetable();
      if (data) {
        setTimetable(data);
        setTimetableId(data.id || null);
      }
    } catch (error) {
      console.error('Error loading timetable:', error);
    }
  };

  const saveTimetable = async (timetableData: Partial<TimetableData>) => {
    setIsSaving(true);
    try {
      const saved = await timetableAPI.saveTimetable(timetableData, timetableId || undefined);
      setTimetable(saved);
      setTimetableId(saved.id || null);

      // Show success notification
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      return saved;
    } catch (error) {
      console.error('Error saving timetable:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const updateTimetable = (newTimetable: TimetableData) => {
    setTimetable(newTimetable);
  };

  const copyToClipboard = async () => {
    if (timetable) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(timetable, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
        return true;
      } catch (err) {
        console.error('Failed to copy:', err);
        return false;
      }
    }
    return false;
  };

  const downloadJSON = async () => {
    if (!timetableId) return;

    try {
      const blob = await timetableAPI.exportTimetable(timetableId, 'json');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `timetable-${timetableId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading timetable:', error);
    }
  };

  return {
    // State
    timetable,
    timetableId,
    isSaving,
    showSuccess,
    copied,

    // Actions
    loadActiveTimetable,
    saveTimetable,
    updateTimetable,
    copyToClipboard,
    downloadJSON,
    setShowSuccess
  };
}

export function useChatState(timetable: TimetableData | null, onSave: (data: TimetableData) => Promise<void>) {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
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
      const data = await timetableAPI.updateTimetableWithAI(inputValue, timetable);

      // Always update timetable if provided
      if (data.timetable) {
        await onSave(data.timetable);

        // Close chat after successful update
        setTimeout(() => {
          setShowChat(false);
        }, 2000);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm having trouble with that request. Could you try again with different wording?",
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
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setMessages([]);
    setInputValue('');
  };

  return {
    showChat,
    messages,
    inputValue,
    isLoading,
    setShowChat,
    setInputValue,
    handleSendMessage,
    handleKeyPress,
    resetChat
  };
}