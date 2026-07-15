"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { Purchase } from "@/components/dashboard/dashboard-ui";
import { Subscription } from "@/components/dashboard/subscriptions-ui";

interface Props {
  user: any;
  purchases: Purchase[];
  subscriptions: Subscription[];
  vaults: any[];
  activeVaultId?: string;
  children: React.ReactNode;
}

export function DashboardLayoutClient({ user, purchases, subscriptions, vaults, activeVaultId, children }: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen w-full bg-background flex">
      {/* Desktop Sidebar */}
      <div 
        className={`hidden md:block fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full overflow-hidden'
        }`}
      >
        <div className="w-64 h-full">
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        className={`flex w-full flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'md:pl-64' : 'pl-0'
        }`}
      >
        <Topbar 
          user={user} 
          purchases={purchases} 
          subscriptions={subscriptions}
          vaults={vaults}
          activeVaultId={activeVaultId}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
