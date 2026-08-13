/**
 * src/lib/stock-database.ts
 *
 * LEGACY SHIM — kept only for backward-compat imports.
 *
 * All real stock logic has moved to:
 *   src/lib/stock-service.ts  (server-side DB operations)
 *   src/app/api/internal/stock  (public lookup API)
 *
 * Mock data, localStorage, and file-system I/O have been removed.
 * Do NOT add new code here; use stock-service.ts directly.
 */

// Re-export the canonical types from the real service
export type { StockItem } from "./stock-service";
export { normalizeDesignNumber } from "./stock-service";
