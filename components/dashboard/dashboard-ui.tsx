"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  Package, 
  ShieldAlert, 
  ArrowRightLeft, 
  TrendingUp,
  Receipt,
  AlertCircle,
  BarChart3,
  ShoppingBag,
  RefreshCw,
  Clock,
  X,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddPurchaseModal } from "@/components/dashboard/add-purchase-modal";
import { Subscription } from "@/components/dashboard/subscriptions-ui";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export interface Purchase {
  id: string;
  item_name: string;
  store: string;
  price: number;
  warranty_months: number;
  created_at: string;
  purchase_date?: string;
  receipt_url?: string;
  signed_url?: string;
  category?: string;
}

const chartConfig = {
  total: {
    label: "Spent",
    color: "var(--primary)",
  },
};

export function DashboardUI({ purchases, subscriptions = [], isFreePlan = false }: { purchases: Purchase[], subscriptions?: Subscription[], isFreePlan?: boolean }) {
  const router = useRouter();
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);
  
  // 1. Calculate Monthly Spending (Current Month)
  const monthlySpending = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return purchases.reduce((sum, p) => {
      const d = new Date(p.purchase_date || p.created_at);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        return sum + Number(p.price || 0);
      }
      return sum;
    }, 0);
  }, [purchases]);

  // 2. Calculate Expiring Warranties (Next 30 Days)
  const expiringWarranties = useMemo(() => {
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(now.getDate() + 30);
    
    let expiringCount = 0;
    
    purchases.forEach(p => {
      if (p.warranty_months > 0) {
        const purchaseDate = new Date(p.purchase_date || p.created_at);
        const expiryDate = new Date(purchaseDate);
        expiryDate.setMonth(expiryDate.getMonth() + p.warranty_months);
        
        if (expiryDate > now && expiryDate <= nextMonth) {
          expiringCount++;
        }
      }
    });
    return expiringCount;
  }, [purchases]);

  // 3. Find Urgent Smart Alert
  const urgentWarranty = useMemo<{ purchase: Purchase, daysLeft: number } | null>(() => {
    const now = new Date();
    
    let closest: { purchase: Purchase, daysLeft: number } | null = null;
    
    purchases.forEach(p => {
      if (p.warranty_months > 0) {
        const purchaseDate = new Date(p.purchase_date || p.created_at);
        const expiryDate = new Date(purchaseDate);
        expiryDate.setMonth(expiryDate.getMonth() + p.warranty_months);
        
        if (expiryDate > now) {
          const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (daysLeft <= 30) {
            if (!closest || daysLeft < closest.daysLeft) {
              closest = { purchase: p, daysLeft };
            }
          }
        }
      }
    });
    return closest;
  }, [purchases]);

  // 4. Generate Chart Data (Last 6 Months)
  const chartData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    const now = new Date();
    
    // Initialize last 6 months with 0
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toLocaleDateString("en-US", { month: "short" });
      dataMap[monthStr] = 0;
    }
    
    purchases.forEach(p => {
      const d = new Date(p.purchase_date || p.created_at);
      const monthStr = d.toLocaleDateString("en-US", { month: "short" });
      if (dataMap[monthStr] !== undefined) {
        dataMap[monthStr] += Number(p.price || 0);
      }
    });
    
    return Object.entries(dataMap).map(([month, total]) => ({ month, total }));
  }, [purchases]);

  // Format recent activity (limit to 3 initially)
  const recentActivity = [...purchases]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, showAllActivity ? purchases.length : 3)
    .map((p) => ({
      id: p.id,
      title: p.item_name,
      date: new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      amount: p.price ? `₹${p.price.toLocaleString()}` : "N/A",
      type: "purchase",
      store: p.store || "Unknown Store",
    }));

  const stats = [
    {
      title: "Monthly Spending",
      value: `₹${monthlySpending.toLocaleString()}`,
      change: "This month",
      icon: CreditCard,
      trend: "neutral",
    },
    {
      title: "Products Owned",
      value: purchases.length.toString(),
      change: "Total tracked items",
      icon: Package,
      trend: "neutral",
    },
    {
      title: "Expiring Warranties",
      value: expiringWarranties.toString(),
      change: "Next 30 days",
      icon: ShieldAlert,
      trend: expiringWarranties > 0 ? "down" : "neutral", 
    },
    {
      title: "Active Subscriptions",
      value: subscriptions.length.toString(),
      change: "Recurring costs",
      icon: RefreshCw,
      trend: "neutral",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your purchases.</p>
        </div>
        <div className="flex items-center gap-3">
          <AddPurchaseModal />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="rounded-xl border border-border/50 bg-background/50 p-6 shadow-sm hover:bg-muted/10 transition-colors relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between space-y-0 pb-2 relative z-10">
              <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
                {stat.title}
              </h3>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="relative z-10">
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs mt-1 flex items-center ${stat.trend === 'up' ? 'text-green-500' : stat.trend === 'down' ? 'text-yellow-600 dark:text-yellow-500' : 'text-muted-foreground'}`}>
                {stat.trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
                {stat.trend === 'down' && <Clock className="w-3 h-3 mr-1" />}
                {stat.change}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        {/* Main Chart Area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-xl border border-border/50 bg-background/50 shadow-sm flex flex-col min-w-0"
        >
          <div className="p-4 sm:p-6 pb-2">
            <h3 className="font-semibold text-lg">Spending Overview</h3>
            <p className="text-sm text-muted-foreground">Monthly expenses over the last 6 months.</p>
          </div>
          <div className="relative p-2 sm:p-6 flex-1 min-h-[300px] border-t border-border/30 mt-4 bg-muted/5 overflow-hidden">
            {isFreePlan && (
              <div className="absolute inset-0 z-20 backdrop-blur-md bg-background/50 flex flex-col items-center justify-center">
                <div className="bg-background border border-border/50 shadow-lg rounded-xl p-6 text-center max-w-xs mx-auto">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Pro Feature</h4>
                  <p className="text-sm text-muted-foreground mb-4">Upgrade to Pro to unlock historical spending trends and beautiful analytics.</p>
                  <Link href="/?checkout=Pro#pricing" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                    Upgrade to Pro
                  </Link>
                </div>
              </div>
            )}
            <div className={isFreePlan ? "opacity-30 pointer-events-none" : ""}>
              <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="month" 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    tickFormatter={(value) => `₹${value.toLocaleString()}`}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
                  <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="rounded-xl border border-border/50 bg-background/50 shadow-sm flex flex-col min-w-0"
        >
          <div className="p-4 sm:p-6 border-b border-border/30">
            <h3 className="font-semibold text-lg">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">Your latest purchases.</p>
          </div>
          <div className="p-0 flex-1 flex flex-col">
            {recentActivity.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <Receipt className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">No purchases yet</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Add your first receipt to get started.</p>
              </div>
            ) : (
              recentActivity.map((activity, i) => (
                <div 
                  key={activity.id} 
                  className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 border-b border-border/30 hover:bg-muted/30 transition-colors ${i === recentActivity.length - 1 ? 'border-0' : ''}`}
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full flex items-center justify-center ${
                    activity.type === 'purchase' ? 'bg-primary/10 text-primary' : 
                    activity.type === 'warranty' ? 'bg-yellow-500/10 text-yellow-500' : 
                    'bg-purple-500/10 text-purple-500'
                  }`}>
                    {activity.type === 'purchase' ? <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" /> : 
                     activity.type === 'warranty' ? <ShieldAlert className="w-3 h-3 sm:w-4 sm:h-4" /> : 
                     <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />}
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <h4 className="font-medium text-xs sm:text-sm truncate">{activity.title}</h4>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{activity.store} • {activity.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-semibold text-xs sm:text-sm">{activity.amount}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-border/30 text-center mt-auto">
            <Button variant="link" className="text-primary h-auto p-0" onClick={() => setShowAllActivity(!showAllActivity)}>
              {showAllActivity ? "View less" : "View all activity"}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Smart Alerts row */}
      {urgentWarranty && !isAlertDismissed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4 relative"
        >
          <div className="flex items-start gap-4 flex-1 w-full">
            <div className="mt-0.5 shrink-0">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="flex-1 min-w-0 pr-8 sm:pr-0">
              <h4 className="font-medium text-yellow-600 dark:text-yellow-500 text-sm">Warranty Expiring Soon</h4>
              <p className="text-sm text-yellow-600/80 dark:text-yellow-500/80 mt-1">
                Your <strong>{urgentWarranty.purchase.item_name}</strong> warranty expires in {urgentWarranty.daysLeft} days. Do you need to file any claims?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto sm:shrink-0 justify-end sm:justify-start">
            <Button variant="outline" size="sm" className="bg-background border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 flex-1 sm:flex-initial" onClick={() => router.push('/dashboard/warranties')}>
              Review Warranty
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-yellow-600/70 hover:text-red-500 hover:bg-red-500/10 rounded-full" onClick={() => setIsAlertDismissed(true)} title="Dismiss alert">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
