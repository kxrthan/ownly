"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Purchase } from "@/components/dashboard/dashboard-ui";
import { CheckCircle2, FileText, Image as ImageIcon, Download, Loader2 } from "lucide-react";
import { exportReceiptsWithImagesToPDF } from "@/lib/export-utils";
import { toast } from "sonner";
import Image from "next/image";

interface ExportReceiptsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchases: Purchase[];
}

export function ExportReceiptsModal({ open, onOpenChange, purchases }: ExportReceiptsModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === purchases.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(purchases.map(p => p.id)));
    }
  };

  const handleExport = async () => {
    if (selectedIds.size === 0) return;
    setIsExporting(true);
    try {
      const selectedPurchases = purchases.filter(p => selectedIds.has(p.id));
      await exportReceiptsWithImagesToPDF(selectedPurchases);
      toast.success("Receipts exported successfully!");
      onOpenChange(false);
      setSelectedIds(new Set());
    } catch (error) {
      console.error(error);
      toast.error("Failed to export receipts. Some images might not be accessible.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Export Receipts</DialogTitle>
          <DialogDescription>
            Select the receipts you want to include in the PDF export. The document will include high-quality images of the selected receipts.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
          <Button variant="ghost" size="sm" onClick={handleSelectAll}>
            {selectedIds.size === purchases.length ? "Deselect All" : "Select All"}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-[300px] py-4 space-y-3 pr-2 scrollbar-hide">
          {purchases.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No receipts available.</p>
          ) : (
            purchases.map((purchase) => {
              const isSelected = selectedIds.has(purchase.id);
              const isPdf = purchase.receipt_url?.toLowerCase().endsWith(".pdf");
              return (
                <div 
                  key={purchase.id}
                  onClick={() => toggleSelection(purchase.id)}
                  className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? "border-primary bg-primary/5" : "border-border/50 hover:bg-muted/30"}`}
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  
                  <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center shrink-0 overflow-hidden relative">
                    {isPdf ? (
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    ) : purchase.signed_url ? (
                      <Image src={purchase.signed_url || ""} alt="" fill className="object-cover" />

                    ) : (
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{purchase.item_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{purchase.store}</p>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <p className="font-medium text-sm">{purchase.price ? `₹${purchase.price.toLocaleString()}` : "N/A"}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(purchase.purchase_date || purchase.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="pt-4 border-t sm:justify-between flex-row items-center gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={selectedIds.size === 0 || isExporting} className="gap-2">
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isExporting ? "Generating PDF..." : `Export ${selectedIds.size} Receipt(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
