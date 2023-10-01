#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const prompts_1 = require("@clack/prompts");
const openai = __importStar(require("./openai"));
// For calling GPT-3 API
// import { createApi } from "openai";
const openai_key = process.env.OPENAI_API_KEY ?? "";
const sanitizeMessage = (message) => message
    .trim()
    .replace(/[\n\r]/g, "")
    .replace(/(\w)\.$/, "$1");
const fetchAndSummarize = async (url, elementId) => {
    try {
        (0, prompts_1.intro)(" Reader 📖 ");
        const loadingText = (0, prompts_1.spinner)();
        loadingText.start("Loading content");
        const { data } = await axios_1.default.get(url);
        loadingText.stop("Loading done");
        const $ = cheerio.load(data);
        let text = $(`#${elementId}`).text();
        if (!text) {
            (0, prompts_1.outro)("Article not found");
            return;
        }
        // Trim the text to 100 words
        const words = text.split(/\s+/);
        console.log(`Word count: ${words.length}`);
        text = words.slice(0, 200).join(" ");
        console.log(`Summary: ${text}`);
        const gptResponseDelay = (0, prompts_1.spinner)();
        gptResponseDelay.start("Fetching summary from GPT...");
        try {
            // Fetch the summary from GPT-3
            const completion = await openai.generateSummary({
                apiKey: openai_key,
                article: text,
            });
            const summary = completion.choices
                .filter((choice) => choice.message?.content)
                .map((choice) => sanitizeMessage(choice.message.content));
            console.log(summary);
        }
        catch (error) {
            (0, prompts_1.outro)(`🛑 ${error.message}`);
            process.exit(1);
        }
        gptResponseDelay.stop("Complete");
        (0, prompts_1.outro)(`Successfully committed!`);
        // const summary = gptResponse.choices[0]?.text?.trim();
    }
    catch (error) {
        console.log(error);
    }
};
fetchAndSummarize("https://product.hubspot.com/blog/hubspot-upgrades-mysql", "hs_cos_wrapper_post_body");
