"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";
import Link from "next/link";

interface UpgradeToBusinessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
}

export function UpgradeToBusinessModal({ open, onOpenChange, featureName = "this feature" }: UpgradeToBusinessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center p-8">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mt-2">
            <Briefcase className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">Upgrade to Pro</DialogTitle>
          <DialogDescription className="text-center text-base mt-2">
            You need to be on the Pro plan to use {featureName}. Upgrade now to unlock advanced data exports, multi-user support, and AI insights!
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col sm:justify-center gap-2 sm:space-x-0 mt-6">
          <Link href="/?checkout=Pro#pricing" className="w-full">
            <Button size="lg" className="w-full rounded-full font-semibold">
              Upgrade to Pro Plan
            </Button>
          </Link>
          <Button variant="ghost" className="w-full rounded-full" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
