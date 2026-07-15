"use client";

import { useState } from "react";
import { RefreshCw, Search, Trash2, CheckCircle2, MoreVertical, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddSubscriptionModal } from "@/components/dashboard/add-subscription-modal";

import { toast } from "sonner";
import { bulkDeleteSubscriptions, deleteSubscription } from "@/app/dashboard/subscriptions/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Subscription {
  id: string;
  service_name: string;
  price: number;
  billing_cycle: string;
  next_billing_date: string;
  created_at: string;
}

export function SubscriptionsUI({ subscriptions }: { subscriptions: Subscription[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  // Selection Mode State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredSubscriptions = subscriptions.filter((s) => 
    s.service_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    if (confirm(`Are you sure you want to permanently delete ${selectedIds.size} subscription(s)?`)) {
      setIsDeleting(true);
      try {
        await bulkDeleteSubscriptions(Array.from(selectedIds));
        setSelectedIds(new Set());
        setIsSelectMode(false);
      } catch (error) {
        console.error("Bulk delete failed:", error);
        toast.error("Failed to delete subscriptions.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Calculate Monthly Spend
  const calculateMonthlySpend = () => {
    let total = 0;
    subscriptions.forEach((sub) => {
      if (sub.billing_cycle === "Monthly") {
        total += Number(sub.price);
      } else if (sub.billing_cycle === "Yearly") {
        total += Number(sub.price) / 12;
      }
    });
    return total;
  };

  const monthlySpend = calculateMonthlySpend();

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-32">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <RefreshCw className="w-8 h-8 text-primary" />
            Subscriptions
          </h1>
          <p className="text-muted-foreground mt-1">Track your recurring monthly and yearly costs.</p>
        </div>
        <div className="flex items-center gap-3">
          <AddSubscriptionModal />
        </div>
      </div>

      {/* Monthly Spend Widget */}
      <div className="bg-gradient-to-br from-primary/20 via-primary/5 to-background border border-primary/20 rounded-2xl p-6 mb-8 flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <RefreshCw className="w-32 h-32 text-primary" />
        </div>
        <div className="relative z-10">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Estimated Monthly Spend</h3>
          <p className="text-4xl font-bold text-foreground flex items-baseline gap-1">
            ₹{monthlySpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-lg text-muted-foreground font-normal">/mo</span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search services..." 
              className="pl-9 rounded-full bg-background/50 border-border/50 focus-visible:ring-primary h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant={isSelectMode ? "secondary" : "outline"}
            size="icon"
            className={`rounded-full shrink-0 border-border/50 transition-colors ${isSelectMode ? "bg-primary/10 text-primary border-primary/20" : "bg-background"}`}
            onClick={() => {
              setIsSelectMode(!isSelectMode);
              if (isSelectMode) setSelectedIds(new Set());
            }}
            title={isSelectMode ? "Cancel Selection" : "Select Items to Delete"}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div 
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-secondary border border-border shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 transition-all duration-300 z-50 ${
          selectedIds.size > 0 
            ? "opacity-100 translate-y-0 scale-100" 
            : "opacity-0 translate-y-8 scale-95 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-2 font-medium text-foreground">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          {selectedIds.size} Selected
        </div>
        <div className="h-6 w-px bg-border/50"></div>
        <Button 
          variant="destructive" 
          size="sm" 
          className="rounded-full shadow-lg"
          onClick={handleBulkDelete}
          disabled={isDeleting}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {isDeleting ? "Deleting..." : "Delete Selected"}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-full"
          onClick={() => {
            setSelectedIds(new Set());
            setIsSelectMode(false);
          }}
        >
          Cancel
        </Button>
      </div>

      <div className="rounded-xl border border-border/50 bg-background/50 overflow-x-auto scrollbar-hide">
        <table className="w-full text-xs sm:text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              {isSelectMode && <th className="px-2 sm:px-6 py-3 sm:py-4 font-medium w-10"></th>}
              <th className="px-2 sm:px-6 py-3 sm:py-4 font-medium">Service</th>
              <th className="hidden sm:table-cell px-6 py-4 font-medium">Billing Cycle</th>
              <th className="px-2 sm:px-6 py-3 sm:py-4 font-medium">Next Billing Date</th>
              <th className="px-2 sm:px-6 py-3 sm:py-4 font-medium text-right">Price</th>
              <th className="px-2 sm:px-6 py-3 sm:py-4 font-medium text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filteredSubscriptions.length === 0 ? (
              <tr>
                <td colSpan={isSelectMode ? 6 : 5} className="px-6 py-12 text-center text-muted-foreground">
                  No subscriptions found.
                </td>
              </tr>
            ) : (
              filteredSubscriptions.map((sub) => {
                const isSelected = selectedIds.has(sub.id);
                
                // Check if next billing is very soon (within 7 days)
                const nextDate = new Date(sub.next_billing_date);
                const now = new Date();
                const daysUntil = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const isBillingSoon = daysUntil >= 0 && daysUntil <= 7;

                return (
                  <tr 
                    key={sub.id} 
                    className={`transition-colors group ${isSelected ? "bg-primary/5" : "hover:bg-muted/20"}`}
                    onClick={() => {
                      if (isSelectMode) toggleSelection(sub.id);
                    }}
                    style={{ cursor: isSelectMode ? 'pointer' : 'default' }}
                  >
                    {isSelectMode && (
                      <td className="px-2 sm:px-6 py-3 sm:py-4">
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? "bg-primary border-primary text-primary-foreground" : "border-border/50 bg-background"}`}>
                          {isSelected && <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                        </div>
                      </td>
                    )}
                    <td className="px-2 sm:px-6 py-3 sm:py-4">
                      <span className="font-medium truncate max-w-[120px] sm:max-w-[200px] block" title={sub.service_name}>
                        {sub.service_name}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4">
                      <span className="inline-flex items-center rounded-full border border-border/50 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground bg-muted/20">
                        {sub.billing_cycle}
                      </span>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <div className="flex items-center gap-1.5">
                          <Calendar className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isBillingSoon ? "text-yellow-500" : "text-muted-foreground"}`} />
                          <span className={isBillingSoon ? "text-yellow-600 font-medium dark:text-yellow-500 whitespace-nowrap" : "text-muted-foreground whitespace-nowrap"}>
                            {nextDate.toLocaleDateString('en-US', { year: '2-digit', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        {isBillingSoon && <span className="text-[10px] sm:text-xs bg-yellow-500/20 px-1.5 rounded-full py-0.5 w-max">Soon</span>}
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-right font-medium">
                      ₹{sub.price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-right" onClick={(e) => isSelectMode && e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-6 w-6 sm:h-8 sm:w-8 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity" />}>
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background border-border/50">
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                            onClick={async () => {
                              if (confirm("Are you sure you want to delete this subscription?")) {
                                try {
                                  await deleteSubscription(sub.id);
                                } catch (error) {
                                  console.error("Delete failed:", error);
                                  toast.error("Failed to delete subscription");
                                }
                              }
                            }}
                          >
                            Delete Item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
