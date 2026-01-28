import { NextResponse } from "next/server";
import { db } from "@tatenda/db";
import { authClient } from "@/lib/auth-client";

export async function GET() {
  try {
    const { data: session } = await authClient.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await db.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const unreadCount = notifications.filter(
      (n) => n.status === "unread"
    ).length;

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
