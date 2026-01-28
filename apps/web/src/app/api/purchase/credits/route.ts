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
    console.log("[Purchase] Starting purchase request");
    
    const session = await authClient.getSession({
      fetchOptions: {
        headers: await headers(),
        throw: true,
      },
    });

    if (!session?.user) {
      console.log("[Purchase] Unauthorized - no session");
      return Response.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("[Purchase] User authenticated:", session.user.id);

    const body = await request.json();
    const { packageId } = body as { packageId: PackageId };

    if (!packageId) {
      console.log("[Purchase] Missing packageId");
      return Response.json(
        { message: "Package ID is required" },
        { status: 400 }
      );
    }

    console.log("[Purchase] Package ID:", packageId);

    // Get package details
    const pkg = getPackageById(packageId);
    if (!pkg) {
      console.log("[Purchase] Invalid package:", packageId);
      return Response.json(
        { message: "Invalid package" },
        { status: 400 }
      );
    }

    console.log("[Purchase] Package found:", pkg.name, "$" + pkg.price);

    // Create purchase record in database
    const purchase = await db.purchase.create({
      data: {
        amount: pkg.price,
        credits: pkg.credits,
        userId: session.user.id,
        paid: false,
      },
    });

    console.log("[Purchase] Purchase record created:", purchase.id);

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

    console.log("[Purchase] Intermittent payment created:", intermittentPayment.id);

    // Initialize Paynow
    console.log("[Purchase] Initializing Paynow with ID:", env.PAYNOW_INTEGRATION_ID ? "***present***" : "MISSING");
    
    if (!env.PAYNOW_INTEGRATION_ID || !env.PAYNOW_INTEGRATION_KEY) {
      throw new Error("Paynow credentials are not configured");
    }

    const paynow = new Paynow(
      env.PAYNOW_INTEGRATION_ID,
      env.PAYNOW_INTEGRATION_KEY
    );

    // Set return and result URLs
    const resultUrl = `${webEnv.NEXT_PUBLIC_APP_URL}/api/payments/webhook`;
    const returnUrl = `${webEnv.NEXT_PUBLIC_APP_URL}/payments/success?intermittentPaymentId=${intermittentPayment.id}`;
    
    console.log("[Purchase] Setting URLs - Result:", resultUrl, "Return:", returnUrl);
    
    paynow.resultUrl = resultUrl;
    paynow.returnUrl = returnUrl;

    // Create payment
    console.log("[Purchase] Creating payment with reference: Credits-" + purchase.id);
    
    const payment = paynow.createPayment(
      `Credits-${purchase.id}`,
      session.user.email
    );

    // Add credits as item
    const itemName = `${pkg.credits} Tatenda Credits (${pkg.name} Package)`;
    console.log("[Purchase] Adding item:", itemName, "Price:", pkg.price);
    
    payment.add(itemName, pkg.price);

    // Send payment to Paynow
    console.log("[Purchase] Sending payment to Paynow...");
    
    let response;
    try {
      response = await paynow.send(payment);
      console.log("[Purchase] Paynow response received:", {
        success: response.success,
        error: response.error,
        redirectUrl: response.redirectUrl ? "present" : "missing",
        pollUrl: response.pollUrl ? "present" : "missing",
      });
    } catch (paynowError) {
      console.error("[Purchase] Paynow API error:", paynowError);
      throw paynowError;
    }

    if (response.success) {
      // Save poll URL to intermittent payment for later status checks
      await db.intermittentPayment.update({
        where: { id: intermittentPayment.id },
        data: { pollUrl: response.pollUrl },
      });

      console.log("[Purchase] Payment successful, redirecting to:", response.redirectUrl);

      return Response.json({
        success: true,
        redirectUrl: response.redirectUrl,
        intermittentPaymentId: intermittentPayment.id,
      });
    } else {
      // Clean up on failure
      console.log("[Purchase] Payment failed, cleaning up...");
      
      await db.intermittentPayment.delete({
        where: { id: intermittentPayment.id },
      });
      await db.purchase.delete({
        where: { id: purchase.id },
      });

      console.error("[Purchase] Payment initiation failed:", response.error);

      return Response.json(
        { message: "Failed to initiate payment", error: response.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[Purchase] Unexpected error:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      fullError: error,
    });
    
    return Response.json(
      { 
        message: "Failed to process purchase",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
