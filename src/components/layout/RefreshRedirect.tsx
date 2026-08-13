"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function RefreshRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Disable browser's automatic scroll restoration on reload
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }

      // Always force scroll to the top of the page on refresh/reload
      window.scrollTo(0, 0);

      // If initial page load was a browser refresh on a sub-route, navigate to homepage
      try {
        const entries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
        const isReload = entries.length > 0 ? entries[0].type === "reload" : false;

        if (isReload && window.location.pathname !== "/") {
          router.replace("/");
          window.scrollTo(0, 0);
        }
      } catch {
        // Fallback
      }
    }
  }, []); // Run ONLY once on initial mount!

  return null;
}
