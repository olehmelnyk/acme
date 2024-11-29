/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // Add other env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
