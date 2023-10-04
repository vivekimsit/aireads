import "dotenv/config";
import { dim } from "kolorist";
import { intro, outro, spinner, select, isCancel } from "@clack/prompts";

import { BlogAdapter } from "./adapters/blogAdapter";
import { ConfigAdapter } from "./adapters/configAdapter";
import { LoggingAdapter } from "./adapters/loggingAdapter";
import { GPTAdapter } from "./adapters/gPTRuntimeAdapter";

import { GetBlogListUseCase } from "./core/useCases/fetchBlogList";
import { FetchArticlesUseCase } from "./core/useCases/fetchArticlesUseCase";
import { FetchBlogConfigUseCase } from "./core/useCases/fetchBlogConfigUseCase";
import { FetchArticleDetailAndSummarizeUseCase } from "./core/useCases/fetchArticleDetailAndSummarizeUseCase";

const loggingAdapter = new LoggingAdapter();
const configAdapter = new ConfigAdapter();
const gPTRuntimeAdapter = new GPTAdapter(loggingAdapter);
const blogPort = new BlogAdapter(
  loggingAdapter,
  configAdapter,
  gPTRuntimeAdapter
);

const getBlogListUseCase = new GetBlogListUseCase(blogPort);
const fetchArticlesUseCase = new FetchArticlesUseCase(
  blogPort,
  configAdapter,
  loggingAdapter
);
const fetchBlogConfigUseCase = new FetchBlogConfigUseCase(configAdapter);
const fetchArticleDetailAndSummarizeUseCase =
  new FetchArticleDetailAndSummarizeUseCase(blogPort, loggingAdapter);

const run = async () => {
  try {
    intro(" Reader 📖 ");

    const blogList = await getBlogListUseCase.execute();
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

    const loadingArticles = spinner();
    loadingArticles.start(`Loading articles for ${selectedBlogName}`);
    const articles = await fetchArticlesUseCase.execute(
      selectedBlogName as string
    );
    loadingArticles.stop(`Loading complete`);
    const selectedArticle = await select({
      message: `Pick a blog to read: ${dim("(Ctrl+c to exit)")}`,
      options: articles.map((value) => ({ label: value, value })),
    });

    if (isCancel(selectedArticle)) {
      outro("Cancelled");
      return;
    }

    const blogConfig = await fetchBlogConfigUseCase.execute(
      selectedBlogName as string
    );
    if (!blogConfig) {
      outro(`🛑 couldn't find blog config.`);
      process.exit(1);
    }

    try {
      const gptResponseDelay = spinner();
      gptResponseDelay.start("Fetching article summary");
      const summary = await fetchArticleDetailAndSummarizeUseCase.execute(
        blogConfig,
        selectedArticle as string
      );
      console.log(summary);
      gptResponseDelay.stop("Complete");
    } catch (error: any) {
      outro(`🛑 ${error.message}`);
      process.exit(1);
    }
    outro(`Successfully completed!`);
  } catch (error) {
    console.log(error);
  }
};

run();
