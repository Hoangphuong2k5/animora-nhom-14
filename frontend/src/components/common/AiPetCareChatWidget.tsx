'use client';

import React, { useRef, useState } from 'react';
import {
  ArrowRight,
  Loader2,
  MessageCircle,
  PhoneCall,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import type { Language } from '@/types';
import { CONTACT_INFO } from '@/constants/contact.constant';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  type AiChatMessage,
  sendPetCareChatMessage,
} from '@/services/animora/aiChatPlaceholder';

const ANIMORA_LOGO_SRC = '/assets/images/animora_pet_logo_1793179870995.jpg';

interface AiPetCareChatWidgetProps {
  lang: Language;
  onNavigateUrl: (path: string) => void;
}

const QUICK_PROMPTS_VI = [
  'Lịch tiêm phòng cho chó mèo con?',
  'Bé bị nôn hoặc ngứa phải làm sao?',
  'Chính sách hủy và đổi lịch hẹn?',
];

const QUICK_PROMPTS_EN = [
  'Vaccination schedule for puppies/kittens?',
  'What if my pet is vomiting or itching?',
  'Booking cancellation & reschedule policy?',
];

export const AiPetCareChatWidget = ({
  lang,
  onNavigateUrl,
}: AiPetCareChatWidgetProps) => {
  const isVi = lang === 'vi';
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const msgSeqRef = useRef(1);
  const [messages, setMessages] = useState<AiChatMessage[]>(() => [
    {
      id: 'ai-welcome',
      role: 'assistant',
      content: isVi
        ? 'Xin chào! Tôi là Trợ lý AI Animora. Bạn cần hỏi đáp nhanh gì về chăm sóc bé cưng hôm nay?'
        : 'Hello! I am Animora AI Assistant. How can I help with your pet care today?',
      createdAt: '',
    },
  ]);

  const listEndRef = useRef<HTMLDivElement | null>(null);

  const handleSend = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || isSending) return;

    const userMsg: AiChatMessage = {
      id: `u-${msgSeqRef.current++}`,
      role: 'user',
      content: trimmed,
      createdAt: '',
    };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setIsSending(true);

    try {
      const reply = await sendPetCareChatMessage(trimmed, nextHistory, lang);
      const assistantMsg: AiChatMessage = {
        ...reply,
        id: `a-${msgSeqRef.current++}`,
        createdAt: '',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsSending(false);
      setTimeout(() => {
        listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    }
  };

  return (
    <div
      className={`fixed right-5 z-[60] flex flex-col items-end gap-3 ${
        process.env.NODE_ENV === 'production' ? 'bottom-5' : 'bottom-16'
      }`}
    >
      {isOpen && (
        <section
          data-testid="ai-pet-chatbox"
          aria-label={isVi ? 'Chat hỗ trợ AI Animora' : 'Animora AI Support Chat'}
          className="w-[calc(100vw-2.5rem)] sm:w-[370px] h-[460px] max-h-[calc(100dvh-var(--nav-h,72px)-9.5rem)] rounded-[24px] border shadow-2xl flex flex-col overflow-hidden"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3.5 flex items-center justify-between gap-2 shrink-0"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--on-primary)',
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/80 bg-white flex items-center justify-center shrink-0 shadow-sm">
                <img
                  src={ANIMORA_LOGO_SRC}
                  alt="Animora Logo"
                  className="w-full h-full object-cover !filter-none"
                />
              </div>
              <div className="min-w-0">
                <div className="font-heading text-sm font-extrabold truncate">
                  {isVi ? 'Trợ lý AI Chăm sóc Thú cưng' : 'Animora Pet Care AI'}
                </div>
                <div className="text-[11px] opacity-85 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span className="truncate">
                    {isVi
                      ? 'Khung Chat AI • Chờ kết nối Backend'
                      : 'AI Shell • Pending Backend'}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              data-testid="ai-chatbox-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label={isVi ? 'Đóng chat AI' : 'Close AI chat'}
              className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed ${
                      isUser ? 'rounded-br-sm font-semibold' : 'rounded-bl-sm border'
                    }`}
                    style={
                      isUser
                        ? {
                            backgroundColor: 'var(--primary)',
                            color: 'var(--on-primary)',
                          }
                        : {
                            backgroundColor: 'var(--bg)',
                            borderColor: 'var(--border)',
                            color: 'var(--text)',
                          }
                    }
                  >
                    {msg.content}
                  </div>
                  {msg.suggestedAction && (
                    <button
                      type="button"
                      onClick={() => {
                        onNavigateUrl(msg.suggestedAction!.path);
                        setIsOpen(false);
                      }}
                      className="mt-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 border cursor-pointer hover:opacity-90"
                      style={{
                        backgroundColor: 'var(--surface-2)',
                        borderColor: 'var(--border)',
                        color: 'var(--primary)',
                      }}
                    >
                      <span>
                        {isVi
                          ? msg.suggestedAction.labelVi
                          : msg.suggestedAction.labelEn}
                      </span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {isSending && (
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{isVi ? 'Trợ lý đang trả lời...' : 'Assistant is typing...'}</span>
              </div>
            )}
            <div ref={listEndRef} />
          </div>

          {/* Quick prompts */}
          <div
            className="px-3 py-2 border-t flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0"
            style={{ borderColor: 'var(--border)' }}
          >
            {(isVi ? QUICK_PROMPTS_VI : QUICK_PROMPTS_EN).map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void handleSend(prompt)}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap shrink-0 cursor-pointer hover:opacity-85"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  color: 'var(--primary)',
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend(input);
            }}
            className="p-3 border-t flex items-center gap-2 shrink-0"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
          >
            <input
              type="text"
              data-testid="ai-chatbox-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isVi
                  ? 'Nhập câu hỏi chăm sóc thú cưng...'
                  : 'Ask a pet care question...'
              }
              className="form-input flex-1 text-xs py-2"
            />
            <button
              type="submit"
              data-testid="ai-chatbox-send-btn"
              disabled={!input.trim() || isSending}
              aria-label={isVi ? 'Gửi tin nhắn' : 'Send message'}
              className="btn-primary w-9 h-9 rounded-full flex items-center justify-center shrink-0 disabled:opacity-45 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>
      )}

      {/* Floating Action Stack: Phone Call + AI Support Chat */}
      <div className="flex flex-col items-end gap-3.5">
        {/* 1. Hotline Phone Call Button (hidden when AI chatbox is open) */}
        {!isOpen && (
          <Tooltip>
            <TooltipTrigger
              render={
                <a
                  href={CONTACT_INFO.phoneHref}
                  data-testid="floating-hotline-btn"
                  aria-label={
                    isVi
                      ? `Gọi Hotline ${CONTACT_INFO.phoneDisplay}`
                      : `Call Hotline ${CONTACT_INFO.phoneDisplay}`
                  }
                  className="group relative w-14 h-14 rounded-full shadow-xl border flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7F6B]"
                  style={{
                    background: 'linear-gradient(135deg, #FF7F6B 0%, #D94E3B 100%)',
                    color: '#FFFFFF',
                    borderColor: 'rgba(255,255,255,0.35)',
                  }}
                />
              }
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full animate-fab-ripple"
                style={{
                  backgroundColor: 'rgba(255, 127, 107, 0.55)',
                }}
              />
              <PhoneCall className="relative z-10 w-6 h-6 shrink-0 animate-fab-wiggle" />
            </TooltipTrigger>
            <TooltipContent side="left">
              {isVi
                ? `Gọi ngay: ${CONTACT_INFO.phoneDisplay}`
                : `Call now: ${CONTACT_INFO.phoneDisplay}`}
            </TooltipContent>
          </Tooltip>
        )}

        {/* 2. AI Support Chat Toggle Button */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                data-testid="ai-chatbox-toggle-btn"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={isVi ? 'Chat hỗ trợ AI' : 'AI Support Chat'}
                className="group relative w-14 h-14 rounded-full shadow-xl border flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7F6B]"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--on-primary)',
                  borderColor: 'rgba(255,255,255,0.28)',
                }}
              />
            }
          >
            {!isOpen && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full animate-fab-ripple-delayed"
                style={{
                  backgroundColor: 'rgba(107, 31, 46, 0.48)',
                }}
              />
            )}
            {isOpen ? (
              <X className="relative z-10 w-6 h-6 shrink-0" />
            ) : (
              <MessageCircle className="relative z-10 w-6 h-6 shrink-0 animate-fab-wiggle-delayed" />
            )}
            {!isOpen && (
              <span
                className="absolute -top-1 -right-1 z-20 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold leading-none shadow-sm"
                style={{
                  backgroundColor: '#FF7F6B',
                  color: '#FFFFFF',
                }}
              >
                AI
              </span>
            )}
          </TooltipTrigger>
          <TooltipContent side="left">
            {isVi ? 'Chat hỗ trợ AI' : 'AI Support Chat'}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
