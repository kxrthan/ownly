"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  Package, 
  ShieldAlert, 
  RefreshCw, 
  ShoppingBag, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  LayoutDashboard,
  ShieldCheck,
  Search,
  Bell,
  User,
  Vault,
  Receipt,
  BarChart3,
  MessageSquareText,
  FileText,
  Send,
  Bot
} from "lucide-react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartData = [
  { month: "Jan", total: 12500 },
  { month: "Feb", total: 18000 },
  { month: "Mar", total: 4500 },
  { month: "Apr", total: 32000 },
  { month: "May", total: 9500 },
  { month: "Jun", total: 21000 },
];

const chartConfig = {
  total: {
    label: "Spent",
    color: "var(--primary)",
  },
};

type Tab = "dashboard" | "purchases" | "warranties" | "receipts" | "subscriptions" | "analytics" | "ai-chat";

export function DashboardPreview() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  return (
    <div className="relative mt-16 max-w-[1200px] w-full mx-auto perspective-1000 px-4 flex justify-center h-[280px] min-[400px]:h-[320px] sm:h-[450px] md:h-[600px] lg:h-[750px] overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 100, rotateX: 20 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-0 w-[900px] lg:w-full h-[650px] lg:h-[750px] origin-top transform scale-[0.35] min-[400px]:scale-[0.4] sm:scale-[0.6] md:scale-[0.8] lg:scale-100 rounded-2xl border-2 border-border bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Browser header */}
        <div className="h-10 border-b border-border/50 flex items-center px-4 bg-muted/20 shrink-0">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
        </div>
        
        {/* App Layout */}
        <div className="flex flex-1 overflow-hidden pointer-events-auto">
          {/* Sidebar */}
          <div className="w-56 lg:w-64 border-r border-border/50 bg-secondary/50 flex flex-col shrink-0">
            <div className="flex h-14 items-center border-b border-border/50 px-6">
              <div className="flex items-center gap-2 font-semibold text-primary">
                <Vault className="w-5 h-5" />
                <span className="tracking-tight text-lg">Ownly</span>
              </div>
            </div>
            <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              <SidebarItem 
                icon={<LayoutDashboard className="w-4 h-4" />} 
                label="Dashboard" 
                isActive={activeTab === "dashboard"} 
                onClick={() => setActiveTab("dashboard")} 
              />
              <SidebarItem 
                icon={<ShoppingBag className="w-4 h-4" />} 
                label="Purchases" 
                isActive={activeTab === "purchases"} 
                onClick={() => setActiveTab("purchases")} 
              />
              <SidebarItem 
                icon={<ShieldCheck className="w-4 h-4" />} 
                label="Warranties" 
                isActive={activeTab === "warranties"} 
                onClick={() => setActiveTab("warranties")} 
              />
              <SidebarItem 
                icon={<Receipt className="w-4 h-4" />} 
                label="Receipts" 
                isActive={activeTab === "receipts"} 
                onClick={() => setActiveTab("receipts")} 
              />
              <SidebarItem 
                icon={<RefreshCw className="w-4 h-4" />} 
                label="Subscriptions" 
                isActive={activeTab === "subscriptions"} 
                onClick={() => setActiveTab("subscriptions")} 
              />
              <SidebarItem 
                icon={<BarChart3 className="w-4 h-4" />} 
                label="Analytics" 
                isActive={activeTab === "analytics"} 
                onClick={() => setActiveTab("analytics")} 
              />
              <SidebarItem 
                icon={<MessageSquareText className="w-4 h-4" />} 
                label="AI Chat" 
                isActive={activeTab === "ai-chat"} 
                onClick={() => setActiveTab("ai-chat")} 
              />
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-background/50">
            {/* Topbar */}
            <div className="h-14 border-b border-border/50 flex items-center justify-between px-6 bg-background/30 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md border border-border/50 w-64">
                <Search className="w-4 h-4 shrink-0" />
                <span className="text-sm truncate">Search items...</span>
              </div>
              <div className="flex items-center gap-4 flex">
                <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors cursor-pointer">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
                </button>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors">
                  <User className="w-4 h-4" />
                </div>
              </div>
            </div>
            
            {/* Dashboard Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide relative">
              <AnimatePresence mode="wait">
                {activeTab === "dashboard" && <DashboardView key="dashboard" />}
                {activeTab === "purchases" && <PurchasesView key="purchases" />}
                {activeTab === "warranties" && <WarrantiesView key="warranties" />}
                {activeTab === "receipts" && <ReceiptsView key="receipts" />}
                {activeTab === "subscriptions" && <SubscriptionsView key="subscriptions" />}
                {activeTab === "analytics" && <AnalyticsView key="analytics" />}
                {activeTab === "ai-chat" && <AIChatView key="ai-chat" />}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SidebarItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium cursor-pointer transition-colors ${
        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
      }`}
    >
      {icon}
      {label}
    </div>
  );
}

function DashboardView() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col h-full space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        <StatCard title="Monthly Spending" value="₹21,000" trend="This month" icon={<CreditCard className="w-4 h-4 text-muted-foreground" />} trendIcon={<TrendingUp className="w-3 h-3 mr-1 text-muted-foreground" />} />
        <StatCard title="Products Owned" value="24" trend="Total tracked items" icon={<Package className="w-4 h-4 text-muted-foreground" />} />
        <StatCard title="Expiring Warranties" value="3" trend="Next 30 days" icon={<ShieldAlert className="w-4 h-4 text-muted-foreground" />} trendIcon={<Clock className="w-3 h-3 mr-1 text-yellow-500" />} />
        <StatCard title="Active Subscriptions" value="8" trend="Recurring costs" icon={<RefreshCw className="w-4 h-4 text-muted-foreground" />} />
      </div>
      
      <div className="grid gap-4 grid-cols-7 flex-1 min-h-0">
        {/* Chart */}
        <div className="col-span-4 rounded-xl border border-border/50 bg-background/80 shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 pb-2 shrink-0">
            <h3 className="font-semibold text-lg">Spending Overview</h3>
            <p className="text-sm text-muted-foreground">Monthly expenses over the last 6 months.</p>
          </div>
          <div className="relative p-4 flex-1 min-h-0 border-t border-border/30 mt-2 bg-muted/5 overflow-hidden group flex flex-col justify-end">
            <ChartContainer config={chartConfig} className="h-[180px] w-full">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }} dy={10} />
                <YAxis tickFormatter={(value) => `₹${value.toLocaleString()}`} tickLine={false} axisLine={false} tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }} />
                <ChartTooltip cursor={{ fill: 'var(--muted)', opacity: 0.2 }} content={<ChartTooltipContent indicator="dashed" />} />
                <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-span-3 rounded-xl border border-border/50 bg-background/80 shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-border/30 shrink-0">
            <h3 className="font-semibold text-lg">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">Your latest purchases.</p>
          </div>
          <div className="p-0 flex-1 flex flex-col overflow-y-auto scrollbar-hide">
            <ActivityItem title="MacBook Pro M3" store="Apple Store" date="Today" amount="₹1,54,999" type="purchase" />
            <ActivityItem title="Sony WH-1000XM5" store="Amazon" date="Yesterday" amount="₹29,990" type="purchase" />
            <ActivityItem title="Netflix Premium" store="Netflix" date="Jan 15" amount="₹649" type="subscription" isLast />
          </div>
        </div>
      </div>
      
      {/* Alert */}
      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 flex items-start gap-4 shrink-0">
        <div className="mt-0.5">
          <AlertCircle className="w-5 h-5 text-yellow-500" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-yellow-600 dark:text-yellow-500 text-sm">Warranty Expiring Soon</h4>
          <p className="text-sm text-yellow-600/80 dark:text-yellow-500/80 mt-1">
            Your <strong>Sony WH-1000XM5</strong> warranty expires in 14 days. Do you need to file any claims?
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function PurchasesView() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Purchases</h2>
        <p className="text-muted-foreground mt-1">Manage and track all your purchases.</p>
      </div>
      <div className="rounded-xl border border-border/50 bg-background/80 overflow-x-auto scrollbar-hide">
        <table className="w-full text-sm text-left min-w-[600px]">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Store</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            <PurchaseRow title="MacBook Pro M3" store="Apple Store" date="Today" amount="₹1,54,999" />
            <PurchaseRow title="Sony WH-1000XM5" store="Amazon" date="Yesterday" amount="₹29,990" />
            <PurchaseRow title="Kindle Oasis" store="Amazon" date="Jan 12" amount="₹21,999" />
            <PurchaseRow title="Secretlab Titan Evo" store="Secretlab" date="Jan 05" amount="₹45,000" />
            <PurchaseRow title="Logitech MX Master 3S" store="Amazon" date="Dec 28" amount="₹8,995" />
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function PurchaseRow({ title, store, date, amount }: { title: string, store: string, date: string, amount: string }) {
  return (
    <tr className="hover:bg-muted/20 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5 text-primary" />
          </div>
          <span className="font-medium">{title}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-muted-foreground">{store}</td>
      <td className="px-6 py-4 text-muted-foreground">{date}</td>
      <td className="px-6 py-4 text-right font-medium">{amount}</td>
    </tr>
  );
}

