"use client";

import { motion } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

declare global {
  interface Window {
     
    Razorpay: any;
  }
}

const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (typeof window.Razorpay !== "undefined") {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    
    script.onload = () => {
      let attempts = 0;
      const interval = setInterval(() => {
        if (typeof window.Razorpay !== "undefined") {
          clearInterval(interval);
          resolve(true);
        }
        attempts++;
        if (attempts > 20) {
          clearInterval(interval);
          resolve(false);
        }
      }, 100);
    };
    
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function AutoCheckoutTrigger({ handlePayment, user }: { handlePayment: (tier: string) => void, user: User | null }) {
  const searchParams = useSearchParams();
  const checkoutPlan = searchParams.get("checkout");

  useEffect(() => {
    if (checkoutPlan && user) {
      window.history.replaceState(null, '', '/#pricing');
      setTimeout(() => {
        handlePayment(checkoutPlan);
      }, 500);
    }
  }, [checkoutPlan, user, handlePayment]); 

  return null;
}

const tiers = [
  {
    name: "Free",
    price: "₹0",
    description: "Perfect for individuals organizing personal receipts.",
    features: ["8 receipts", "Basic OCR", "Smart Search", "7-day history"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "₹499",
    period: "/mo",
    description: "For power users and businesses who want AI assistance and automation.",
    features: ["Unlimited receipts", "AI Financial Advisor", "Advanced analytics", "Export to CSV/PDF", "Multi-user Vaults", "Warranty reminders"],
    cta: "Start Free Trial",
    popular: true,
  }
];

export function Pricing() {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTier, setSuccessTier] = useState("");
  const router = useRouter();

  const currentPlan = user ? (user.user_metadata?.plan || "Free") : null;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handlePayment = async (tierName: string) => {
    if (tierName === "Free") {
      router.push(user ? "/dashboard" : "/auth/login");
      return;
    }

    if (!user) {
      router.push("/auth/login");
      return;
    }

    setLoadingTier(tierName);

    const isLoaded = await loadRazorpay();

    if (!isLoaded || typeof window.Razorpay === "undefined") {
      toast.error("Razorpay is blocked or still loading. Please disable your adblocker for this site and refresh.");
      setLoadingTier(null);
      return;
    }

    try {
      const response = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: tierName }),
      });

      const order = await response.json();

      if (order.error) {
        toast.error("Failed to initialize payment: " + order.error);
        setLoadingTier(null);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: order.amount,
        currency: order.currency,
        name: "Ownly",
        description: `Upgrade to ${tierName} Plan`,
        order_id: order.id,
        handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; }) {
          try {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                tier: tierName
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              toast.error("Payment verification failed: " + (verifyData.error || "Unknown error"));
              return;
            }

            setSuccessTier(tierName);
            setShowSuccess(true);
            
            // Redirect after a short delay so they can see the success animation
            setTimeout(() => {
              router.push("/dashboard/settings");
            }, 3500);

          } catch (err) {
            console.error("Verification error:", err);
            toast.error("Payment verification encountered an error.");
          }
        },
        prefill: {
          email: user?.email || "",
          contact: "",
        },
        theme: {
          color: "#FBBF24",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: { error: { description: string } }) {
        toast.error("Payment Failed: " + response.error.description);
      });

      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Something went wrong initializing the payment.");
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <>
      <Suspense fallback={null}>
        <AutoCheckoutTrigger handlePayment={handlePayment} user={user} />
      </Suspense>
      <section id="pricing" className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Simple, transparent <span className="text-primary">pricing</span></h2>
            <p className="text-muted-foreground text-lg">
              Start for free, upgrade when you need more power.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex flex-col p-8 rounded-3xl border ${
                  tier.popular
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-secondary"
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-xl font-medium text-muted-foreground mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">{tier.description}</p>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  variant={tier.popular ? "default" : "outline"} 
                  className={`w-full rounded-full h-12 font-bold ${tier.popular ? "shadow-sm" : "bg-background hover:bg-muted"}`}
                  onClick={() => handlePayment(tier.name)}
                  disabled={loadingTier === tier.name || currentPlan === tier.name}
                >
                  {loadingTier === tier.name ? <Loader2 className="w-5 h-5 animate-spin" /> : currentPlan === tier.name ? "Current Plan" : tier.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md border-primary/20 p-0 overflow-hidden bg-background">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background z-0" />
            <div className="relative z-10 px-8 pt-12 pb-10 text-center flex flex-col items-center">
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.7, bounce: 0.5 }}
                className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6"
              >
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                  <Check className="w-8 h-8 text-primary-foreground stroke-[3]" />
                </div>
              </motion.div>
              
              <DialogHeader className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <DialogTitle className="text-3xl font-black text-center tracking-tight">
                    Payment Successful!
                  </DialogTitle>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <DialogDescription className="text-base text-center">
                    You have successfully upgraded to the <strong className="text-foreground">{successTier} Plan</strong>.
                    <br />
                    Welcome to the premium experience.
                  </DialogDescription>
                </motion.div>
              </DialogHeader>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-8 flex items-center gap-2 text-sm font-medium text-muted-foreground"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting to your dashboard...
              </motion.div>
            </div>
            
            {/* Sparkles effect */}
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute top-8 left-12"
            >
              <Sparkles className="w-5 h-5 text-primary/60" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute top-16 right-16"
            >
              <Sparkles className="w-6 h-6 text-primary/40" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute bottom-24 left-20"
            >
              <Sparkles className="w-4 h-4 text-primary/30" />
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
