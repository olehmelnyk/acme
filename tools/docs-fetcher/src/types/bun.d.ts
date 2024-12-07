declare module "bun" {
  interface BunFile {
    json<T = unknown>(): Promise<T>;
    text(): Promise<string>;
  }

  interface Bun {
    file(path: string): BunFile;
    write(path: string, content: string | Uint8Array): Promise<void>;
  }

  interface ProcessEnv {
    [key: string]: string | undefined;
  }

  declare global {
    const Bun: Bun;
  }
}
