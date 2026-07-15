"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does the AI Receipt Scanner work?",
    answer: "Our advanced OCR technology reads uploaded PDFs or images of your receipts. The AI then intelligently extracts key information such as the product name, price, date of purchase, and warranty details, automatically organizing them in your vault.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes, security is our top priority. All your documents and data are encrypted at rest and in transit. We do not sell your personal data to third parties.",
  },
  {
    question: "Can I track subscriptions as well?",
    answer: "Absolutely! Ownly tracks recurring subscriptions and provides insights into your monthly spending, helping you identify and cancel unwanted services.",
  },
  {
    question: "How does the Gmail import work?",
    answer: "When you connect your Gmail account, Ownly securely scans for common invoice and receipt formats from major retailers. It automatically imports these documents into your dashboard without you having to do anything manually.",
  },
  {
    question: "What happens if I lose my physical receipt?",
    answer: "Once uploaded to Ownly, your digital copy acts as a valid proof of purchase for most warranty claims and returns. You no longer need to worry about faded or lost paper receipts.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 relative bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Frequently Asked <span className="text-primary">Questions</span></h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about the product and billing.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border bg-secondary rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline font-medium text-lg py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
