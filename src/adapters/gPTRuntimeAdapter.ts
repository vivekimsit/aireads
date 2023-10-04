import { ILogger as LoggingPort } from "../core/ports/loggingPort";
import { GPTRuntimePort } from "../core/ports/gPTRuntimePort";
import https from "https";
import type { ClientRequest, IncomingMessage } from "http";

const openai_key = process.env.OPENAI_API_KEY ?? "";

export class GPTAdapter implements GPTRuntimePort {
  constructor(private loggingPort: LoggingPort) {}

  async summarize(article: string): Promise<string> {
    try {
      const completion = await this.generateSummary({
        apiKey: openai_key,
        article,
      });
      if (completion.choices && completion.choices.length > 0) {
        return completion.choices[0].message.content.trim();
      }
      return "Summary not generated";
    } catch (error: any) {
      this.loggingPort.error(`Error generating summary: ${error.message}`);
      throw error;
    }
  }

  private async httpsPost(
    hostname: string,
    path: string,
    headers: Record<string, string>,
    json: unknown,
    timeout: number
  ): Promise<{ response: IncomingMessage; data: string }> {
    const postContent = JSON.stringify(json);
    return new Promise((resolve, reject) => {
      const request = https.request(
        {
          port: 443,
          hostname,
          path,
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postContent),
          },
          timeout,
        },
        (response) => {
          const body: Buffer[] = [];
          response.on("data", (chunk) => body.push(chunk));
          response.on("end", () => {
            resolve({
              response,
              data: Buffer.concat(body).toString(),
            });
          });
        }
      );
      request.on("error", reject);
      request.write(postContent);
      request.end();
    });
  }

  private async createChatCompletion(
    apiKey: string,
    json: any,
    timeout: number
  ): Promise<any> {
    const { response, data } = await this.httpsPost(
      "api.openai.com",
      "/v1/chat/completions",
      {
        Authorization: `Bearer ${apiKey}`,
      },
      json,
      timeout
    );

    if (
      !response.statusCode ||
      response.statusCode < 200 ||
      response.statusCode > 299
    ) {
      let errorMessage = `OpenAI API Error: ${response.statusCode} - ${response.statusMessage}`;
      if (data) {
        errorMessage += `\n\n${data}`;
      }
      throw new Error(errorMessage);
    }

    return JSON.parse(data);
  }

  private async generateSummary({
    apiKey,
    article,
  }: {
    apiKey: string;
    article: string;
  }): Promise<any> {
    const config = {
      model: "gpt-3.5-turbo",
      timeout: 30000,
    };
    return this.createChatCompletion(
      apiKey,
      {
        model: config.model,
        messages: [
          {
            role: "system",
            content: this.systemPrompt(),
          },
          {
            role: "user",
            content: article,
          },
        ],
      },
      config.timeout
    );
  }

  private systemPrompt(): string {
    return [
      "Generate a concise summary of the given article text with the given specifications below:",
      "- What is the underlying problem?",
      "- What are the technologies used?",
      "- What were the learnings?",
      "Keep the Summary under 1000 words",
    ].join("\n");
  }
}
