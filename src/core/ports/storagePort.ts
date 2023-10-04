export interface StoragePort {
  save(pathSegments: string[], content: string): Promise<void>;
  retrieve(pathSegments: string[]): Promise<string | null>;
}
