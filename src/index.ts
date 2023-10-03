import "dotenv/config";
import { dim } from "kolorist";
import * as openai from "./openai";
import { intro, outro, spinner, select, isCancel } from "@clack/prompts";

import { BlogAdapter } from "./adapters/blogAdapter";
import { ConfigAdapter } from "./adapters/configAdapter";
import { LoggingAdapter } from "./adapters/loggingAdapter";

import { GetBlogListUseCase } from "./core/useCases/fetchBlogList";
import { FetchArticlesUseCase } from "./core/useCases/fetchArticlesUseCase";
import { FetchBlogConfigUseCase } from "./core/useCases/fetchBlogConfigUseCase";
import { FetchArticleDetailAndSummarizeUseCase } from "./core/useCases/fetchArticleDetailAndSummarizeUseCase";

const loggingAdapter = new LoggingAdapter();
const configAdapter = new ConfigAdapter();
const blogPort = new BlogAdapter(loggingAdapter, configAdapter);

const getBlogListUseCase = new GetBlogListUseCase(blogPort);
const fetchArticlesUseCase = new FetchArticlesUseCase(
  blogPort,
  configAdapter,
  loggingAdapter
);
const fetchBlogConfigUseCase = new FetchBlogConfigUseCase(configAdapter);
const fetchArticleDetailAndSummarizeUseCase =
  new FetchArticleDetailAndSummarizeUseCase(blogPort, loggingAdapter);

const openai_key = process.env.OPENAI_API_KEY ?? "";

type GPTResponse = {
  choices: {
    index: number;
    message: {
      content: string;
    };
    finish_reason: string;
  }[];
};

const sanitizeMessage = (message: string) =>
  message
    .trim()
    .replace(/[\n\r]/g, "")
    .replace(/(\w)\.$/, "$1");

const fetchAndSummarize = async () => {
  try {
    intro(" Reader 📖 ");

    const blogList = await getBlogListUseCase.execute();
    // const blogNames = await getBlogList();
    const selectedBlogName = await select({
      message: `Pick a blog to read: ${dim("(Ctrl+c to exit)")}`,
      options: blogList.map((value) => ({
        label: value.name,
        value: value.name,
      })),
    });
    if (isCancel(selectedBlogName)) {
      outro("Cancelled");
      return;
    }

    const articles = await fetchArticlesUseCase.execute(
      selectedBlogName as string
    );
    // const blogLinks = await getArticleList(blogSelection as string);
    const selectedArticle = await select({
      message: `Pick a blog to read: ${dim("(Ctrl+c to exit)")}`,
      options: articles.map((value) => ({ label: value, value })),
    });

    if (isCancel(selectedArticle)) {
      outro("Cancelled");
      return;
    }

    const loadingText = spinner();
    loadingText.start("Loading content");

    const blogConfig = await fetchBlogConfigUseCase.execute(
      selectedBlogName as string
    );
    if (blogConfig) {
      const summary = await fetchArticleDetailAndSummarizeUseCase.execute(
        blogConfig,
        selectedArticle as string
      );
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

    const gptResponseDelay = spinner();
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
    } catch (error: any) {
      //   outro(`🛑 ${error.message}`);
      //   process.exit(1);
    }
    gptResponseDelay.stop("Complete");
    outro(`Successfully completed!`);
  } catch (error) {
    console.log(error);
  }
};

fetchAndSummarize();