function WarrantiesView() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Warranties</h2>
        <p className="text-muted-foreground mt-1">Keep track of your product warranties and expiries.</p>
      </div>
      <div className="rounded-xl border border-border/50 bg-background/80 overflow-x-auto scrollbar-hide">
        <table className="w-full text-sm text-left min-w-[600px]">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Coverage</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Expires In</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            <WarrantyRow title="Sony WH-1000XM5" coverage="1 Year" status="Expiring Soon" expires="14 days" warning />
            <WarrantyRow title="MacBook Pro M3" coverage="1 Year" status="Active" expires="11 months" />
            <WarrantyRow title="Kindle Oasis" coverage="1 Year" status="Active" expires="6 months" />
            <WarrantyRow title="Secretlab Titan Evo" coverage="5 Years" status="Active" expires="4.5 years" />
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function WarrantyRow({ title, coverage, status, expires, warning }: { title: string, coverage: string, status: string, expires: string, warning?: boolean }) {
  return (
    <tr className="hover:bg-muted/20 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-yellow-500" />
          </div>
          <span className="font-medium">{title}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-muted-foreground">{coverage}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
          warning ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' : 'bg-green-500/10 text-green-600 border-green-500/20'
        }`}>
          {status}
        </span>
      </td>
      <td className={`px-6 py-4 text-right font-medium ${warning ? 'text-yellow-600' : 'text-muted-foreground'}`}>{expires}</td>
    </tr>
  );
}

function ReceiptsView() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Receipts</h2>
        <p className="text-muted-foreground mt-1">View and manage your digitized receipts.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <ReceiptCard title="Apple Store Receipt" date="Today" amount="₹1,54,999" />
        <ReceiptCard title="Amazon Invoice" date="Yesterday" amount="₹29,990" />
        <ReceiptCard title="Best Buy" date="Jan 12" amount="₹21,999" />
        <ReceiptCard title="Target" date="Jan 05" amount="₹4,500" />
      </div>
    </motion.div>
  );
}

function ReceiptCard({ title, date, amount }: { title: string, date: string, amount: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-background/80 p-4 hover:bg-muted/20 transition-colors cursor-pointer group">
      <div className="w-full h-32 bg-muted/30 rounded-lg flex items-center justify-center mb-4 group-hover:bg-muted/50 transition-colors">
        <FileText className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <h4 className="font-medium text-sm truncate">{title}</h4>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-muted-foreground">{date}</span>
        <span className="text-sm font-semibold text-primary">{amount}</span>
      </div>
    </div>
  );
}

function SubscriptionsView() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Subscriptions</h2>
        <p className="text-muted-foreground mt-1">Manage your recurring payments and services.</p>
      </div>
      <div className="rounded-xl border border-border/50 bg-background/80 overflow-x-auto scrollbar-hide">
        <table className="w-full text-sm text-left min-w-[600px]">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-6 py-4 font-medium">Service</th>
              <th className="px-6 py-4 font-medium">Cycle</th>
              <th className="px-6 py-4 font-medium">Next Bill</th>
              <th className="px-6 py-4 font-medium text-right">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            <SubscriptionRow title="Netflix Premium" cycle="Monthly" nextBill="Feb 15" cost="₹649" />
            <SubscriptionRow title="Spotify Premium" cycle="Monthly" nextBill="Feb 22" cost="₹119" />
            <SubscriptionRow title="Amazon Prime" cycle="Yearly" nextBill="Oct 10" cost="₹1,499" />
            <SubscriptionRow title="Adobe Creative Cloud" cycle="Monthly" nextBill="Mar 01" cost="₹2,384" />
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function SubscriptionRow({ title, cycle, nextBill, cost }: { title: string, cycle: string, nextBill: string, cost: string }) {
  return (
    <tr className="hover:bg-muted/20 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5 text-purple-500" />
          </div>
          <span className="font-medium">{title}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-muted-foreground">{cycle}</td>
      <td className="px-6 py-4 text-muted-foreground">{nextBill}</td>
      <td className="px-6 py-4 text-right font-medium">{cost}</td>
    </tr>
  );
}

function AnalyticsView() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground mt-1">Detailed breakdown of your spending habits.</p>
      </div>
      
      <div className="grid gap-4 grid-cols-3">
        <StatCard title="Total Spent (YTD)" value="₹3,42,000" trend="+12% from last year" icon={<BarChart3 className="w-4 h-4 text-muted-foreground" />} trendIcon={<TrendingUp className="w-3 h-3 mr-1 text-green-500" />} />
        <StatCard title="Top Category" value="Electronics" trend="54% of total spending" icon={<Package className="w-4 h-4 text-muted-foreground" />} />
        <StatCard title="Average Purchase" value="₹12,450" trend="Across 34 items" icon={<CreditCard className="w-4 h-4 text-muted-foreground" />} />
      </div>

      <div className="rounded-xl border border-border/50 bg-background/80 p-6 shadow-sm">
        <h3 className="font-semibold text-lg mb-6">Category Breakdown</h3>
        <div className="space-y-5">
          <CategoryBar name="Electronics" amount="₹1,85,000" percentage={54} color="bg-blue-500" />
          <CategoryBar name="Home & Furniture" amount="₹85,000" percentage={25} color="bg-purple-500" />
          <CategoryBar name="Subscriptions" amount="₹42,000" percentage={12} color="bg-pink-500" />
          <CategoryBar name="Other" amount="₹30,000" percentage={9} color="bg-yellow-500" />
        </div>
      </div>
    </motion.div>
  );
}

function CategoryBar({ name, amount, percentage, color }: { name: string, amount: string, percentage: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium">{name}</span>
        <span className="text-muted-foreground">{amount}</span>
      </div>
      <div className="h-2.5 w-full bg-muted/50 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function AIChatView() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col h-full">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">AI Assistant</h2>
        <p className="text-muted-foreground mt-1">Ask questions about your purchases and warranties.</p>
      </div>
      
      <div className="flex-1 rounded-xl border border-border/50 bg-background/80 mt-4 flex flex-col overflow-hidden shadow-sm">
        <div className="flex-1 p-4 overflow-y-auto space-y-6">
          <ChatMessage isAi message="Hi there! I'm your Ownly AI assistant. You can ask me about your purchases, warranties, or spending habits." />
          <ChatMessage isAi={false} message="When does the warranty for my MacBook Pro expire?" />
          <ChatMessage isAi message="Your MacBook Pro M3 was purchased on Jan 16, 2026. The 1-year warranty will expire on Jan 16, 2027 (in 11 months)." />
          <ChatMessage isAi={false} message="How much have I spent on electronics this year?" />
          <ChatMessage isAi message="You've spent ₹1,85,000 on Electronics so far this year. This makes up 54% of your total tracked spending." />
        </div>
        <div className="p-4 border-t border-border/50 bg-background/50 flex gap-2 shrink-0">
          <div className="flex-1 bg-muted/30 rounded-full px-4 py-2.5 border border-border/50 text-sm text-muted-foreground flex items-center">
            Ask something...
          </div>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors">
            <Send className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ChatMessage({ isAi, message }: { isAi: boolean, message: string }) {
  return (
    <div className={`flex gap-3 ${isAi ? '' : 'flex-row-reverse'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isAi ? 'bg-primary/10 text-primary' : 'bg-secondary text-foreground border border-border/50'}`}>
        {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>
      <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm ${isAi ? 'bg-muted/50 rounded-tl-sm' : 'bg-primary text-primary-foreground rounded-tr-sm'}`}>
        {message}
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon, trendIcon }: { title: string, value: string, trend: string, icon: React.ReactNode, trendIcon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/50 bg-background/80 p-5 hover:bg-muted/30 transition-colors group relative overflow-hidden shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-center justify-between mb-3 relative z-10">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {icon}
      </div>
      <div className="relative z-10">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs mt-1 flex items-center text-muted-foreground">
          {trendIcon}
          {trend}
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ title, store, date, amount, type, isLast }: { title: string, store: string, date: string, amount: string, type: 'purchase' | 'warranty' | 'subscription', isLast?: boolean }) {
  return (
    <div className={`flex items-center gap-4 p-4 border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer ${isLast ? 'border-0' : ''}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
        type === 'purchase' ? 'bg-primary/10 text-primary' : 
        type === 'warranty' ? 'bg-yellow-500/10 text-yellow-500' : 
        'bg-purple-500/10 text-purple-500'
      }`}>
        {type === 'purchase' ? <ShoppingBag className="w-4 h-4" /> : 
         type === 'warranty' ? <ShieldAlert className="w-4 h-4" /> : 
         <RefreshCw className="w-4 h-4" />}
      </div>
      <div className="flex-1 overflow-hidden">
        <h4 className="font-medium text-sm truncate">{title}</h4>
        <p className="text-xs text-muted-foreground truncate">{store} • {date}</p>
      </div>
      <div className="text-right shrink-0">
        <span className="font-semibold text-sm">{amount}</span>
      </div>
    </div>
  );
}
