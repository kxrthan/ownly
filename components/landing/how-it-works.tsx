"use client";

import { motion } from "framer-motion";
import { UploadCloud, Cpu, FolderTree, Bell, MessageSquareText } from "lucide-react";

const steps = [
  {
    icon: <UploadCloud className="w-5 h-5 text-primary" />,
    title: "Upload receipt",
    description: "Simply snap a photo or upload a PDF invoice.",
  },
  {
    icon: <Cpu className="w-5 h-5 text-primary" />,
    title: "AI extracts data",
    description: "Our vision model instantly reads the text.",
  },
  {
    icon: <FolderTree className="w-5 h-5 text-primary" />,
    title: "Automatically categorizes",
    description: "Sorted by product type, brand, and date.",
  },
  {
    icon: <Bell className="w-5 h-5 text-primary" />,
    title: "Tracks warranty",
    description: "Reminds you before the return window closes.",
  },
  {
    icon: <MessageSquareText className="w-5 h-5 text-primary" />,
    title: "AI answers questions",
    description: "Ask your vault anything about your items.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative bg-[#65372A] text-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">How <span className="text-primary">Ownly</span> works</h2>
          <p className="text-background/80 text-lg">
            A seamless, automated workflow from upload to insight.
          </p>
        </div>

        <div className="max-w-4xl mx-auto flex flex-col">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 py-10 md:py-12 border-b border-background/10 first:border-t relative overflow-hidden"
            >
              {/* Subtle hover background slide effect */}
              <div className="absolute inset-0 bg-[#F4E5D1]/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
              
              <div className="text-3xl md:text-5xl font-light text-background/30 font-mono relative z-10 w-16">
                0{index + 1}
              </div>
              
              <div className="flex-1 relative z-10">
                <h3 className="text-2xl md:text-4xl font-medium tracking-tight mb-2 group-hover:text-[#F4E5D1] transition-colors duration-300">{step.title}</h3>
                <p className="text-background/60 text-lg">{step.description}</p>
              </div>

              <div className="w-12 h-12 flex items-center justify-center shrink-0 relative z-10 text-primary group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                {step.icon}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
