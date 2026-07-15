"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Freelance Designer",
    company: "Studio SJ",
    content: "Ownly has completely transformed how I manage my equipment purchases. The automatic warranty tracking saved me when my monitor broke just days before the warranty expired.",
    rating: 5,
  },
  {
    name: "David Chen",
    role: "Tech Lead",
    company: "Innovate Inc",
    content: "The AI search is genuinely magical. I just ask 'How much did I spend on cloud services last year?' and it instantly gives me the breakdown. Worth every penny.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Small Business Owner",
    company: "Bake & Co",
    content: "I used to have a shoebox full of receipts. Now everything is neatly categorized in Ownly. The email import feature works flawlessly in the background.",
    rating: 5,
  },
  {
    name: "Michael Chang",
    role: "Software Engineer",
    company: "TechFlow",
    content: "I buy a lot of digital subscriptions and always forget to cancel them. Ownly's dashboard gives me complete visibility and saves me hundreds of dollars a year.",
    rating: 5,
  },
  {
    name: "Jessica Taylor",
    role: "Photography Director",
    company: "Lens Studio",
    content: "Keeping track of camera gear warranties used to be a nightmare. Ownly automatically parses my B&H receipts and sets up the warranty windows. Unbelievably helpful.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Financial Analyst",
    company: "Capital Partners",
    content: "The UI is incredibly clean and fast. Being able to export my software expenses for tax season with just one click is an absolute game changer.",
    rating: 5,
  }
];

export function Testimonials() {
  return (
    <section className="py-24 relative overflow-hidden bg-background">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(79,124,255,0.05),rgba(255,255,255,0))]" />
      
      <div className="container mx-auto px-4 relative z-10 mb-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Loved by <span className="text-primary">thousands</span></h2>
          <p className="text-muted-foreground text-lg">
            See what our users have to say about their experience with Ownly.
          </p>
        </div>
      </div>

      <div className="relative w-full flex overflow-hidden">
        {/* Gradient edge masks */}
        <div className="absolute inset-y-0 left-0 w-16 md:w-48 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 md:w-48 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />
        
        <motion.div
          className="flex gap-6 w-max px-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity }}
        >
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <div
              key={index}
              className="w-[350px] md:w-[400px] shrink-0 rounded-2xl border border-border bg-background p-8 shadow-sm hover:shadow-md transition-all relative group"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed relative z-10 text-sm md:text-base">
                &quot;{testimonial.content}&quot;
              </p>
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-medium text-sm text-foreground">{testimonial.name}</h4>
                  <p className="text-xs text-muted-foreground">{testimonial.role}, {testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
