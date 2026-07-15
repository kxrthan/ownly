"use client";

import { useState } from "react";
import { Receipt, Search, FileText, ExternalLink, Trash2, CheckCircle2, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Purchase } from "@/components/dashboard/dashboard-ui";
import { AddPurchaseModal } from "@/components/dashboard/add-purchase-modal";
import { UpgradeToBusinessModal } from "@/components/dashboard/upgrade-to-business-modal";
import { NoDataExportModal } from "@/components/dashboard/no-data-export-modal";
import { ExportReceiptsModal } from "@/components/dashboard/export-receipts-modal";
import { toast } from "sonner";
import { bulkDeletePurchases } from "@/app/dashboard/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToCSV, exportToPDF } from "@/lib/export-utils";
import Link from "next/link";
import Image from "next/image";

export function ReceiptsUI({ purchases, plan = "Free" }: { purchases: Purchase[], plan?: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showNoDataModal, setShowNoDataModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

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
    
    if (confirm(`Are you sure you want to permanently delete ${selectedIds.size} receipt(s)? This will also remove the files from secure storage.`)) {
      setIsDeleting(true);
      try {
        await bulkDeletePurchases(Array.from(selectedIds));
        setSelectedIds(new Set());
      } catch (error) {
        console.error("Bulk delete failed:", error);
        toast.error("Failed to delete selected receipts.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-32">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Receipt className="w-8 h-8 text-primary" />
            Receipts Gallery
          </h1>
          <p className="text-muted-foreground mt-1">View and manage all your uploaded receipts and invoices.</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: "outline", className: "rounded-full bg-background border-border/50 cursor-pointer" })}>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuItem 
                onClick={() => {
                  if (plan === 'Free') return setShowUpgradeModal(true);
                  if (filteredPurchases.length === 0) return setShowNoDataModal(true);
                  exportToCSV(filteredPurchases, "ownly_receipts.csv");
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
                  setShowExportModal(true);
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

      {plan === 'Free' && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-primary">Unlock Your Full History</h3>
            <p className="text-sm text-muted-foreground mt-1">You are on the Free plan, which limits history to the last 7 days. Upgrade to Pro to view and search all your older receipts.</p>
          </div>
          <Link href="/?checkout=Pro#pricing" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-sm hover:opacity-90">
            Upgrade to Pro
          </Link>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search stores or items..." 
            className="pl-9 rounded-full bg-background/50 border-border/50 focus-visible:ring-primary h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button 
          variant={isSelectMode ? "secondary" : "outline"}
          size="icon"
          className={`rounded-full border-border/50 transition-colors ${isSelectMode ? "bg-primary/10 text-primary border-primary/20" : "bg-background"}`}
          onClick={() => {
            setIsSelectMode(!isSelectMode);
            if (isSelectMode) setSelectedIds(new Set());
          }}
          title={isSelectMode ? "Cancel Selection" : "Select Receipts to Delete"}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        
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
      </div>

      {filteredPurchases.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/50 rounded-xl bg-background/50 text-center">
          <Receipt className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">No receipts found</h3>
          <p className="text-sm text-muted-foreground max-w-md mt-1">
            You haven't uploaded any receipts yet. Use the Add Purchase button to upload a receipt and it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredPurchases.map((purchase) => {
            const isPdf = purchase.receipt_url?.toLowerCase().endsWith(".pdf");
            const isSelected = selectedIds.has(purchase.id);
            
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const isOld = new Date(purchase.created_at) < sevenDaysAgo;
            const shouldBlur = plan === 'Free' && isOld;
            
            return (
              <div 
                key={purchase.id} 
                className={`group relative flex flex-col overflow-hidden rounded-xl border transition-all shadow-sm ${
                  isSelected 
                    ? "border-primary ring-2 ring-primary/20 bg-primary/5" 
                    : "border-border/50 bg-secondary/50 hover:border-primary/30"
                }`}
              >
                {/* Selection Checkbox Overlay */}
                {isSelectMode && (
                  <button
                    onClick={() => toggleSelection(purchase.id)}
                    className={`absolute top-3 right-3 z-20 w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                      isSelected 
                        ? "bg-primary text-primary-foreground opacity-100" 
                        : "bg-background/80 border border-border/50 text-muted-foreground opacity-100 hover:bg-background"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}

                {isSelectMode ? (
                  <div 
                    onClick={() => {
                      if (!shouldBlur) toggleSelection(purchase.id);
                    }}
                    className={`block h-32 sm:h-40 w-full relative overflow-hidden flex items-center justify-center ${shouldBlur ? "cursor-not-allowed bg-muted/10" : "cursor-pointer bg-muted/30"}`}
                  >
                    {!shouldBlur && <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity z-10" />}
                    
                    {shouldBlur ? (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/50 backdrop-blur-md p-4 text-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        </div>
                        <span className="text-sm font-semibold text-foreground">Pro Feature</span>
                        <span className="text-xs text-muted-foreground mt-1">Upgrade to unlock</span>
                      </div>
                    ) : isPdf ? (
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <FileText className="w-16 h-16 mb-2 opacity-50" />
                        <span className="text-xs font-medium uppercase tracking-wider">PDF Document</span>
                      </div>
                    ) : (
                      <Image 
                        src={purchase.signed_url || ""} 
                        alt={`Receipt for ${purchase.item_name}`}
                        fill
                        className={`object-cover transition-transform duration-500 ${isSelected ? "scale-105" : "group-hover:scale-105"}`}
                      />
                    )}
                  </div>
                ) : shouldBlur ? (
                  <div 
                    onClick={() => setShowUpgradeModal(true)}
                    className="block h-32 sm:h-40 w-full bg-muted/10 relative overflow-hidden flex items-center justify-center cursor-pointer group-hover:ring-2 ring-primary/20 transition-all"
                  >
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/50 backdrop-blur-md p-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      </div>
                      <span className="text-sm font-semibold text-foreground">Pro Feature</span>
                      <span className="text-xs text-muted-foreground mt-1">Upgrade to unlock old receipts</span>
                    </div>
                    {/* Render a heavily blurred version of the image behind the lock */}
                    <Image 
                      src={purchase.signed_url || ""} 
                      alt=""
                      fill
                      className="object-cover opacity-30 blur-xl"
                    />
                  </div>
                ) : (
                  <a 
                    href={purchase.signed_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block h-32 sm:h-40 w-full bg-muted/30 relative overflow-hidden flex items-center justify-center cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                      <div className="bg-background/90 text-foreground text-sm font-medium px-4 py-2 rounded-full flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-lg">
                        Open <ExternalLink className="w-4 h-4" />
                      </div>
                    </div>
                    
                    {isPdf ? (
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <FileText className="w-16 h-16 mb-2 opacity-50" />
                        <span className="text-xs font-medium uppercase tracking-wider">PDF Document</span>
                      </div>
                    ) : (
                      <Image 
                        src={purchase.signed_url || ""} 
                        alt={`Receipt for ${purchase.item_name}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </a>
                )}
                
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between border-t border-border/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-foreground truncate" title={purchase.item_name}>
                        {purchase.item_name}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{purchase.store || "Unknown Store"}</p>
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-3 flex items-center justify-between gap-1">
                    <span className="font-medium text-primary text-sm sm:text-base truncate">
                      {purchase.price ? `₹${purchase.price.toLocaleString()}` : "N/A"}
                    </span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground bg-muted/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md whitespace-nowrap">
                      {new Date(purchase.purchase_date || purchase.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
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

      <ExportReceiptsModal
        open={showExportModal}
        onOpenChange={setShowExportModal}
        purchases={filteredPurchases}
      />
    </div>
  );
}
