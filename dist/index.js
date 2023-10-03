#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const kolorist_1 = require("kolorist");
const prompts_1 = require("@clack/prompts");
const blogAdapter_1 = require("./adapters/blogAdapter");
const configAdapter_1 = require("./adapters/configAdapter");
const loggingAdapter_1 = require("./adapters/loggingAdapter");
const fetchBlogList_1 = require("./core/useCases/fetchBlogList");
const fetchArticlesUseCase_1 = require("./core/useCases/fetchArticlesUseCase");
const fetchBlogConfigUseCase_1 = require("./core/useCases/fetchBlogConfigUseCase");
const fetchArticleDetailAndSummarizeUseCase_1 = require("./core/useCases/fetchArticleDetailAndSummarizeUseCase");
const loggingAdapter = new loggingAdapter_1.LoggingAdapter();
const configAdapter = new configAdapter_1.ConfigAdapter();
const blogPort = new blogAdapter_1.BlogAdapter(loggingAdapter, configAdapter);
const getBlogListUseCase = new fetchBlogList_1.GetBlogListUseCase(blogPort);
const fetchArticlesUseCase = new fetchArticlesUseCase_1.FetchArticlesUseCase(blogPort, configAdapter, loggingAdapter);
const fetchBlogConfigUseCase = new fetchBlogConfigUseCase_1.FetchBlogConfigUseCase(configAdapter);
const fetchArticleDetailAndSummarizeUseCase = new fetchArticleDetailAndSummarizeUseCase_1.FetchArticleDetailAndSummarizeUseCase(blogPort, loggingAdapter);
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
        const articles = await fetchArticlesUseCase.execute(selectedBlogName);
        // const blogLinks = await getArticleList(blogSelection as string);
        const selectedArticle = await (0, prompts_1.select)({
            message: `Pick a blog to read: ${(0, kolorist_1.dim)("(Ctrl+c to exit)")}`,
            options: articles.map((value) => ({ label: value, value })),
        });
        if ((0, prompts_1.isCancel)(selectedArticle)) {
            (0, prompts_1.outro)("Cancelled");
            return;
        }
        const loadingText = (0, prompts_1.spinner)();
        loadingText.start("Loading content");
        const blogConfig = await fetchBlogConfigUseCase.execute(selectedBlogName);
        if (blogConfig) {
            const summary = await fetchArticleDetailAndSummarizeUseCase.execute(blogConfig, selectedArticle);
        }
        // const text = await getBlogContent({
        //   name: selectedBlogName as string,
        //   url: selected as string,
        //   // @ts-ignore
        //   querySelector: blogsConfig[blogSelection].querySelector,
        // });
        loadingText.stop("Loading done");
        // Trim the text to 100 words
        // const words = text.split(/\s+/);
        // console.log(`Word count: ${words.length}`);
        // const trimmedText = words.slice(0, 200).join(" ");
        // console.log(`Summary: ${text}`);
        const gptResponseDelay = (0, prompts_1.spinner)();
        gptResponseDelay.start("Fetching summary from GPT...");
        try {
            // Fetch the summary from GPT-3
            //   const completion: GPTResponse = await openai.generateSummary({
            //     apiKey: openai_key,
            //     article: trimmedText,
            //   });
            //   const summary = completion.choices
            //     .filter((choice) => choice.message?.content)
            //     .map((choice) => sanitizeMessage(choice.message!.content));
            //   console.log(summary);
        }
        catch (error) {
            //   outro(`🛑 ${error.message}`);
            //   process.exit(1);
        }
        gptResponseDelay.stop("Complete");
        (0, prompts_1.outro)(`Successfully completed!`);
    }
    catch (error) {
        console.log(error);
    }
};
// const blogsConfig = {
//   hubspot: {
//     url: "https://product.hubspot.com/blog",
//     querySelector: "#hs_cos_wrapper_post_body",
//     querySelectorAll:
//       ".blog-index.blog-section .blog-index__post-list.blog-index__post-list--top-latest.blog-index__post-list--with-featured .blog-index__post-content h2",
//   },
//   spotify: {
//     url: "https://engineering.atspotify.com",
//     querySelector: "main article .default-post-content",
//     querySelectorAll: ".posts-list.home-post-list li article h2",
//   },
//   slack: {
//     url: "https://slack.engineering",
//     querySelector: "loop-container loop-container--grid",
//     querySelectorAll: ".loop-container.loop-container--grid article",
//   },
// };
fetchAndSummarize();
