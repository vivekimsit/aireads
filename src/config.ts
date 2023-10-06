// config.ts
import { BlogAdapter } from "./adapters/blogAdapter";
import { FileStorageAdapter } from "./adapters/fileStorageAdapter";
import { ConfigAdapter } from "./adapters/configAdapter";
import { LoggingAdapter } from "./adapters/loggingAdapter";
import { GPTAdapter } from "./adapters/gPTRuntimeAdapter";

export const loggingAdapter = new LoggingAdapter();
export const configAdapter = new ConfigAdapter();
export const storageAdapter = new FileStorageAdapter(process.cwd());
export const gPTRuntimeAdapter = new GPTAdapter(loggingAdapter);
export const blogPort = new BlogAdapter(
  loggingAdapter,
  configAdapter,
  gPTRuntimeAdapter,
  storageAdapter
);
