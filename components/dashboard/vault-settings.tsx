"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Copy, Check, Users, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function VaultSettings() {
   
  const [vaults, setVaults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState<string | null>(null);
   
  const [vaultToLeave, setVaultToLeave] = useState<any>(null);
  
  const [plan, setPlan] = useState("Free");
   
  const [user, setUser] = useState<any>(null);
  
  const supabase = createClient();
  const router = useRouter();

  const loadVaults = useCallback(async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      setPlan(user.user_metadata?.plan || "Free");
      const { data } = await supabase
        .from("vault_members")
        .select("vaults(id, name, owner_id, join_code)")
        .eq("user_id", user.id);
        
       
      setVaults(data?.map((d: any) => d.vaults).filter(Boolean) || []);
    }
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadVaults();
  }, [loadVaults]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleGenerateCode = async (vaultId: string) => {
    const newCode = crypto.randomUUID().substring(0, 6).toUpperCase();
    await supabase.from("vaults").update({ join_code: newCode }).eq("id", vaultId);
    await loadVaults();
  };

  const handleJoinVault = async () => {
    if (!joinCode.trim()) return;
    setIsJoining(true);
    setJoinError("");
    setJoinSuccess("");
    
    // Call the secure Server Action instead of the client
    const { joinVaultByCode } = await import("@/app/dashboard/vault-actions");
    const result = await joinVaultByCode(joinCode.trim().toUpperCase());
    
    if (result.error) {
      setJoinError(result.error);
    } else if (result.success) {
      setJoinSuccess(`Successfully joined ${result.vaultName}!`);
      setJoinCode("");
      await loadVaults();
    }
    setIsJoining(false);
  };

   
  const handleLeaveVault = (vault: any) => {
    setVaultToLeave(vault);
  };

  const confirmLeaveVault = async () => {
    if (!vaultToLeave) return;
    
    setIsLeaving(vaultToLeave.id);
    const { leaveVault } = await import("@/app/dashboard/vault-actions");
    const result = await leaveVault(vaultToLeave.id);
    if (result.success) {
      await loadVaults();
      setVaultToLeave(null);
    } else if (result.error) {
      toast.error(result.error);
    }
    setIsLeaving(null);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin w-6 h-6 text-muted-foreground" /></div>;
  }

  const ownedVaults = vaults.filter(v => v.owner_id === user?.id);
  const sharedVaults = vaults.filter(v => v.owner_id !== user?.id);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Join a Vault */}
      <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Join a Shared Vault
        </h3>
        
        {plan === 'Free' ? (
          <div className="mt-4 bg-secondary/50 p-4 rounded-lg border border-border">
            <p className="text-sm font-medium">Upgrade to Pro to join shared workspaces</p>
            <p className="text-xs text-muted-foreground mt-1 mb-3">
              The Family Vault feature is exclusive to Pro members. Upgrade now to collaborate on receipts and purchases with your family or team.
            </p>
            <Button variant="default" size="sm" onClick={() => router.push('/pricing')}>Upgrade to Pro</Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Enter a 6-character Join Code provided by your family member, partner, or employer.
            </p>
            <div className="flex items-center gap-3 max-w-sm">
              <Input 
                placeholder="e.g. X7K9P2" 
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="uppercase tracking-widest font-mono font-medium"
              />
              <Button onClick={handleJoinVault} disabled={isJoining || joinCode.length < 5}>
                {isJoining ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Join
              </Button>
            </div>
            {joinError && <p className="text-sm text-destructive mt-2">{joinError}</p>}
            {joinSuccess && <p className="text-sm text-green-500 mt-2">{joinSuccess}</p>}
          </>
        )}
      </div>

      {/* Your Vaults */}
      <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-medium mb-4">Your Workspaces</h3>
        <div className="space-y-6">
          {ownedVaults.map(vault => (
            <div key={vault.id} className="border border-border rounded-lg p-4 bg-muted/20">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-lg">{vault.name} <span className="text-xs font-normal bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-2">Owner</span></h4>
                  <p className="text-sm text-muted-foreground mt-1">This is your personal workspace. You can invite others to share it.</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                {vault.join_code ? (
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Active Join Code</Label>
                    <div className="flex items-center gap-2">
                      <div className="bg-background border border-border rounded px-4 py-2 font-mono font-bold tracking-widest text-lg">
                        {vault.join_code}
                      </div>
                      <Button variant="outline" size="icon" onClick={() => handleCopy(vault.join_code)}>
                        {copiedCode === vault.join_code ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleGenerateCode(vault.id)}>
                        Reset Code
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {plan === 'Free' ? (
                      <div className="bg-secondary p-4 rounded-lg border border-border">
                        <p className="text-sm font-medium">Upgrade to Pro to share this vault</p>
                        <p className="text-xs text-muted-foreground mt-1 mb-3">Generate a Join Code and invite your family members to share your receipts.</p>
                        <Button variant="default" size="sm" onClick={() => router.push('/pricing')}>Upgrade to Pro</Button>
                      </div>
                    ) : (
                      <Button variant="outline" onClick={() => handleGenerateCode(vault.id)}>
                        Generate Join Code
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {sharedVaults.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="font-medium mb-3">Joined Workspaces</h4>
              <div className="space-y-3">
                {sharedVaults.map(vault => (
                  <div key={vault.id} className="flex items-center justify-between border border-border rounded-lg p-3 bg-background">
                    <div>
                      <span className="font-medium">{vault.name}</span>
                      <span className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded ml-2">Member</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleLeaveVault(vault)}
                      disabled={isLeaving === vault.id}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      {isLeaving === vault.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Leave
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={vaultToLeave !== null} onOpenChange={(open) => !open && setVaultToLeave(null)}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-destructive/10 p-2 rounded-full">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <DialogTitle>Leave Workspace</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to leave <strong>{vaultToLeave?.name}</strong>? 
              You will immediately lose access to all receipts, purchases, and analytics within this shared workspace.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setVaultToLeave(null)} disabled={isLeaving !== null}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmLeaveVault} disabled={isLeaving !== null}>
              {isLeaving !== null ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Yes, Leave Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
