/// <reference types="vite/client" />

/**
 * Typed environment variables.
 *
 * Without this declaration `import.meta.env` is untyped and every access is a
 * TypeScript error, which is why the build had to run with type checking
 * effectively disabled.
 */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_WS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
