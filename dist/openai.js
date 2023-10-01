"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSummary = void 0;
const https_1 = __importDefault(require("https"));
const config_1 = require("./config");
const httpsPost = async (hostname, path, headers, json, timeout, proxy) => new Promise((resolve, reject) => {
    const postContent = JSON.stringify(json);
    const request = https_1.default.request({
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
    }, (response) => {
        const body = [];
        response.on("data", (chunk) => body.push(chunk));
        response.on("end", () => {
            resolve({
                request,
                response,
                data: Buffer.concat(body).toString(),
            });
        });
    });
    request.on("error", reject);
    request.on("timeout", () => {
        request.destroy();
        reject(new Error(`Time out error: request took over ${timeout}ms. Try increasing the \`timeout\` config, or checking the OpenAI API status https://status.openai.com`));
    });
    request.write(postContent);
    request.end();
});
const createChatCompletion = async (apiKey, json, timeout, proxy) => {
    const { response, data } = await httpsPost("api.openai.com", "/v1/chat/completions", {
        Authorization: `Bearer ${apiKey}`,
    }, json, timeout, proxy);
    if (!response.statusCode ||
        response.statusCode < 200 ||
        response.statusCode > 299) {
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
const generateSummary = async ({ apiKey, 
// model: TiktokenModel,
article, }) => {
    try {
        const completion = await createChatCompletion(apiKey, {
            model: config_1.config.model,
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
        }, config_1.config.timeout
        // timeout,
        // proxy
        );
        return completion;
    }
    catch (error) {
        const errorAsAny = error;
        if (errorAsAny.code === "ENOTFOUND") {
            throw new Error(`Error connecting to ${errorAsAny.hostname} (${errorAsAny.syscall}). Are you connected to the internet?`);
        }
        throw errorAsAny;
    }
};
exports.generateSummary = generateSummary;
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
