import { NextResponse } from "next/server";

/**
 * Returns a 503 response when PAYMENTS_ENABLED !== "true".
 * Call at the top of every billing API route.
 * Returns null when payments are enabled (proceed normally).
 */
export function requirePaymentsEnabled(): NextResponse | null {
  if (process.env.PAYMENTS_ENABLED === "true") return null;
  return NextResponse.json(
    { error: "Payments are not yet available. Join the waitlist at selah.app/upgrade." },
    { status: 503 }
  );
}

export function paymentsEnabled(): boolean {
  return process.env.PAYMENTS_ENABLED === "true";
}
