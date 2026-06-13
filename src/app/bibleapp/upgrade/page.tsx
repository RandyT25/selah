import { UpgradePageClient } from "./UpgradePageClient";

export const metadata = { title: "Upgrade — Selah" };

export default function UpgradePage() {
  const paymentsEnabled = process.env.PAYMENTS_ENABLED === "true";
  return <UpgradePageClient paymentsEnabled={paymentsEnabled} />;
}
