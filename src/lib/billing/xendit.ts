import Xendit from "xendit-node";

let _xendit: Xendit | null = null;

export function getXendit(): Xendit {
  if (!_xendit) {
    const key = process.env.XENDIT_SECRET_KEY;
    if (!key) throw new Error("XENDIT_SECRET_KEY is not configured");
    _xendit = new Xendit({ secretKey: key });
  }
  return _xendit;
}

export function xenditConfigured(): boolean {
  return Boolean(process.env.XENDIT_SECRET_KEY);
}

// IDR amounts — Xendit works in the smallest currency unit for IDR that's just IDR (no cents)
export const XENDIT_PRICES = {
  premium_monthly: 59_000,   // IDR 59.000/bulan
  premium_annual:  449_000,  // IDR 449.000/tahun (save ~37%)
  church_plus:     149_000,  // IDR 149.000/bulan per church
} as const;

export type XenditPlanKey = keyof typeof XENDIT_PRICES;
