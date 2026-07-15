"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Search, Filter, MoreVertical, Trash2, CheckCircle2, Download } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddPurchaseModal } from "@/components/dashboard/add-purchase-modal";
import { EditPurchaseModal } from "@/components/dashboard/edit-purchase-modal";
import { UpgradeToBusinessModal } from "@/components/dashboard/upgrade-to-business-modal";
import { NoDataExportModal } from "@/components/dashboard/no-data-export-modal";
import { Purchase } from "@/components/dashboard/dashboard-ui";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { deletePurchase, bulkDeletePurchases } from "@/app/dashboard/actions";
import { exportToCSV, exportToPDF } from "@/lib/export-utils";

export function PurchasesUI({ purchases, plan = "Free" }: { purchases: Purchase[], plan?: string }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "price_high" | "price_low">("newest");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showNoDataModal, setShowNoDataModal] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q) setSearchQuery(q);
    }
  }, []);
  
  // Selection Mode State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredPurchases = purchases.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      (p.item_name && p.item_name.toLowerCase().includes(query)) ||
      (p.store && p.store.toLowerCase().includes(query))
    );
  });

  filteredPurchases.sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortOrder === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    if (sortOrder === "price_high") {
      return (b.price || 0) - (a.price || 0);
    }
    if (sortOrder === "price_low") {
      return (a.price || 0) - (b.price || 0);
    }
    return 0;
  });

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
    
    if (confirm(`Are you sure you want to permanently delete ${selectedIds.size} item(s)?`)) {
      setIsDeleting(true);
      try {
        await bulkDeletePurchases(Array.from(selectedIds));
        setSelectedIds(new Set());
        setIsSelectMode(false);
      } catch (error) {
        console.error("Bulk delete failed:", error);
        toast.error("Failed to delete items.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-32">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
          <p className="text-muted-foreground mt-1">Manage and track all your purchases.</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: "outline", className: "rounded-full bg-background border-border/50 cursor-pointer" })}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuItem 
                onClick={() => {
                  if (plan === 'Free') return setShowUpgradeModal(true);
                  if (filteredPurchases.length === 0) return setShowNoDataModal(true);
                  exportToCSV(filteredPurchases, "ownly_purchases.csv");
                }} 
                className="cursor-pointer flex items-center justify-between"
              >
                Export Data (CSV)
                {plan === 'Free' && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full border border-primary/20">PRO</span>}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  if (plan === 'Free') return setShowUpgradeModal(true);
                  if (filteredPurchases.length === 0) return setShowNoDataModal(true);
                  exportToPDF(filteredPurchases, "ownly_purchases.pdf");
                }} 
                className="cursor-pointer flex items-center justify-between"
              >
                Export Data (PDF)
                {plan === 'Free' && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full border border-primary/20">PRO</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AddPurchaseModal />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products, stores..." 
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
        
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="icon" className="rounded-full bg-background border-border/50" />}>
            <Filter className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-background border-border/50">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={sortOrder === "newest"} onCheckedChange={() => setSortOrder("newest")}>
                Newest First
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={sortOrder === "oldest"} onCheckedChange={() => setSortOrder("oldest")}>
                Oldest First
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={sortOrder === "price_high"} onCheckedChange={() => setSortOrder("price_high")}>
                Price: High to Low
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={sortOrder === "price_low"} onCheckedChange={() => setSortOrder("price_low")}>
                Price: Low to High
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
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
              <th className="px-2 sm:px-6 py-3 sm:py-4 font-medium">Product</th>
              <th className="hidden md:table-cell px-6 py-4 font-medium">Store</th>
              <th className="hidden sm:table-cell px-6 py-4 font-medium">Category</th>
              <th className="px-2 sm:px-6 py-3 sm:py-4 font-medium">Date</th>
              <th className="px-2 sm:px-6 py-3 sm:py-4 font-medium text-right">Amount</th>
              <th className="px-2 sm:px-6 py-3 sm:py-4 font-medium text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filteredPurchases.length === 0 ? (
              <tr>
                <td colSpan={isSelectMode ? 7 : 6} className="px-6 py-12 text-center text-muted-foreground">
                  No purchases found.
                </td>
              </tr>
            ) : (
              filteredPurchases.map((purchase) => {
                const isSelected = selectedIds.has(purchase.id);
                return (
                  <tr 
                    key={purchase.id} 
                    className={`transition-colors group ${isSelected ? "bg-primary/5" : "hover:bg-muted/20"}`}
                    onClick={() => {
                      if (isSelectMode) toggleSelection(purchase.id);
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
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-3 h-3 sm:w-5 sm:h-5 text-primary" />
                        </div>
                        <div className="flex flex-col min-w-0 max-w-[140px] sm:max-w-[200px]">
                          <span className="font-medium break-words leading-tight" title={purchase.item_name}>{purchase.item_name}</span>
                          <span className="text-[9px] sm:text-[10px] text-muted-foreground break-words leading-tight md:hidden mt-0.5">
                            {purchase.store || "Unknown"} • {purchase.category || "Uncategorized"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 text-muted-foreground">{purchase.store || "Unknown"}</td>
                    <td className="hidden sm:table-cell px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground border border-border/50">
                        {purchase.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-muted-foreground whitespace-nowrap text-[10px] sm:text-sm">
                      {new Date(purchase.purchase_date || purchase.created_at).toLocaleDateString('en-US', {
                        year: '2-digit',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-right font-medium">
                      {purchase.price ? `₹${purchase.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "N/A"}
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-right" onClick={(e) => isSelectMode && e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-6 w-6 sm:h-8 sm:w-8 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity" />}>
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background border-border/50">
                          <DropdownMenuGroup>
                            <EditPurchaseModal purchase={purchase} />
                            {purchase.receipt_url && (
                              <DropdownMenuItem onClick={() => router.push('/dashboard/receipts')}>
                                View Receipt
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                            onClick={async () => {
                              if (confirm("Are you sure you want to delete this purchase?")) {
                                try {
                                  await deletePurchase(purchase.id);
                                } catch (e) {
                                  console.error(e);
                                  toast.error("Failed to delete purchase");
                                }
                              }
                            }}
                          >
                            Delete Purchase
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
