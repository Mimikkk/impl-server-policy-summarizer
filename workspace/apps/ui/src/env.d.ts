/// <reference types="@rsbuild/core/types" />

interface ImportMetaEnv {
  readonly CLIENT_SERVER_URL: string;
  readonly CLIENT_ELI_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
