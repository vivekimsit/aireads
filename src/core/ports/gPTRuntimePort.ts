// In ports/GPTRuntimePort.ts
export interface GPTRuntimePort {
  summarize(text: string): Promise<string>;
}
