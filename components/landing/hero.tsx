"use client";

import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Play, Sparkles, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-32 lg:pt-20 lg:pb-40">
      {/* Modern Background Gradients */}
      <div className="absolute inset-0 z-0 bg-background overflow-hidden pointer-events-none">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
          style={{ 
            backgroundImage: "linear-gradient(to right, #808080 1px, transparent 1px), linear-gradient(to bottom, #808080 1px, transparent 1px)", 
            backgroundSize: "32px 32px" 
          }} 
        />
        {/* Glowing Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[800px] rounded-[100%] bg-primary/20 opacity-60 blur-[80px]" />
        <div className="absolute top-[20%] right-[-10%] h-[300px] w-[300px] rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[300px] w-[300px] rounded-full bg-purple-500/10 blur-[100px]" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          
          {/* Animated Pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-background/50 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-md shadow-sm transition-colors hover:bg-primary/5 hover:border-primary/30 cursor-default">
              <Sparkles className="w-4 h-4 mr-2 text-primary" />
              <span>Introducing the future of purchase management</span>
            </div>
          </motion.div>
          
          {/* Main Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]"
          >
            Your AI <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-purple-500">
              Purchase Memory.
            </span>
          </motion.h1>
          
          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="text-base md:text-xl text-muted-foreground mb-12 max-w-3xl leading-relaxed"
          >
            Never lose receipts, warranties, manuals, invoices, or subscriptions again. 
            <span className="text-foreground font-medium block mt-2">AI automatically organizes everything you buy.</span>
          </motion.p>
          
          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-5 w-full justify-center items-center"
          >
            <Link 
              href="/auth/login" 
              className={cn(
                buttonVariants({ size: "lg" }), 
                "rounded-full h-14 px-8 text-base font-bold shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 hover:scale-105 group"
              )}
            >
              <span className="flex items-center">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            
            <Link 
              href="#demo" 
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }), 
                "rounded-full h-14 px-8 text-base font-bold bg-background/50 backdrop-blur-sm border-2 hover:bg-secondary/50 transition-all duration-300 hover:scale-105 group"
              )}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 mr-3 group-hover:bg-primary/20 transition-colors">
                <Play className="w-4 h-4 text-primary ml-1" fill="currentColor" />
              </div>
              Watch Demo
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
