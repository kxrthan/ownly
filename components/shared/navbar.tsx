"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Vault, User, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 w-full border-b border-border bg-background"
    >
      <div className="container mx-auto px-8 md:px-16 lg:px-24 h-16 flex items-center justify-between">
        <div className="flex-1 flex">
          <Link href="/" className="flex items-center space-x-3">
            <Vault className="w-8 h-8 text-primary" />
            <span className="inline-block font-bold text-2xl tracking-tight text-foreground">Ownly</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex gap-6 items-center justify-center text-sm font-medium text-muted-foreground flex-1">
          <Link href="#features" className="transition-colors hover:text-foreground">Features</Link>
          <Link href="#how-it-works" className="transition-colors hover:text-foreground">How it Works</Link>
          <Link href="#pricing" className="transition-colors hover:text-foreground">Pricing</Link>
          <Link href="#faq" className="transition-colors hover:text-foreground">FAQ</Link>
        </nav>

        <div className="flex items-center justify-end gap-4 flex-1">
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-muted/50 animate-pulse hidden sm:block" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost" }), "rounded-full bg-muted/20 border border-border/50 hover:bg-muted/40 transition-colors focus:outline-none px-4 flex items-center gap-2")}>
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {user.user_metadata?.firstName 
                    ? `${user.user_metadata.firstName} ${user.user_metadata.lastName || ''}`.trim() 
                    : "My Account"}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background border-border/50">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.user_metadata?.firstName 
                          ? `${user.user_metadata.firstName} ${user.user_metadata.lastName || ''}` 
                          : "My Account"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/dashboard")}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hidden sm:block">
                Login
              </Link>
              <Link href="/auth/login" className={cn(buttonVariants({ variant: "default" }), "rounded-full px-6 hidden sm:flex")}>
                Get Started
              </Link>
            </>
          )}

          <div className="md:hidden flex items-center ml-2">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -mr-2 text-primary focus:outline-none">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-border bg-background px-8 py-4 space-y-4 shadow-lg"
        >
          <nav className="flex flex-col gap-4 text-sm font-medium text-muted-foreground">
            <Link href="#features" onClick={() => setIsMobileMenuOpen(false)} className="transition-colors hover:text-foreground">Features</Link>
            <Link href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="transition-colors hover:text-foreground">How it Works</Link>
            <Link href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="transition-colors hover:text-foreground">Pricing</Link>
            <Link href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="transition-colors hover:text-foreground">FAQ</Link>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
