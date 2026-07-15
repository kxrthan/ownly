"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, User, Vault, Lock, Check } from "lucide-react";
import { signup } from "../actions";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ErrorMessage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  
  if (!error) return null;
  
  return (
    <div className="p-3 text-sm font-medium text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
      {error}
    </div>
  );
}

const planDetails: Record<string, { price: string, desc: string, features: string[] }> = {
  Free: {
    price: "₹0",
    desc: "Perfect for individuals organizing personal receipts.",
    features: ["8 receipts", "Basic OCR", "Smart Search", "7-day history"],
  },
  Pro: {
    price: "₹499/mo",
    desc: "For power users and businesses who want AI assistance and automation.",
    features: ["Unlimited receipts", "AI Financial Advisor", "Advanced analytics", "Export to CSV/PDF", "Multi-user Vaults", "Warranty reminders"],
  }
};

export default function SignupPage() {
  const [selectedPlan, setSelectedPlan] = useState("Free");

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm space-y-8"
        >
          <div className="text-center md:text-left">
            <Link href="/" className="inline-flex items-center space-x-3 mb-8">
              <Vault className="w-10 h-10 text-primary" />
              <span className="font-bold text-3xl tracking-tight">Ownly</span>
            </Link>
            <h1 className="text-3xl font-bold mb-2">Create an account</h1>
            <p className="text-muted-foreground">Sign up to start tracking your purchases</p>
          </div>

          <div className="space-y-4">
            <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }), "w-full h-12 rounded-xl bg-secondary border-border hover:bg-muted font-medium")}>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.8 15.71 17.58V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                  <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.58C14.73 18.24 13.48 18.64 12 18.64C9.13 18.64 6.7 16.7 5.84 14.09H2.16V16.94C3.97 20.53 7.67 23 12 23Z" fill="#34A853"/>
                  <path d="M5.84 14.09C5.62 13.43 5.49 12.73 5.49 12C5.49 11.27 5.62 10.57 5.84 9.91V7.06H2.16C1.42 8.53 1 10.21 1 12C1 13.79 1.42 15.47 2.16 16.94L5.84 14.09Z" fill="#FBBC05"/>
                  <path d="M12 5.38C13.62 5.38 15.06 5.94 16.2 7.02L19.36 3.86C17.46 2.09 14.97 1 12 1C7.67 1 3.97 3.47 2.16 7.06L5.84 9.91C6.7 7.3 9.13 5.38 12 5.38Z" fill="#EA4335"/>
                </svg>
                Sign up with Google
            </Link>
            
            <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }), "w-full h-12 rounded-xl bg-secondary border-border hover:bg-muted font-medium")}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 mr-2"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
                Sign up with GitHub
            </Link>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Suspense fallback={null}>
            <ErrorMessage />
          </Suspense>

          <form className="space-y-4" action={signup}>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <Input 
                  id="name" 
                  name="name"
                  placeholder="John Doe" 
                  required 
                  type="text" 
                  className="h-12 rounded-xl border-border bg-secondary pl-10 focus-visible:ring-primary"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input 
                  id="email" 
                  name="email"
                  placeholder="m@example.com" 
                  required 
                  type="email" 
                  className="h-12 rounded-xl border-border bg-secondary pl-10 focus-visible:ring-primary"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  name="password"
                  placeholder="••••••••" 
                  required 
                  type="password" 
                  className="h-12 rounded-xl border-border bg-secondary pl-10 focus-visible:ring-primary"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="space-y-3 pt-2 pb-2">
              <Label htmlFor="plan">Select Plan</Label>
              <select 
                id="plan" 
                name="plan" 
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full h-12 rounded-xl border border-border bg-secondary px-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary appearance-none cursor-pointer"
              >
                <option value="Free">Free Plan (₹0)</option>
                <option value="Pro">Pro Plan (₹499/mo)</option>
              </select>

              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedPlan}
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 mt-2">
                    <p className="text-sm font-medium mb-3 text-foreground flex items-center justify-between">
                      <span>{planDetails[selectedPlan].desc}</span>
                      <span className="font-bold text-primary">{planDetails[selectedPlan].price}</span>
                    </p>
                    <ul className="space-y-2">
                      {planDetails[selectedPlan].features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Check className="w-3.5 h-3.5 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl font-bold">
              Sign Up {selectedPlan !== "Free" ? `& Pay ${planDetails[selectedPlan].price}` : ""}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-primary/5 items-center justify-center p-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full max-w-lg aspect-square"
        >
          {/* Panels */}
          <div className="absolute top-10 left-10 right-10 bottom-10 rounded-3xl border border-border bg-secondary shadow-md z-20 flex flex-col justify-between p-8">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <span className="text-primary font-bold text-2xl">O</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Your digital vault.</h2>
              <p className="text-muted-foreground">Organize everything you buy in one beautiful, searchable place.</p>
            </div>
            
            <div className="space-y-3">
              <div className="h-16 w-full rounded-xl bg-background border border-border flex items-center px-4 gap-4">
                <div className="w-8 h-8 rounded-full bg-muted-foreground/20" />
                <div className="space-y-2 flex-1">
                  <div className="h-2 w-1/3 bg-muted-foreground/20 rounded" />
                  <div className="h-2 w-1/4 bg-muted-foreground/10 rounded" />
                </div>
              </div>
              <div className="h-16 w-full rounded-xl bg-background border border-border flex items-center px-4 gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/40" />
                <div className="space-y-2 flex-1">
                  <div className="h-2 w-1/2 bg-primary/40 rounded" />
                  <div className="h-2 w-1/3 bg-primary/20 rounded" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </div>
  );
}
