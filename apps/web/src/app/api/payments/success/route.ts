import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import db from "@tatenda/db";

export async function POST(request: Request) {
  try {
    const session = await authClient.getSession({
      fetchOptions: {
        headers: await headers(),
        throw: true,
      },
    });

    if (!session?.user) {
      return Response.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { intermittentPaymentId } = body as { intermittentPaymentId: string };

    if (!intermittentPaymentId) {
      return Response.json(
        { message: "Intermittent payment ID is required" },
        { status: 400 }
      );
    }

    // Find the intermittent payment
    const intermittentPayment = await db.intermittentPayment.findUnique({
      where: { id: intermittentPaymentId },
    });

    if (!intermittentPayment) {
      return Response.json(
        { 
          success: false,
          error: "INVALID_PAYMENT",
          message: "Payment not found" 
        },
        { status: 404 }
      );
    }

    // Check if payment belongs to this user
    if (intermittentPayment.userId !== session.user.id) {
      return Response.json(
        { 
          success: false,
          error: "UNAUTHORIZED",
          message: "Unauthorized access to this payment" 
        },
        { status: 403 }
      );
    }

    // Check if already completed
    if (intermittentPayment.completed) {
      // Get current credits for the user
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true },
      });

      return Response.json({
        success: false,
        error: "ALREADY_COMPLETED",
        message: "This payment has already been processed",
        credits: user?.credits || 0,
      });
    }

    // Process the payment in a transaction
    const result = await db.$transaction(async (tx) => {
      // 1. Mark the purchase as paid
      await tx.purchase.update({
        where: { id: intermittentPayment.purchaseId },
        data: { paid: true },
      });

      // 2. Give the user the credits they paid for
      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: {
          credits: {
            increment: intermittentPayment.credits,
          },
        },
        select: { credits: true },
      });

      // 3. Mark the intermittent payment as completed
      await tx.intermittentPayment.update({
        where: { id: intermittentPaymentId },
        data: { completed: true },
      });

      return updatedUser;
    });

    return Response.json({
      success: true,
      message: "Payment processed successfully",
      credits: result.credits,
      creditsAdded: intermittentPayment.credits,
    });
  } catch (error) {
    console.error("Payment success error:", error);
    return Response.json(
      { 
        success: false,
        error: "PROCESSING_ERROR",
        message: "Failed to process payment" 
      },
      { status: 500 }
    );
  }
}
