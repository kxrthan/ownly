"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-red-500/10 opacity-70 blur-[100px]" />
      </div>

      <div className="container px-4 relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="h-24 w-24 rounded-full bg-background border border-red-500/20 flex items-center justify-center mx-auto shadow-xl backdrop-blur-md">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
        >
          Something went wrong
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto"
        >
          An unexpected error occurred. Don't worry, our team has been notified. 
          Please try again or head back home.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={() => reset()}
            className={cn(
              buttonVariants({ size: "lg" }),
              "rounded-full h-12 px-8 font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105"
            )}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </button>
          
          <Link
            href="/"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "rounded-full h-12 px-8 font-semibold bg-background/50 backdrop-blur-sm hover:scale-105 transition-transform"
            )}
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
