'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Trash2,
  Minimize2,
  Maximize2,
  Copy,
  Check,
} from 'lucide-react';
import type { AIMessage } from '@nexora/types';
import {
  sendAIChatMessage,
  AI_SUGGESTION_CHIPS,
  INITIAL_ASSISTANT_MESSAGES,
} from '@nexora/api';
import { Button } from './button';

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>(INITIAL_ASSISTANT_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMessage: AIMessage = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendAIChatMessage({ message: text.trim() });
      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.warn('AI chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue connecting to the AI inference gateway. Please try again.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages(INITIAL_ASSISTANT_MESSAGES);
  };

  return (
    <>
      {/* Floating Trigger Pill */}
      {!isOpen && (
        <aside
          aria-label="Ask NEXORA AI"
          className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom duration-300"
        >
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Assistant"
            className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 text-white font-bold text-xs shadow-2xl shadow-indigo-600/40 hover:shadow-indigo-600/60 hover:scale-105 active:scale-95 transition-all border border-indigo-400/30"
          >
            <div className="relative">
              <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
            </div>
            <span>Ask NEXORA AI</span>
          </button>
        </aside>
      )}

      {/* Chat Window */}
      {isOpen && (
        <aside
          aria-label="AI Assistant Dialog"
          className={`fixed bottom-6 right-6 z-50 rounded-3xl bg-[#0B0F19]/95 border border-indigo-500/30 shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95 ${
            isExpanded
              ? 'w-[90vw] md:w-[680px] h-[85vh]'
              : 'w-[90vw] sm:w-[420px] h-[580px]'
          }`}
        >
          {/* Header */}
          <div className="px-5 py-4 bg-[#0F172A] border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-white">NEXORA AI</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                    v2.0
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block">Ecosystem Autonomous Co-Pilot</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                title="Clear Chat"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Clear chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Collapse' : 'Expand'}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors hidden sm:block"
                aria-label={isExpanded ? 'Collapse window' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Close assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`group relative max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium'
                      : 'bg-[#0F172A] border border-white/10 text-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-line prose prose-invert prose-xs max-w-none">
                    {msg.content}
                  </div>

                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => handleCopyMessage(msg.content, idx)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-white rounded"
                      aria-label="Copy response"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-slate-300 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-xs text-indigo-400 pl-8">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>NEXORA AI is synthesizing ecosystem intelligence...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-4 py-2 border-t border-white/5 bg-[#0F172A]/50 flex gap-1.5 overflow-x-auto no-scrollbar">
            {AI_SUGGESTION_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:border-indigo-500/40 text-[11px] text-slate-300 hover:text-white transition-all text-left"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#0F172A] border-t border-white/5 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about architecture, services, RBAC..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!input.trim() || isLoading}
              className="text-xs shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </aside>
      )}
    </>
  );
}
