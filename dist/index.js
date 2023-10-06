#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const kolorist_1 = require("kolorist");
const prompts_1 = require("@clack/prompts");
const config_1 = require("./config");
const fetchBlogList_1 = require("./core/useCases/fetchBlogList");
const fetchArticlesUseCase_1 = require("./core/useCases/fetchArticlesUseCase");
const fetchBlogConfigUseCase_1 = require("./core/useCases/fetchBlogConfigUseCase");
const fetchArticleDetailAndSummarizeUseCase_1 = require("./core/useCases/fetchArticleDetailAndSummarizeUseCase");
const getBlogListUseCase = new fetchBlogList_1.GetBlogListUseCase(config_1.blogPort);
const fetchArticlesUseCase = new fetchArticlesUseCase_1.FetchArticlesUseCase(config_1.blogPort, config_1.configAdapter, config_1.loggingAdapter);
const fetchBlogConfigUseCase = new fetchBlogConfigUseCase_1.FetchBlogConfigUseCase(config_1.configAdapter);
const fetchArticleDetailAndSummarizeUseCase = new fetchArticleDetailAndSummarizeUseCase_1.FetchArticleDetailAndSummarizeUseCase(config_1.blogPort, config_1.loggingAdapter);
const run = async () => {
    try {
        (0, prompts_1.intro)(" Reader 📖 ");
        const selectedBlogName = await selectBlog();
        if ((0, prompts_1.isCancel)(selectedBlogName)) {
            (0, prompts_1.outro)("Cancelled");
            return;
        }
        if ((0, prompts_1.isCancel)(selectedBlogName)) {
            (0, prompts_1.outro)("Cancelled");
            return;
        }
        const blogConfig = await fetchBlogConfigUseCase.execute(selectedBlogName);
        if (!blogConfig) {
            (0, prompts_1.outro)(`🛑 couldn't find blog config.`);
            process.exit(1);
        }
        const selectedArticle = await fetchAndDisplayArticles(blogConfig);
        if ((0, prompts_1.isCancel)(selectedArticle)) {
            (0, prompts_1.outro)("Cancelled");
            return;
        }
        await displaySummary(blogConfig, selectedArticle);
        (0, prompts_1.outro)(`Successfully completed!`);
    }
    catch (error) {
        (0, prompts_1.outro)(`🛑 Error: ${error.message}`);
    }
};
run();
async function selectBlog() {
    const blogList = await getBlogListUseCase.execute();
    return (0, prompts_1.select)({
        message: `Pick a blog to read: ${(0, kolorist_1.dim)("(Ctrl+c to exit)")}`,
        options: blogList.map((value) => ({
            label: value.name,
            value: value.name,
        })),
    });
}
async function fetchAndDisplayArticles(blogConfig) {
    const loadingArticles = (0, prompts_1.spinner)();
    loadingArticles.start(`Loading articles for ${blogConfig.name}`);
    const articles = await fetchArticlesUseCase.execute(blogConfig);
    loadingArticles.stop(`Loading complete`);
    return (0, prompts_1.select)({
        message: `Pick an article to read: ${(0, kolorist_1.dim)("(Ctrl+c to exit)")}`,
        options: articles.map((value) => ({ label: value, value })),
    });
}
async function displaySummary(blogConfig, article) {
    const gptResponseDelay = (0, prompts_1.spinner)();
    gptResponseDelay.start("Fetching article summary");
    const summary = await fetchArticleDetailAndSummarizeUseCase.execute(blogConfig, article);
    console.log(summary);
    gptResponseDelay.stop("Complete");
}
