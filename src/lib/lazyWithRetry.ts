import { lazy, type ComponentType } from "react";

/**
 * Like React.lazy, but resilient to stale chunk hashes after a new deploy.
 *
 * When the app is open and a new version is deployed, the old lazily-loaded
 * chunks are replaced by files with new content hashes. Navigating to a lazy
 * route then fails with "Failed to fetch dynamically imported module" because
 * the chunk the current page references no longer exists on the server.
 *
 * On the first such failure we force a one-time full reload, which pulls the
 * fresh index.html referencing the current chunk hashes. A sessionStorage flag
 * prevents an infinite reload loop if the failure is caused by something else
 * (e.g. a genuinely missing file or offline network).
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    const flagKey = "chunk-reload-attempted";
    try {
      const module = await factory();
      // Success: clear the flag so future failures can trigger a reload again.
      window.sessionStorage.removeItem(flagKey);
      return module;
    } catch (error) {
      const alreadyReloaded = window.sessionStorage.getItem(flagKey) === "true";
      if (!alreadyReloaded) {
        window.sessionStorage.setItem(flagKey, "true");
        // Full reload to fetch the current index.html + chunk hashes.
        window.location.reload();
        // Return a never-resolving promise so Suspense keeps showing the
        // fallback until the reload takes over.
        return new Promise<{ default: T }>(() => {});
      }
      // Already retried once — rethrow so the error boundary / console shows it
      // instead of reloading forever.
      throw error;
    }
  });
}
