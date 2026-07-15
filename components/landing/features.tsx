"use client";

import { motion } from "framer-motion";
import { ScanText, Search, ShieldCheck, History, MessageSquare, Mail } from "lucide-react";

const features = [
  {
    icon: <ScanText className="w-6 h-6 text-primary" />,
    title: "AI Receipt Scanner",
    description: "Upload PDFs or images. Our AI automatically extracts product names, prices, and dates via OCR.",
  },
  {
    icon: <Search className="w-6 h-6 text-primary" />,
    title: "Smart Search",
    description: 'Search naturally. Just ask "When did I buy my laptop?" and get instant answers.',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-primary" />,
    title: "Warranty Tracking",
    description: "Countdown timers and reminder badges so you never miss a return window or expiring warranty.",
  },
  {
    icon: <History className="w-6 h-6 text-primary" />,
    title: "Product Timeline",
    description: "Every purchase gets a timeline: service history, repairs, manuals, and notes in one place.",
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-primary" />,
    title: "AI Chat Assistant",
    description: "Ask anything about your purchases. Get summaries, price history, and instant support.",
  },
  {
    icon: <Mail className="w-6 h-6 text-primary" />,
    title: "Email Import",
    description: "Connect your Gmail. We automatically find and import invoices securely in the background.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Everything you need to <span className="text-primary">manage purchases</span></h2>
          <p className="text-muted-foreground text-lg">
            A comprehensive suite of tools powered by artificial intelligence to keep your assets organized.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative rounded-2xl border border-border bg-secondary p-8 hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
