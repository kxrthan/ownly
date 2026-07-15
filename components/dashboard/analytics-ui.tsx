"use client";

import { useMemo, useState, useEffect } from "react";
import { TrendingUp, Activity, Download, DollarSign, Store, Sparkles, Loader2, CreditCard, ShieldAlert, PieChart as PieChartIcon, Lock } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Purchase } from "@/components/dashboard/dashboard-ui";
import { UpgradeToBusinessModal } from "@/components/dashboard/upgrade-to-business-modal";
import { NoDataExportModal } from "@/components/dashboard/no-data-export-modal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToCSV, exportToPDF, exportVisualToPDF } from "@/lib/export-utils";
import { generateFinancialInsights } from "@/app/dashboard/ai-actions";
import Link from "next/link";

const COLORS = ['#FBBF24', '#7D665B', '#3E2723', '#E8DAC8', '#704728', '#5C3A21', '#F4E5D1'];

export function AnalyticsUI({ purchases, plan = "Free" }: { purchases: Purchase[], plan?: string }) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showNoDataModal, setShowNoDataModal] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    if (plan !== 'Free' && purchases.length > 0 && !aiInsights) {
      setLoadingInsights(true);
      generateFinancialInsights(purchases).then(insights => {
        setAiInsights(insights);
        setLoadingInsights(false);
      }).catch(err => {
        console.error(err);
        setLoadingInsights(false);
      });
    }
  }, [plan, purchases, aiInsights]);
  
  // 1. Spending Over Time (Bar Chart)
  const monthlyData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    
    purchases.forEach(p => {
      // Use purchase_date if available, else created_at
      const dateStr = p.purchase_date || p.created_at;
      if (!dateStr) return;
      
      const date = new Date(dateStr);
      // Format: "Jan 24"
      const monthYear = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      
      if (!dataMap[monthYear]) {
        dataMap[monthYear] = 0;
      }
      dataMap[monthYear] += Number(p.price || 0);
    });

    return Object.entries(dataMap)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => {
        // Simple string sort isn't perfect for dates, but since we mostly just want chronological order,
        // we parse back to a Date object just for sorting
        const dateA = new Date(`01 ${a.month}`);
        const dateB = new Date(`01 ${b.month}`);
        return dateA.getTime() - dateB.getTime();
      });
  }, [purchases]);

  // 2. Store Breakdown (Pie Chart)
  const storeData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    
    purchases.forEach(p => {
      const storeName = p.store || "Unknown";
      if (!dataMap[storeName]) {
        dataMap[storeName] = 0;
      }
      dataMap[storeName] += Number(p.price || 0);
    });

    return Object.entries(dataMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort highest first
  }, [purchases]);

  // 3. Key Insights Calculations
  const highestSpendingStore = storeData.length > 0 ? storeData[0] : null;
  
  const totalSpend = purchases.reduce((sum, p) => sum + Number(p.price || 0), 0);
  
  // Average monthly spend = total spend / number of unique months
  const averageMonthlySpend = monthlyData.length > 0 
    ? (totalSpend / monthlyData.length)
    : 0;


  // --- ADVANCED ANALYTICS (Business Plan Only) ---
  const categoryData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    purchases.forEach(p => {
      const cat = p.category || "Other";
      if (!dataMap[cat]) dataMap[cat] = 0;
      dataMap[cat] += Number(p.price || 0);
    });
    return Object.entries(dataMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [purchases]);

  const topPurchases = useMemo(() => {
    return [...purchases]
      .sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
      .slice(0, 5);
  }, [purchases]);

  const burnRateData = useMemo(() => {
    const burnData: Array<{ month: string, total: number, isPrediction?: boolean }> = [...monthlyData];
    if (burnData.length > 0) {
      const last3 = burnData.slice(-3);
      const avg = last3.reduce((sum, d) => sum + d.total, 0) / last3.length;
      
      const lastMonthStr = burnData[burnData.length - 1].month;
      const date = new Date(`01 ${lastMonthStr}`);
      date.setMonth(date.getMonth() + 1);
      const nextMonthStr = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      
      burnData.push({ month: nextMonthStr, total: avg, isPrediction: true });
    }
    return burnData;
  }, [monthlyData]);

  return (
    <div id="analytics-dashboard" className="space-y-6 max-w-7xl mx-auto w-full pb-10 bg-background">
      <div className="flex flex-row items-start sm:items-center justify-between gap-4 mb-8" data-html2canvas-ignore="true">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-primary shrink-0" />
            <span className="truncate">Analytics</span>
          </h1>
          <p className="text-xs sm:text-base text-muted-foreground mt-1 truncate">Deep dive into your spending habits.</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className={buttonVariants({ variant: "outline", className: "rounded-full bg-background border-border/50 cursor-pointer shrink-0 h-9 px-3 sm:px-4 sm:h-10 text-xs sm:text-sm" })}>
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Export Data</span>
            <span className="sm:hidden">Export</span>
          </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuItem 
                onClick={() => {
                  if (plan === 'Free') return setShowUpgradeModal(true);
                  // For graphs, we might want to check if the graph element exists, but checking purchases is fine
                  if (purchases.length === 0) return setShowNoDataModal(true);
                  exportVisualToPDF("analytics-dashboard", "ownly_visual_report.pdf");
                }} 
                className="cursor-pointer flex items-center justify-between"
              >
                Export Graphs (PDF)
                {plan === 'Free' && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full border border-primary/20">PRO</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </div>



      {purchases.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-background/50 p-12 flex flex-col items-center text-center">
          <Store className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-medium">No Data Available</h2>
          <p className="text-muted-foreground mt-2 max-w-sm">Add some purchases to see your spending analytics and charts.</p>
        </div>
      ) : (
        <div className="relative mt-2">
          {plan === 'Free' && (
            <div className="absolute inset-0 z-20 backdrop-blur-sm bg-background/30 rounded-xl pointer-events-auto">
              <div className="sticky top-24 flex flex-col items-center justify-center pt-8">
                <div className="bg-background border border-yellow-500/30 shadow-[0_0_40px_rgba(234,179,8,0.2)] rounded-2xl p-8 text-center max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-500/20 to-yellow-500/5 flex items-center justify-center mx-auto mb-6 border border-yellow-500/30">
                    <Lock className="w-8 h-8 text-yellow-500" />
                  </div>
                  <h4 className="font-bold text-2xl mb-3 bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent">Pro Feature</h4>
                  <p className="text-muted-foreground mb-6 text-sm">
                    Upgrade to the Pro plan to unlock your AI Financial Advisor, Burn Rate Forecasting, and High-Value Asset tracking.
                  </p>
                  <Link href="/?checkout=Pro#pricing" className="w-full">
                    <Button size="lg" className="rounded-full w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold shadow-lg shadow-yellow-500/20">
                      Upgrade to Pro
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
          <div className={plan === 'Free' ? "opacity-30 pointer-events-none select-none blur-sm" : ""}>
            <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border/50 bg-background/50 p-3 sm:p-6 shadow-sm flex flex-col min-h-[400px] min-w-0">
              <div className="mb-6">
                <h3 className="font-semibold text-lg">Spending Over Time</h3>
                <p className="text-sm text-muted-foreground">Your total spending per month.</p>
              </div>
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    <Tooltip cursor={{ fill: 'var(--primary)', opacity: 0.1 }} content={<CustomTooltip />} />
                    <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Store Breakdown Chart */}
            <div className="rounded-xl border border-border/50 bg-background/50 p-3 sm:p-6 shadow-sm flex flex-col min-h-[400px] min-w-0">
              <div className="mb-2">
                <h3 className="font-semibold text-lg">Spending by Retailer</h3>
                <p className="text-sm text-muted-foreground">Where your money goes the most.</p>
              </div>
              <div className="flex-1 flex items-center justify-center min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={storeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="transparent"
                    >
                      {storeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Key Insights */}
          <div className="rounded-xl border border-border/50 bg-background/50 p-6 mt-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <SparklesIcon /> Key Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 relative overflow-hidden">
                <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 text-primary/10" />
                <h4 className="font-medium text-primary mb-1 relative z-10">Total Lifetime Spend</h4>
                <p className="text-3xl font-bold relative z-10">
                  ₹{totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-primary/70 mt-2 relative z-10">Across {purchases.length} total items</p>
              </div>

              <div className="p-5 rounded-2xl bg-secondary border border-border/50">
                <h4 className="font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <Store className="w-4 h-4" /> Top Retailer
                </h4>
                <p className="text-2xl font-bold truncate">
                  {highestSpendingStore ? highestSpendingStore.name : "N/A"}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {highestSpendingStore ? `₹${highestSpendingStore.value.toLocaleString()} total spent` : ""}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-secondary border border-border/50">
                <h4 className="font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Average Monthly Spend
                </h4>
                <p className="text-2xl font-bold mt-2">
                  ₹{averageMonthlySpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground mt-2">Based on recorded purchases</p>
              </div>

            </div>
            </div>
          </div>
          
          {/* ADVANCED ANALYTICS SECTION */}
          <div className="mt-8">
            <h3 className="font-bold text-2xl mb-6 flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent">
              <Sparkles className="w-6 h-6 text-yellow-500" /> Advanced Analytics
            </h3>
            
            <div className="relative">
              
              {/* AI CFO Widget */}
              <div className="rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-background p-6 shadow-[0_4px_20px_rgba(234,179,8,0.05)] mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0 border border-yellow-500/30 shadow-inner">
                    <Sparkles className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-yellow-700 dark:text-yellow-500 mb-2">AI Financial Advisor</h4>
                    {loadingInsights ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <p className="text-sm">Analyzing your spending patterns...</p>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {aiInsights || "Add more purchase data to receive personalized insights."}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid gap-6 lg:grid-cols-2 mb-6">
                {/* Burn Rate Forecast */}
                <div className="rounded-xl border border-border/50 bg-background/50 p-6 shadow-sm flex flex-col min-h-[400px]">
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg">Burn Rate Forecast</h3>
                    <p className="text-sm text-muted-foreground">Historical spending and 30-day projection.</p>
                  </div>
                  <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={burnRateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
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
                        <Tooltip cursor={{ fill: 'var(--primary)', opacity: 0.1 }} content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="total" 
                          stroke="#EAB308" 
                          strokeWidth={3}
                          dot={(props: any) => {
                            const { cx, cy, payload } = props;
                            if (payload.isPrediction) {
                              return <circle cx={cx} cy={cy} r={6} fill="#EAB308" fillOpacity={0.4} stroke="#EAB308" strokeWidth={2} strokeDasharray="3 3" />;
                            }
                            return <circle cx={cx} cy={cy} r={4} fill="#EAB308" stroke="none" />;
                          }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="rounded-xl border border-border/50 bg-background/50 p-6 shadow-sm flex flex-col min-h-[400px]">
                  <div className="mb-2">
                    <h3 className="font-semibold text-lg">Category Breakdown</h3>
                    <p className="text-sm text-muted-foreground">Analyze your spending by category.</p>
                  </div>
                  <div className="flex-1 flex items-center justify-center min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="transparent"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36} 
                          iconType="circle"
                          wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* High-Value Asset Tracker */}
              <div className="rounded-xl border border-border/50 bg-background/50 p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-yellow-500" /> High-Value Asset Tracker
                  </h3>
                  <p className="text-sm text-muted-foreground">Your top 5 most expensive recorded purchases.</p>
                </div>
                <div className="space-y-4">
                  {topPurchases.length > 0 ? topPurchases.map((p, idx) => (
                    <div key={p.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/50">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          #{idx + 1}
                        </div>
                        <div>
                          <p className="font-medium">{p.item_name || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">{p.store || 'Unknown'} • {p.category || 'Other'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">₹{(p.price || 0).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(p.purchase_date || p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground">No purchases recorded.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <UpgradeToBusinessModal 
        open={showUpgradeModal} 
        onOpenChange={setShowUpgradeModal} 
        featureName="data exports" 
      />

      <NoDataExportModal
        open={showNoDataModal}
        onOpenChange={setShowNoDataModal}
      />
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  );
}

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border/50 p-3 rounded-xl shadow-lg">
        <p className="font-semibold">{label || payload[0].name}</p>
        <p className="text-primary font-bold">
          ₹{payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        {payload[0].payload?.isPrediction && (
          <p className="text-xs text-muted-foreground mt-1 text-yellow-600/80 italic">Projected Burn Rate</p>
        )}
      </div>
    );
  }
  return null;
};
