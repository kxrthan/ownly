"use client";

import { useChat } from "@ai-sdk/react";
import { Sparkles, Send, User, Bot, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from 'react-markdown';
import Link from "next/link";

export function AIChatUI({ isFreePlan = false }: { isFreePlan?: boolean }) {
  const { messages, sendMessage, status } = useChat();
  const [inputValue, setInputValue] = useState("");
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLoading = status === "submitted" || status === "streaming";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showUpgradeBanner]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    if (isFreePlan) {
      setShowUpgradeBanner(true);
      return;
    }
    
    // sendMessage usually takes the text or an object. To be safe, we pass the text.
    sendMessage({ role: "user", content: inputValue } as any);
    setInputValue("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-primary" />
          AI Financial Assistant
        </h1>
        <p className="text-muted-foreground mt-1">
          Ask Gemini anything about your purchases, warranties, and subscriptions.
        </p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-background/50 border border-border/50 rounded-2xl overflow-hidden flex flex-col shadow-sm relative">
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 && !showUpgradeBanner ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
              <Sparkles className="w-16 h-16 text-primary mb-4 animate-pulse" />
              <h3 className="text-xl font-medium">How can I help you today?</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                Try asking me things like "How much did I spend in July?" or "Which of my warranties are expiring soon?"
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <div 
                key={m.id} 
                className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role !== 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                )}
                
                <div 
                  className={`max-w-[85%] sm:max-w-[75%] px-5 py-3 rounded-2xl ${
                    m.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                      : 'bg-secondary text-foreground rounded-tl-sm border border-border/50'
                  }`}
                >
                  {m.role === 'user' ? (
                    <div className="whitespace-pre-wrap">{(m as any).content || ((m as any).parts ? (m as any).parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') : '')}</div>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{(m as any).content || ((m as any).parts ? (m as any).parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') : '')}</ReactMarkdown>
                    </div>
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))
          )}
          
          {showUpgradeBanner && (
             <div className="flex gap-4 justify-end">
               <div className="max-w-[85%] sm:max-w-[75%] px-5 py-3 rounded-2xl bg-primary text-primary-foreground rounded-tr-sm">
                 {inputValue}
               </div>
               <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                 <User className="w-5 h-5 text-muted-foreground" />
               </div>
             </div>
          )}

          {showUpgradeBanner && (
             <div className="flex gap-4 justify-start mt-4">
               <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                 <Bot className="w-5 h-5 text-primary" />
               </div>
               <div className="bg-primary/10 text-foreground rounded-2xl rounded-tl-sm border border-primary/20 p-5 flex flex-col gap-3 max-w-sm">
                 <div className="flex items-center gap-2 text-primary font-semibold">
                   <Lock className="w-4 h-4" /> Pro Feature
                 </div>
                 <p className="text-sm">I'm sorry, but the AI Financial Assistant is only available on the Pro plan.</p>
                 <Link href="/?checkout=Pro#pricing" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium text-center shadow-sm hover:bg-primary/90 transition-colors mt-2">
                   Upgrade to Pro to Chat
                 </Link>
               </div>
             </div>
          )}

          {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && !showUpgradeBanner && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="bg-secondary text-foreground rounded-2xl rounded-tl-sm border border-border/50 px-5 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background border-t border-border/50">
          <form onSubmit={handleFormSubmit} className="flex gap-2 relative max-w-4xl mx-auto">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about your finances..."
              className="flex-1 rounded-full pl-4 pr-12 h-12 bg-secondary/50 border-border/50 focus-visible:ring-primary focus-visible:bg-background transition-all"
              disabled={isLoading || showUpgradeBanner}
            />
            <Button 
              type="submit"
              size="icon" 
              className="absolute right-1 top-1 h-10 w-10 rounded-full shadow-md z-10 hover:bg-primary/90"
              disabled={isLoading || !inputValue.trim() || showUpgradeBanner}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <div className="text-center mt-2">
            <span className="text-xs text-muted-foreground">
              Gemini can make mistakes. Verify important financial information.
            </span>
          </div>
        </div>
        
      </div>
    </div>
  );
}
