"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Receipt, Loader2, Sparkles } from "lucide-react";
import { addPurchase } from "@/app/dashboard/actions";
import { extractReceiptDetails } from "@/app/dashboard/ai-actions";

export function AddPurchaseModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    item_name: "",
    store: "",
    price: "",
    warranty_months: "0",
    category: "Other"
  });

  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReceiptFile(file);
    setAiLoading(true);

    try {
      const data = new FormData();
      data.append('file', file);
      const extracted = await extractReceiptDetails(data);
      
      setFormData({
        item_name: extracted.item_name || "",
        store: extracted.store || "",
        price: extracted.price ? String(extracted.price) : "",
        warranty_months: extracted.warranty_months ? String(extracted.warranty_months) : "0",
        category: extracted.category || "Other"
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to extract details with AI. Please enter manually.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = new FormData(e.currentTarget);
      if (receiptFile) {
        submitData.append('receipt_file', receiptFile);
      }
      await addPurchase(submitData);
      setOpen(false);
      setFormData({ item_name: "", store: "", price: "", warranty_months: "0", category: "Other" });
      setReceiptFile(null);
    } catch (error) {
      console.error("Error adding purchase:", error);
      toast.error("Failed to add purchase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="rounded-full shadow-[0_0_15px_rgba(79,124,255,0.3)]" />}>
        <Receipt className="w-4 h-4 mr-2" />
        Add Purchase
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-background border-border/50">
        <DialogHeader>
          <DialogTitle>Add a Purchase</DialogTitle>
          <DialogDescription>
            Upload a receipt to let AI fill out the details, or enter them manually.
          </DialogDescription>
        </DialogHeader>

        <div className="pt-2 pb-4">
          <Label htmlFor="receipt_upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/30 rounded-xl cursor-pointer bg-primary/5 hover:bg-primary/10 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {aiLoading ? (
                <>
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                  <p className="text-sm font-medium text-primary">Gemini is reading your receipt...</p>
                </>
              ) : (
                <>
                  <Sparkles className="w-8 h-8 text-primary mb-2" />
                  <p className="text-sm font-medium text-foreground">Click to upload a receipt</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, or PDF</p>
                </>
              )}
            </div>
            <input id="receipt_upload" type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} disabled={aiLoading} />
          </Label>
          {receiptFile && !aiLoading && (
            <p className="text-xs text-center text-green-500 mt-2 font-medium">✓ {receiptFile.name} attached</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item_name">Item Name</Label>
            <Input id="item_name" name="item_name" value={formData.item_name} onChange={handleInputChange} placeholder="e.g. Sony Headphones" required className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="store">Store / Retailer</Label>
            <Input id="store" name="store" value={formData.store} onChange={handleInputChange} placeholder="e.g. Amazon" required className="bg-secondary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input id="price" name="price" value={formData.price} onChange={handleInputChange} type="number" step="0.01" placeholder="e.g. 2999" required className="bg-secondary" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warranty_months">Warranty (Months)</Label>
              <Input id="warranty_months" name="warranty_months" value={formData.warranty_months} onChange={handleInputChange} type="number" placeholder="e.g. 12" required className="bg-secondary" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="Electronics">Electronics</option>
              <option value="Groceries">Groceries</option>
              <option value="Clothing">Clothing</option>
              <option value="Subscriptions">Subscriptions</option>
              <option value="Utilities">Utilities</option>
              <option value="Travel">Travel</option>
              <option value="Home">Home</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || aiLoading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Purchase
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
