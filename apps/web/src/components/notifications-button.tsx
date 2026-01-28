"use client";

import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification03Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  text: string;
  status: string;
  triggerLink: string | null;
  createdAt: string;
}

export function NotificationsButton() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.triggerLink) {
      router.push(notification.triggerLink as any);
    }
  };

  return (
    <Sheet>
      <SheetTrigger render={
        <Button variant="secondary" size="icon" className="relative">
          <HugeiconsIcon icon={Notification03Icon} size={20} strokeWidth={1.5} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-brand text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      } />
      <SheetContent side="right" className="w-96">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            {notifications.length === 0 
              ? "You have no notifications" 
              : `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
            }
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                onClick={() => handleNotificationClick(notification)}
              >
                <p className="text-sm font-medium">{notification.text}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
