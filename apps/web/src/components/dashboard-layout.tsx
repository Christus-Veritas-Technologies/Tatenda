"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  FileScriptIcon,
  CreditCardIcon,
  UserIcon,
  Settings02Icon,
  Robot02Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NotificationsButton } from "@/components/notifications-button";
import UserMenu from "@/components/user-menu";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard" as const,
    icon: Home01Icon,
  },
  {
    title: "Projects",
    url: "/dashboard/projects" as const,
    icon: FileScriptIcon,
  },
  {
    title: "Billing",
    url: "/dashboard/billing" as const,
    icon: CreditCardIcon,
  },
  {
    title: "Account",
    url: "/dashboard/account" as const,
    icon: UserIcon,
  },
  {
    title: "Settings",
    url: "/dashboard/settings" as const,
    icon: Settings02Icon,
  },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarContent>
        {/* Logo/Brand */}
        <SidebarGroup>
          <div className="flex items-center gap-2 px-4 py-4">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <HugeiconsIcon
                icon={Robot02Icon}
                size={20}
                color="#ffffff"
                strokeWidth={1.5}
              />
            </div>
            <span className="font-semibold text-lg text-foreground">Tatenda</span>
          </div>
        </SidebarGroup>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <Link href={item.url as any} className="w-full">
                      <SidebarMenuButton isActive={isActive}>
                        <HugeiconsIcon
                          icon={item.icon}
                          size={20}
                          strokeWidth={1.5}
                        />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function DashboardLayout({ children, creditsRemaining }: { children: React.ReactNode; creditsRemaining?: number }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="border-b bg-background">
            <div className="flex h-16 items-center justify-between px-4">
              <SidebarTrigger />
              <div className="flex items-center gap-3">
                {creditsRemaining !== undefined && (
                  <div className="bg-brand/10 text-brand px-3 py-1 rounded-full text-sm font-medium">
                    {creditsRemaining} credits left
                  </div>
                )}
                <NotificationsButton />
                <UserMenu />
              </div>
            </div>
          </div>
          <div className="flex-1 p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
