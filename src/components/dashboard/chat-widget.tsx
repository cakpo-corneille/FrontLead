'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

const CHAT_ENABLED = false;

type ChatMsg = {
  id: string;
  role: 'user' | 'model';
  content: string;
};

const WELCOME: ChatMsg = {
  id: 'welcome',
  role: 'model',
  content:
    "Bonjour ! Je suis votre assistant. Posez-moi une question sur votre WiFi, vos clients ou la configuration de votre formulaire.",
};

export function ChatWidget() {
  const { fetchWithAuth, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([WELCOME]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll vers le bas à chaque nouveau message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !fetchWithAuth || isSending) return;

    const userMsg: ChatMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const res = await fetchWithAuth('/assistant/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          ...(conversationId ? { conversation_id: conversationId } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'L\u2019assistant est indisponible.');
      }
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'model',
          content: data.reply?.content ?? '…',
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: 'model',
          content: `Désolé, une erreur est survenue : ${(err as Error).message}`,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // N'affiche le widget qu'aux utilisateurs connectés
  if (!user || !CHAT_ENABLED) return null;

  return (
    <>
      {/* Bouton flottant */}
      {CHAT_ENABLED && (
        <button
          type="button"
        aria-label={open ? 'Fermer l\u2019assistant' : 'Ouvrir l\u2019assistant'}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'fixed bottom-[88px] sm:bottom-5 right-5 z-50 h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-all',
          'bg-blue-600 hover:bg-blue-700 text-white',
          'focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300',
          open && 'scale-95',
        )}
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
      )}

      {/* Panneau */}
      {open && (
        <div
          role="dialog"
          aria-label="Assistant WiFiLeads"
          className={cn(
            'fixed z-50 bg-card shadow-2xl flex flex-col border',
            // Mobile : plein écran sous le header
            'inset-x-0 bottom-0 top-16 sm:top-auto',
            // Desktop : carte à droite
            'sm:right-5 sm:bottom-24 sm:left-auto sm:w-[380px] sm:h-[560px] sm:rounded-2xl sm:border-border',
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white sm:rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Assistant</p>
                <p className="text-[11px] text-blue-100">
                  Disponible 24/7
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Fermer"
              onClick={() => setOpen(false)}
              className="h-8 w-8 rounded-full hover:bg-white/15 flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-muted/50"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'flex',
                  m.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words',
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-card text-foreground border rounded-bl-sm',
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-card border rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  L&apos;assistant réfléchit…
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t bg-card p-3 sm:rounded-b-2xl">
            <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Écrivez votre message…"
                rows={1}
                className="min-h-[40px] max-h-32 resize-none text-sm"
                disabled={isSending}
              />
              <Button
                type="button"
                size="icon"
                onClick={sendMessage}
                disabled={!input.trim() || isSending}
                className="h-10 w-10 flex-shrink-0 bg-blue-600 hover:bg-blue-700"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
              Entrée pour envoyer · Maj+Entrée pour une nouvelle ligne
            </p>
          </div>
        </div>
      )}
    </>
  );
}
