"use client";

import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Edit2, Loader2 } from "lucide-react";
import { updatePurchase } from "@/app/dashboard/actions";
import { Purchase } from "@/components/dashboard/dashboard-ui";

export function EditPurchaseModal({ purchase }: { purchase: Purchase }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      await updatePurchase(purchase.id, formData);
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update item");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<button className="w-full text-left px-2 py-1.5 text-sm hover:bg-muted/50 rounded-sm" />}>
        Edit Item
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-background border-border/50">
        <div className="p-6 pb-0">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-primary" />
            Edit Purchase
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Update the details for this item.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`item_name_${purchase.id}`}>Item Name *</Label>
            <Input id={`item_name_${purchase.id}`} name="item_name" defaultValue={purchase.item_name} required placeholder="e.g. MacBook Pro" className="bg-muted/50" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`store_${purchase.id}`}>Store / Merchant</Label>
            <Input id={`store_${purchase.id}`} name="store" defaultValue={purchase.store} placeholder="e.g. Apple Store" className="bg-muted/50" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`price_${purchase.id}`}>Price (₹)</Label>
              <Input id={`price_${purchase.id}`} name="price" type="number" step="0.01" defaultValue={purchase.price || ""} placeholder="0.00" className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`warranty_${purchase.id}`}>Warranty (Months)</Label>
              <Input id={`warranty_${purchase.id}`} name="warranty_months" type="number" defaultValue={purchase.warranty_months || 0} placeholder="12" className="bg-muted/50" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`purchase_date_${purchase.id}`}>Purchase Date</Label>
            <Input 
              id={`purchase_date_${purchase.id}`} 
              name="purchase_date" 
              type="date" 
              defaultValue={purchase.purchase_date || purchase.created_at.split('T')[0]} 
              className="bg-muted/50" 
            />
          </div>
          
          <div className="pt-4 flex justify-end gap-3 border-t border-border/50 mt-6">
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isLoading} className="shadow-[0_0_15px_rgba(79,124,255,0.3)]">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
