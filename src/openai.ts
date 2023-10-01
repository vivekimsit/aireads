import https from "https";
import type { ClientRequest, IncomingMessage } from "http";
import {
	type TiktokenModel,
	// encoding_for_model,
} from "@dqbd/tiktoken";
import { config } from "./config";

const httpsPost = async (
	hostname: string,
	path: string,
	headers: Record<string, string>,
	json: unknown,
	timeout: number,
	proxy?: string
) =>
	new Promise<{
		request: ClientRequest;
		response: IncomingMessage;
		data: string;
	}>((resolve, reject) => {
		const postContent = JSON.stringify(json);
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
						request,
						response,
						data: Buffer.concat(body).toString(),
					});
				});
			}
		);
		request.on("error", reject);
		request.on("timeout", () => {
			request.destroy();
			reject(
				new Error(
					`Time out error: request took over ${timeout}ms. Try increasing the \`timeout\` config, or checking the OpenAI API status https://status.openai.com`
				)
			);
		});

		request.write(postContent);
		request.end();
	});

const createChatCompletion = async (
	apiKey: string,
	json: any,
	timeout: number,
	proxy?: string
) => {
	const { response, data } = await httpsPost(
		"api.openai.com",
		"/v1/chat/completions",
		{
			Authorization: `Bearer ${apiKey}`,
		},
		json,
		timeout,
		proxy
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

		if (response.statusCode === 500) {
			errorMessage += "\n\nCheck the API status: https://status.openai.com";
		}

		throw new Error(errorMessage);
	}

	return JSON.parse(data);
};

export const generateSummary = async ({
	apiKey,
	// model: TiktokenModel,
	article,
}: // completions: number,
// maxLength: number,
// timeout: number,
// proxy?: string
{
	apiKey: string;
	article: string;
}) => {
	try {
		const completion = await createChatCompletion(
			apiKey,
			{
				model: config.model,
				messages: [
					{
						role: "system",
						content: systemPrompt(),
					},
					{
						role: "user",
						content: article,
					},
				],
				temperature: 0.5,
				frequency_penalty: 0,
				presence_penalty: 0,
				max_tokens: 3000,
				stream: false,
				// n: completions,
			},
			config.timeout
			// timeout,
			// proxy
		);
		return completion;
	} catch (error) {
		const errorAsAny = error as any;
		if (errorAsAny.code === "ENOTFOUND") {
			throw new Error(
				`Error connecting to ${errorAsAny.hostname} (${errorAsAny.syscall}). Are you connected to the internet?`
			);
		}

		throw errorAsAny;
	}
};

function systemPrompt() {
	return [
		"Generate a concise summary of the given article text with the given specifications below:",
		"- What is the underlying problem?",
		"- What are the technologies used?",
		"- What were the learning?",
		"Keep the Summary under 1000 words",
	]
		.filter(Boolean)
		.join("\n");
}
