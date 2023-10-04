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
      model: "gpt-4",
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
    const prompt = `
      Please summarize the given article by addressing the following points:

      1. What was the problem being addressed?
      - Describe the core challenge or issue presented in the article.

      2. How was the problem solved, and what technologies were utilized in the solution?
      - Outline the methods or strategies used to address the challenge and specify any technologies or tools that played a key role.

      3. What was the outcome, and what learnings can be drawn from it?
      - Detail the results achieved and the key insights or takeaways.

      4. Extract and list the unique key terms from the article, avoiding repetitions or closely related terms.

      Ensure each point is addressed in a separate paragraph and keep the summary concise, not exceeding 200 words.
  `;
    return prompt;
  }
}
