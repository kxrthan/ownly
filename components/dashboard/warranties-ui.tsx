"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Search, MoreVertical, AlertCircle, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddPurchaseModal } from "@/components/dashboard/add-purchase-modal";
import { EditPurchaseModal } from "@/components/dashboard/edit-purchase-modal";
import { Purchase } from "@/components/dashboard/dashboard-ui";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { deletePurchase, bulkDeletePurchases } from "@/app/dashboard/actions";

export function WarrantiesUI({ purchases }: { purchases: Purchase[] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

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
    
    if (confirm(`Are you sure you want to permanently delete ${selectedIds.size} warranty item(s)?`)) {
      setIsDeleting(true);
      try {
        await bulkDeletePurchases(Array.from(selectedIds));
        setSelectedIds(new Set());
        setIsSelectMode(false);
        toast.success("Successfully deleted items.");
      } catch (error) {
        console.error("Bulk delete failed:", error);
        toast.error("Failed to delete items.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Calculate warranty status
  const getWarrantyInfo = (purchase: Purchase) => {
    if (!purchase.warranty_months || purchase.warranty_months <= 0) {
      return { status: "none", label: "No Warranty", color: "text-muted-foreground", bg: "bg-muted/20" };
    }

    const startDate = new Date(purchase.purchase_date || purchase.created_at);
    const expirationDate = new Date(startDate);
    expirationDate.setMonth(expirationDate.getMonth() + purchase.warranty_months);

    const now = new Date();
    const daysLeft = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return { status: "expired", label: "Expired", color: "text-red-500", bg: "bg-red-500/10", date: expirationDate };
    } else if (daysLeft <= 30) {
      return { status: "expiring", label: "Expiring Soon", color: "text-yellow-500", bg: "bg-yellow-500/10", date: expirationDate, daysLeft };
    } else {
      return { status: "active", label: "Active", color: "text-green-500", bg: "bg-green-500/10", date: expirationDate, daysLeft };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-32">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-primary" />
            Warranties
          </h1>
          <p className="text-muted-foreground mt-1">Track product warranties and never miss a claim.</p>
        </div>
        <div className="flex items-center gap-3">
          <AddPurchaseModal />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
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
              <th className="px-2 sm:px-6 py-3 sm:py-4 font-medium">Product</th>
              <th className="hidden sm:table-cell px-6 py-4 font-medium">Purchase Date</th>
              <th className="hidden md:table-cell px-6 py-4 font-medium">Duration</th>
              <th className="px-2 sm:px-6 py-3 sm:py-4 font-medium">Expiration Date</th>
              <th className="px-2 sm:px-6 py-3 sm:py-4 font-medium">Status</th>
              <th className="px-2 sm:px-6 py-3 sm:py-4 font-medium text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filteredPurchases.length === 0 ? (
              <tr>
                <td colSpan={isSelectMode ? 7 : 6} className="px-6 py-12 text-center text-muted-foreground">
                  No items found.
                </td>
              </tr>
            ) : (
              filteredPurchases.map((purchase) => {
                const info = getWarrantyInfo(purchase);
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
                      <div className="flex flex-col min-w-0 max-w-[120px] sm:max-w-[200px]">
                        <span className="font-medium break-words leading-tight" title={purchase.item_name}>
                          {purchase.item_name}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-muted-foreground break-words leading-tight sm:hidden mt-0.5">
                          {new Date(purchase.purchase_date || purchase.created_at).toLocaleDateString('en-US', { year: '2-digit', month: 'short', day: 'numeric' })} • {purchase.warranty_months ? `${purchase.warranty_months} Mo` : "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 text-muted-foreground">
                      {new Date(purchase.purchase_date || purchase.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 text-muted-foreground">
                      {purchase.warranty_months ? `${purchase.warranty_months} Months` : "N/A"}
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 font-medium text-[10px] sm:text-sm whitespace-nowrap">
                      {info.date ? info.date.toLocaleDateString('en-US', { year: '2-digit', month: 'short', day: 'numeric' }) : "—"}
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4">
                      <div className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-full px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-semibold whitespace-nowrap ${info.bg} ${info.color}`}>
                        {info.status === "active" && <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                        {info.status === "expiring" && <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                        {info.status === "expired" && <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                        {info.label}
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-right" onClick={(e) => isSelectMode && e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-6 w-6 sm:h-8 sm:w-8 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity" />}>
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background border-border/50">
                          <EditPurchaseModal purchase={purchase} />
                          <DropdownMenuGroup>
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
                                  toast.success("Purchase deleted");
                                } catch (error) {
                                  console.error("Delete failed:", error);
                                  toast.error("Failed to delete purchase");
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
