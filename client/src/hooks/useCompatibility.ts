import { useEffect, useState } from "react";
import { checkCompatibility } from "../api";
import type { CompatibilityResult } from "../types";

export function useCompatibility(productIds: number[]) {
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // A string stays the same between renders, but a new array would look "changed" every time
  const key = productIds.join(",");

  useEffect(() => {
    if (key === "") return;
    let ignore = false;
    const ids = key.split(",").map(Number);

    checkCompatibility(ids)
      .then((data) => {
        if (ignore) return;
        setResult(data);
        setError(null);
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      });

    return () => {
      ignore = true;
    };
  }, [key]);

  // An empty cart has nothing to check
  return { result: key === "" ? null : result, error };
}