#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const kolorist_1 = require("kolorist");
const prompts_1 = require("@clack/prompts");
const blogAdapter_1 = require("./adapters/blogAdapter");
const fileStorageAdapter_1 = require("./adapters/fileStorageAdapter");
const configAdapter_1 = require("./adapters/configAdapter");
const loggingAdapter_1 = require("./adapters/loggingAdapter");
const gPTRuntimeAdapter_1 = require("./adapters/gPTRuntimeAdapter");
const fetchBlogList_1 = require("./core/useCases/fetchBlogList");
const fetchArticlesUseCase_1 = require("./core/useCases/fetchArticlesUseCase");
const fetchBlogConfigUseCase_1 = require("./core/useCases/fetchBlogConfigUseCase");
const fetchArticleDetailAndSummarizeUseCase_1 = require("./core/useCases/fetchArticleDetailAndSummarizeUseCase");
const loggingAdapter = new loggingAdapter_1.LoggingAdapter();
const configAdapter = new configAdapter_1.ConfigAdapter();
const storageAdapter = new fileStorageAdapter_1.FileStorageAdapter(process.cwd());
const gPTRuntimeAdapter = new gPTRuntimeAdapter_1.GPTAdapter(loggingAdapter);
const blogPort = new blogAdapter_1.BlogAdapter(loggingAdapter, configAdapter, gPTRuntimeAdapter, storageAdapter);
const getBlogListUseCase = new fetchBlogList_1.GetBlogListUseCase(blogPort);
const fetchArticlesUseCase = new fetchArticlesUseCase_1.FetchArticlesUseCase(blogPort, configAdapter, loggingAdapter);
const fetchBlogConfigUseCase = new fetchBlogConfigUseCase_1.FetchBlogConfigUseCase(configAdapter);
const fetchArticleDetailAndSummarizeUseCase = new fetchArticleDetailAndSummarizeUseCase_1.FetchArticleDetailAndSummarizeUseCase(blogPort, loggingAdapter);
const run = async () => {
    try {
        (0, prompts_1.intro)(" Reader 📖 ");
        const blogList = await getBlogListUseCase.execute();
        const selectedBlogName = await (0, prompts_1.select)({
            message: `Pick a blog to read: ${(0, kolorist_1.dim)("(Ctrl+c to exit)")}`,
            options: blogList.map((value) => ({
                label: value.name,
                value: value.name,
            })),
        });
        if ((0, prompts_1.isCancel)(selectedBlogName)) {
            (0, prompts_1.outro)("Cancelled");
            return;
        }
        const blogConfig = await fetchBlogConfigUseCase.execute(selectedBlogName);
        if (!blogConfig) {
            (0, prompts_1.outro)(`🛑 couldn't find blog config.`);
            process.exit(1);
        }
        const loadingArticles = (0, prompts_1.spinner)();
        loadingArticles.start(`Loading articles for ${selectedBlogName}`);
        const articles = await fetchArticlesUseCase.execute(blogConfig);
        loadingArticles.stop(`Loading complete`);
        const selectedArticle = await (0, prompts_1.select)({
            message: `Pick a blog to read: ${(0, kolorist_1.dim)("(Ctrl+c to exit)")}`,
            options: articles.map((value) => ({ label: value, value })),
        });
        if ((0, prompts_1.isCancel)(selectedArticle)) {
            (0, prompts_1.outro)("Cancelled");
            return;
        }
        try {
            const gptResponseDelay = (0, prompts_1.spinner)();
            gptResponseDelay.start("Fetching article summary");
            const summary = await fetchArticleDetailAndSummarizeUseCase.execute(blogConfig, selectedArticle);
            console.log(summary);
            gptResponseDelay.stop("Complete");
        }
        catch (error) {
            (0, prompts_1.outro)(`🛑 ${error.message}`);
            process.exit(1);
        }
        (0, prompts_1.outro)(`Successfully completed!`);
    }
    catch (error) {
        console.log(error);
    }
};
run();
