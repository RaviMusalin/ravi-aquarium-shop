import type { CompatibilityWarning } from "../types";

export default function CompatibilityBanner({
  warnings,
}: {
  warnings: CompatibilityWarning[];
}) {
  if (warnings.length === 0) return null;

  return (
    <div className="compat-banner" role="alert">
      <strong>Heads up: some items may not work well together</strong>
      <ul>
        {warnings.map((w) => (
          <li key={`${w.type}-${w.productIds.join("-")}`}>{w.message}</li>
        ))}
      </ul>
      <p className="meta">
        You can still check out. These are suggestions, not blocks.
      </p>
    </div>
  );
}