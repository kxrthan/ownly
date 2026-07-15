"use client";

import { useMemo, useState, useTransition, useEffect } from "react";
import { Bell, Search, User, LogOut, Settings, ShieldAlert, RefreshCw, Users, Check, Trash2, Menu, X, LayoutDashboard, ShoppingBag, ShieldCheck, Receipt, BarChart3, MessageSquareText, Vault } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Purchase } from "@/components/dashboard/dashboard-ui";
import { Subscription } from "@/components/dashboard/subscriptions-ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Purchases", href: "/dashboard/purchases", icon: ShoppingBag },
  { name: "Warranties", href: "/dashboard/warranties", icon: ShieldCheck },
  { name: "Receipts", href: "/dashboard/receipts", icon: Receipt },
  { name: "Subscriptions", href: "/dashboard/subscriptions", icon: RefreshCw },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "AI Chat", href: "/dashboard/ai-chat", icon: MessageSquareText },
];

interface TopbarProps {
  user: SupabaseUser | null;
  purchases?: Purchase[];
  subscriptions?: Subscription[];
  vaults?: any[];
  activeVaultId?: string;
  onToggleSidebar?: () => void;
}

export function Topbar({ user, purchases = [], subscriptions = [], vaults = [], activeVaultId, onToggleSidebar }: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [dismissedNotifs, setDismissedNotifs] = useState<Set<string>>(new Set());
  const activeVault = vaults.find(v => v.id === activeVaultId) || vaults[0];

  useEffect(() => {
    // Clear global search input when navigating
    setGlobalSearchQuery("");
  }, [pathname]);

  const handleSwitchVault = async (vaultId: string) => {
    startTransition(async () => {
      const { switchVault } = await import("@/app/dashboard/vault-actions");
      await switchVault(vaultId);
    });
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  // Generate Notifications
  const notifications = useMemo(() => {
    const alerts: { id: string; title: string; desc: string; type: "warranty" | "subscription"; daysLeft: number }[] = [];
    const now = new Date();

    // Check expiring warranties (<= 30 days)
    purchases.forEach(p => {
      if (p.warranty_months > 0) {
        const purchaseDate = new Date(p.purchase_date || p.created_at);
        const expiryDate = new Date(purchaseDate);
        expiryDate.setMonth(expiryDate.getMonth() + p.warranty_months);
        
        if (expiryDate > now) {
          const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (daysLeft <= 30) {
            alerts.push({
              id: `w-${p.id}`,
              title: "Warranty Expiring",
              desc: `${p.item_name} warranty expires in ${daysLeft} days.`,
              type: "warranty",
              daysLeft
            });
          }
        }
      }
    });

    // Check upcoming subscriptions (<= 7 days)
    subscriptions.forEach(s => {
      const nextBilling = new Date(s.next_billing_date);
      if (nextBilling > now) {
        const daysLeft = Math.ceil((nextBilling.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 7) {
          alerts.push({
            id: `s-${s.id}`,
            title: "Upcoming Bill",
            desc: `${s.service_name} will charge ₹${s.price} in ${daysLeft} days.`,
            type: "subscription",
            daysLeft
          });
        }
      }
    });

    // Sort by most urgent
    return alerts.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [purchases, subscriptions]);

  const searchSuggestions = useMemo(() => {
    if (!globalSearchQuery.trim()) return [];
    const query = globalSearchQuery.toLowerCase();
    
    return purchases
      .filter(p => 
        p.item_name.toLowerCase().includes(query) || 
        (p.store && p.store.toLowerCase().includes(query))
      )
      .slice(0, 5); // limit to 5 suggestions
  }, [globalSearchQuery, purchases]);

  const activeNotifications = notifications.filter(n => !dismissedNotifs.has(n.id));
  const hasNotifications = activeNotifications.length > 0;

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-40">
      <div className="flex items-center mr-2 shrink-0">
        {/* Mobile toggle */}
        <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-1 -ml-2 text-primary focus:outline-none">
          <Menu className="h-6 w-6" />
        </button>
        {/* Desktop toggle */}
        {onToggleSidebar && (
          <button onClick={onToggleSidebar} className="hidden md:block p-1 -ml-2 text-primary focus:outline-none hover:bg-muted rounded-md transition-colors">
            <Menu className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="w-full flex-1 relative">
        <form 
          className="relative max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            if (globalSearchQuery.trim()) {
              router.push(`/dashboard/purchases?q=${encodeURIComponent(globalSearchQuery.trim())}`);
            }
          }}
        >
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search purchases, receipts..."
            className="w-full appearance-none bg-secondary pl-9 shadow-none border-border focus-visible:ring-primary rounded-full h-9"
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          
          {/* Search Suggestions Dropdown */}
          <AnimatePresence>
            {isSearchFocused && globalSearchQuery.trim() && searchSuggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 bg-background border border-border/50 rounded-xl shadow-xl overflow-hidden z-50"
              >
                <ul className="py-1">
                  {searchSuggestions.map(p => (
                    <li key={p.id}>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-muted/50 text-sm flex items-center gap-3 transition-colors"
                        onMouseDown={(e) => {
                          // Prevent onBlur from hiding dropdown before click registers
                          e.preventDefault();
                          setGlobalSearchQuery(p.item_name);
                          setIsSearchFocused(false);
                          router.push(`/dashboard/purchases?q=${encodeURIComponent(p.item_name)}`);
                        }}
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                           <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium truncate">{p.item_name}</span>
                          {p.store && <span className="text-xs text-muted-foreground truncate">{p.store}</span>}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
      <div className="flex items-center gap-2">
        
        {/* Vault Switcher */}
        {vaults.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }), "hidden md:flex gap-2 rounded-full focus:outline-none bg-background")}>
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="truncate max-w-[120px] text-xs font-medium">
                {activeVault?.name || "Personal Vault"}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-background border-border/50">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Switch Workspace</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {vaults.map((vault) => (
                  <DropdownMenuItem 
                    key={vault.id}
                    className="cursor-pointer flex items-center justify-between"
                    onClick={() => handleSwitchVault(vault.id)}
                    disabled={isPending}
                  >
                    <span className="truncate">{vault.name}</span>
                    {activeVaultId === vault.id && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        {/* Notifications Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full relative focus:outline-none")}>
            <Bell className="h-5 w-5 text-muted-foreground" />
            {hasNotifications && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
            )}
            <span className="sr-only">Toggle notifications</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-background border-border/50">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {hasNotifications && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto px-2 py-0.5 text-xs font-normal text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.preventDefault();
                      setDismissedNotifs(new Set(notifications.map(n => n.id)));
                    }}
                  >
                    Clear all
                  </Button>
                )}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              {!hasNotifications ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No new notifications. You're all caught up!
                </div>
              ) : (
                activeNotifications.map(n => (
                  <DropdownMenuItem key={n.id} className="p-3 flex items-start gap-3 cursor-pointer group">
                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.type === 'warranty' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-primary/10 text-primary'}`}>
                      {n.type === 'warranty' ? <ShieldAlert className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{n.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{n.desc}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDismissedNotifs(prev => {
                          const next = new Set(prev);
                          next.add(n.id);
                          return next;
                        });
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="sr-only">Delete notification</span>
                    </Button>
                  </DropdownMenuItem>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full bg-muted/20 border border-border/50 hover:bg-muted/40 transition-colors focus:outline-none")}>
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="sr-only">Toggle user menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-background border-border/50">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">My Account</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || "Not signed in"}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/dashboard/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isSigningOut ? "Signing out..." : "Log out"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-[280px] max-w-[80vw] bg-secondary border-r border-border z-50 md:hidden flex flex-col shadow-2xl"
            >
              <div className="flex h-14 items-center justify-between border-b border-border px-4">
                <Link href="/" className="flex items-center gap-3 font-semibold" onClick={() => setIsMobileMenuOpen(false)}>
                  <Vault className="w-7 h-7 text-primary" />
                  <span className="text-xl tracking-tight">Ownly</span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-muted-foreground focus:outline-none hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-2 text-sm font-medium space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                          isActive 
                            ? "bg-primary/10 text-primary" 
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="mt-auto p-4 border-t border-border/50">
                <nav className="grid items-start text-sm font-medium">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                      pathname === "/dashboard/settings" 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
