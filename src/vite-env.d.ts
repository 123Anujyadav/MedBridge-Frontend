/// <reference types="vite/client" />

/**
 * Typed environment variables.
 *
 * Without this declaration `import.meta.env` is untyped and every access is a
 * TypeScript error, which is why the build had to run with type checking
 * effectively disabled.
 */
interface ImportMetaEnv {
  /**
   * Backend base URL, with or without the `/api/v1` suffix — the app appends it.
   * Example: `https://medbridge-backend-production-730e.up.railway.app`
   */
  readonly VITE_API_URL?: string;

  /** Legacy name for the same value; still read so older setups keep working. */
  readonly VITE_API_BASE_URL?: string;

  /** Optional explicit WebSocket base. Derived from the API URL when unset. */
  readonly VITE_WS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
