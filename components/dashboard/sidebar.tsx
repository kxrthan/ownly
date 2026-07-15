"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ShieldCheck, 
  Receipt, 
  RefreshCw, 
  BarChart3, 
  MessageSquareText, 
  Settings,
  Vault,
  X
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Purchases", href: "/dashboard/purchases", icon: ShoppingBag },
  { name: "Warranties", href: "/dashboard/warranties", icon: ShieldCheck },
  { name: "Receipts", href: "/dashboard/receipts", icon: Receipt },
  { name: "Subscriptions", href: "/dashboard/subscriptions", icon: RefreshCw },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "AI Chat", href: "/dashboard/ai-chat", icon: MessageSquareText },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="h-full w-full border-r border-border bg-secondary flex flex-col">
      <div className="flex h-14 items-center justify-between border-b border-border px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <Vault className="w-7 h-7 text-primary" />
          <span className="text-xl tracking-tight">Ownly</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground focus:outline-none">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
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
      <div className="mt-auto p-4">
        <nav className="grid items-start text-sm font-medium">
          <Link
            href="/dashboard/settings"
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
    </div>
  );
}
