"use client";

import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { addSubscription } from "@/app/dashboard/subscriptions/actions";

export function AddSubscriptionModal() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      await addSubscription(formData);
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add subscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="rounded-full shadow-[0_0_15px_rgba(79,124,255,0.3)]" />}>
        <Plus className="w-4 h-4 mr-2" />
        Add Subscription
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-background border-border/50">
        <div className="p-6 pb-0">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add Subscription
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Track a new recurring monthly or yearly cost.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service_name">Service Name *</Label>
            <Input id="service_name" name="service_name" required placeholder="e.g. Netflix, Spotify" className="bg-muted/50" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input id="price" name="price" type="number" step="0.01" required placeholder="e.g. 199.00" className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing_cycle">Billing Cycle *</Label>
              <select 
                id="billing_cycle" 
                name="billing_cycle" 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="next_billing_date">Next Billing Date *</Label>
            <Input 
              id="next_billing_date" 
              name="next_billing_date" 
              type="date" 
              required
              defaultValue={new Date().toISOString().split('T')[0]} 
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
                "Save Subscription"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
