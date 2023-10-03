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
const kolorist_1 = require("kolorist");
const openai = __importStar(require("./openai"));
const cheerio = __importStar(require("cheerio"));
const prompts_1 = require("@clack/prompts");
const blogStorage_1 = require("./blogStorage");
const blogAdapter_1 = require("./adapters/blogAdapter");
const fetchBlogList_1 = require("./core/useCases/fetchBlogList");
const blogPort = new blogAdapter_1.BlogAdapter();
const getBlogListUseCase = new fetchBlogList_1.GetBlogListUseCase(blogPort);
const openai_key = process.env.OPENAI_API_KEY ?? "";
const sanitizeMessage = (message) => message
    .trim()
    .replace(/[\n\r]/g, "")
    .replace(/(\w)\.$/, "$1");
const fetchAndSummarize = async () => {
    try {
        (0, prompts_1.intro)(" Reader 📖 ");
        const blogList = await getBlogListUseCase.execute();
        // const blogNames = await getBlogList();
        const blogSelection = await (0, prompts_1.select)({
            message: `Pick a blog to read: ${(0, kolorist_1.dim)("(Ctrl+c to exit)")}`,
            options: blogList.map((value) => ({ label: value, value })),
        });
        if ((0, prompts_1.isCancel)(blogSelection)) {
            (0, prompts_1.outro)("Cancelled");
            return;
        }
        const blogLinks = await getArticleList(blogSelection);
        const selected = await (0, prompts_1.select)({
            message: `Pick a blog to read: ${(0, kolorist_1.dim)("(Ctrl+c to exit)")}`,
            options: blogLinks.map((value) => ({ label: value, value })),
        });
        if ((0, prompts_1.isCancel)(selected)) {
            (0, prompts_1.outro)("Cancelled");
            return;
        }
        const loadingText = (0, prompts_1.spinner)();
        loadingText.start("Loading content");
        const text = await (0, blogStorage_1.getBlogContent)({
            name: blogSelection,
            url: selected,
            // @ts-ignore
            querySelector: blogsConfig[blogSelection].querySelector,
        });
        loadingText.stop("Loading done");
        // Trim the text to 100 words
        const words = text.split(/\s+/);
        // console.log(`Word count: ${words.length}`);
        const trimmedText = words.slice(0, 200).join(" ");
        // console.log(`Summary: ${text}`);
        const gptResponseDelay = (0, prompts_1.spinner)();
        gptResponseDelay.start("Fetching summary from GPT...");
        try {
            // Fetch the summary from GPT-3
            const completion = await openai.generateSummary({
                apiKey: openai_key,
                article: trimmedText,
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
        (0, prompts_1.outro)(`Successfully completed!`);
    }
    catch (error) {
        console.log(error);
    }
};
const blogsConfig = {
    hubspot: {
        url: "https://product.hubspot.com/blog",
        querySelector: "#hs_cos_wrapper_post_body",
        querySelectorAll: ".blog-index.blog-section .blog-index__post-list.blog-index__post-list--top-latest.blog-index__post-list--with-featured .blog-index__post-content h2",
    },
    spotify: {
        url: "https://engineering.atspotify.com",
        querySelector: "main article .default-post-content",
        querySelectorAll: ".posts-list.home-post-list li article h2",
    },
    slack: {
        url: "https://slack.engineering",
        querySelector: "loop-container loop-container--grid",
        querySelectorAll: ".loop-container.loop-container--grid article",
    },
};
const getBlogList = async () => {
    return Object.keys(blogsConfig);
};
const getArticleList = async (blogName) => {
    // @ts-ignore
    const blog = blogsConfig[blogName];
    const { data } = await axios_1.default.get(blog.url);
    const $ = cheerio.load(data);
    const blogLinks = [];
    $(blog.querySelectorAll).each((i, element) => {
        const link = $(element).find("a").attr("href");
        if (link) {
            blogLinks.push(link);
        }
    });
    return blogLinks;
};
fetchAndSummarize();
