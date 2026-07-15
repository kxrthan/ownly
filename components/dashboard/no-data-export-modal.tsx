"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileX } from "lucide-react";

interface NoDataExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NoDataExportModal({ open, onOpenChange }: NoDataExportModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center p-8">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 mt-2">
            <FileX className="w-8 h-8 text-muted-foreground" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">No Data to Export</DialogTitle>
          <DialogDescription className="text-center text-base mt-2">
            There is currently no data available for export in this section. Add some items or adjust your filters and try again!
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col sm:justify-center gap-2 sm:space-x-0 mt-6">
          <Button size="lg" className="w-full rounded-full font-semibold" onClick={() => onOpenChange(false)}>
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
