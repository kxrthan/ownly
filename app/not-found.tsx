"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { Home, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-primary/10 opacity-70 blur-[100px]" />
        <div className="absolute bottom-10 left-10 h-[200px] w-[200px] rounded-full bg-red-500/5 blur-[80px]" />
      </div>

      <div className="container px-4 relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 relative"
        >
          <div className="text-[150px] md:text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/20 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-32 w-32 rounded-full bg-background border border-border flex items-center justify-center shadow-2xl backdrop-blur-md">
              <AlertCircle className="w-16 h-16 text-primary" />
            </div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
        >
          Page not found
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto"
        >
          Oops! It seems you've wandered into the unknown. The page you're looking for doesn't exist or has been moved.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/"
            className={cn(
              buttonVariants({ size: "lg" }),
              "rounded-full h-12 px-8 font-semibold shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-105"
            )}
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "rounded-full h-12 px-8 font-semibold bg-background/50 backdrop-blur-sm hover:scale-105 transition-transform"
            )}
          >
            Go Back
          </button>
        </motion.div>
      </div>
    </div>
  );
}
