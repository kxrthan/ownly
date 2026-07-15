"use client";

import { useEffect, useState } from "react";
import { User, Bell, Shield, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { VaultSettings } from "@/components/dashboard/vault-settings";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "security" | "vaults">("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [plan, setPlan] = useState("Free");
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        setFirstName(user.user_metadata?.firstName || "");
        setLastName(user.user_metadata?.lastName || "");
        
        let userPlan = user.user_metadata?.plan || "Free";
        
        // Auto-migrate legacy Business users to Pro
        if (userPlan === "Business") {
          userPlan = "Pro";
          supabase.auth.updateUser({
            data: { plan: "Pro" }
          });
        }
        
        setPlan(userPlan);
      }
      setIsLoading(false);
    }
    loadUser();
  }, [supabase.auth]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveMessage("");
    
    const { error } = await supabase.auth.updateUser({
      data: {
        firstName,
        lastName
      }
    });

    if (error) {
      setSaveMessage("Error saving profile: " + error.message);
    } else {
      setSaveMessage("Profile saved successfully!");
      router.refresh(); // Refresh to update Topbar user name if used
    }
    setIsSaving(false);
    
    setTimeout(() => {
      setSaveMessage("");
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Sidebar */}
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            className={`w-full justify-start ${activeTab === "profile" ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
            onClick={() => setActiveTab("profile")}
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </Button>
          <Button 
            variant="ghost" 
            className={`w-full justify-start ${activeTab === "notifications" ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
            onClick={() => setActiveTab("notifications")}
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
          <Button 
            variant="ghost" 
            className={`w-full justify-start ${activeTab === "security" ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
            onClick={() => setActiveTab("security")}
          >
            <Shield className="w-4 h-4 mr-2" />
            Security
          </Button>
          <Button 
            variant="ghost" 
            className={`w-full justify-start ${activeTab === "vaults" ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
            onClick={() => setActiveTab("vaults")}
          >
            <Users className="w-4 h-4 mr-2" />
            Family Vault
          </Button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          {activeTab === "profile" && (
            <div className="rounded-xl border border-border/50 bg-background/50 p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-4">Profile Information</h3>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter your first name" 
                        className="bg-background/50" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter your last name" 
                        className="bg-background/50" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      disabled
                      className="bg-background/50 text-muted-foreground" 
                    />
                    <p className="text-xs text-muted-foreground mt-1">Your email is tied to your account and cannot be changed here.</p>
                  </div>

                  <div className="space-y-2 mt-6 p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Current Plan</h4>
                      <p className="text-sm text-muted-foreground mt-1">You are currently on the <strong className="text-foreground">{plan}</strong> plan.</p>
                    </div>
                    {plan === "Free" && (
                      <Button variant="outline" onClick={() => router.push("/#pricing")} size="sm" className="rounded-full">
                        Upgrade
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-6">
                    <Button 
                      className="rounded-full shadow-[0_0_15px_rgba(79,124,255,0.3)]"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                    >
                      {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Save Changes
                    </Button>
                    
                    {saveMessage && (
                      <span className={`text-sm ${saveMessage.includes("Error") ? "text-destructive" : "text-green-600 dark:text-green-400"}`}>
                        {saveMessage}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="rounded-xl border border-border/50 bg-background/50 p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center">
              <Bell className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-lg">Notification Preferences</h3>
              <p className="text-muted-foreground max-w-sm mt-2">
                We'll automatically alert you on the dashboard when warranties expire or subscriptions renew. Email notifications coming soon!
              </p>
            </div>
          )}

          {activeTab === "security" && (
            <div className="rounded-xl border border-border/50 bg-background/50 p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center">
              <Shield className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-lg">Security Settings</h3>
              <p className="text-muted-foreground max-w-sm mt-2">
                Your account is securely managed by Supabase Auth.
              </p>
            </div>
          )}

          {activeTab === "vaults" && (
            <VaultSettings />
          )}
        </div>
      </div>
    </div>
  );
}
