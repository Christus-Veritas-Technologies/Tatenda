import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import db from "@tatenda/db";
import { env } from "@tatenda/env/server";
import { env as webEnv } from "@tatenda/env/web";
import { getPackageById, type PackageId } from "@/lib/packages";
// @ts-expect-error - paynow types not available
import { Paynow } from "paynow";

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
    const { packageId } = body as { packageId: PackageId };

    if (!packageId) {
      return Response.json(
        { message: "Package ID is required" },
        { status: 400 }
      );
    }

    // Get package details
    const pkg = getPackageById(packageId);
    if (!pkg) {
      return Response.json(
        { message: "Invalid package" },
        { status: 400 }
      );
    }

    // Create purchase record in database
    const purchase = await db.purchase.create({
      data: {
        amount: pkg.price,
        credits: pkg.credits,
        userId: session.user.id,
        paid: false,
      },
    });

    // Create intermittent payment record
    const intermittentPayment = await db.intermittentPayment.create({
      data: {
        amount: pkg.price,
        credits: pkg.credits,
        purchaseId: purchase.id,
        userId: session.user.id,
        completed: false,
      },
    });

    // Initialize Paynow
    const paynow = new Paynow(
      env.PAYNOW_INTEGRATION_ID,
      env.PAYNOW_INTEGRATION_KEY
    );

    // Set return and result URLs
    paynow.resultUrl = `${webEnv.NEXT_PUBLIC_APP_URL}/api/payments/webhook`;
    paynow.returnUrl = `${webEnv.NEXT_PUBLIC_APP_URL}/payments/success?intermittentPaymentId=${intermittentPayment.id}`;

    // Create payment
    const payment = paynow.createPayment(
      `Credits-${purchase.id}`,
      session.user.email
    );

    // Add credits as item
    payment.add(`${pkg.credits} Tatenda Credits (${pkg.name} Package)`, pkg.price);

    // Send payment to Paynow
    const response = await paynow.send(payment);

    if (response.success) {
      // Save poll URL to intermittent payment for later status checks
      await db.intermittentPayment.update({
        where: { id: intermittentPayment.id },
        data: { pollUrl: response.pollUrl },
      });

      return Response.json({
        success: true,
        redirectUrl: response.redirectUrl,
        intermittentPaymentId: intermittentPayment.id,
      });
    } else {
      // Clean up on failure
      await db.intermittentPayment.delete({
        where: { id: intermittentPayment.id },
      });
      await db.purchase.delete({
        where: { id: purchase.id },
      });

      return Response.json(
        { message: "Failed to initiate payment", error: response.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Purchase credits error:", error);
    return Response.json(
      { message: "Failed to process purchase" },
      { status: 500 }
    );
  }
}
