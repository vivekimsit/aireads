// src/adapters/FileStorageAdapter.ts

import { promises as fs } from "fs";
import * as path from "path";
import { StoragePort } from "../core/ports/storagePort";

export class FileStorageAdapter implements StoragePort {
  private readonly baseDir: string;

  constructor(baseDirectory: string = ".") {
    this.baseDir = baseDirectory;
  }

  async save(pathSegments: string[], content: string): Promise<void> {
    const filePath = path.join(this.baseDir, ...pathSegments);

    // Ensure the directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Write the content
    await fs.writeFile(filePath, content, "utf8");
  }

  async retrieve(pathSegments: string[]): Promise<string | null> {
    const filePath = path.join(this.baseDir, ...pathSegments);

    try {
      const content = await fs.readFile(filePath, "utf8");
      return content;
    } catch (error) {
      const typedError = error as { code?: string };
      if (typedError.code === "ENOENT") {
        // File not found
        return null;
      }
      throw error;
    }
  }
}
