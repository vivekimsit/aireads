import "dotenv/config";
import { dim } from "kolorist";
import { intro, outro, spinner, select, isCancel } from "@clack/prompts";

import { BlogAdapter } from "./adapters/blogAdapter";
import { FileStorageAdapter } from "./adapters/fileStorageAdapter";
import { ConfigAdapter } from "./adapters/configAdapter";
import { LoggingAdapter } from "./adapters/loggingAdapter";
import { GPTAdapter } from "./adapters/gPTRuntimeAdapter";

import { GetBlogListUseCase } from "./core/useCases/fetchBlogList";
import { FetchArticlesUseCase } from "./core/useCases/fetchArticlesUseCase";
import { FetchBlogConfigUseCase } from "./core/useCases/fetchBlogConfigUseCase";
import { FetchArticleDetailAndSummarizeUseCase } from "./core/useCases/fetchArticleDetailAndSummarizeUseCase";
import { BlogConfig } from "./core/models/blogConfig";

const loggingAdapter = new LoggingAdapter();
const configAdapter = new ConfigAdapter();
const storageAdapter = new FileStorageAdapter(process.cwd());
const gPTRuntimeAdapter = new GPTAdapter(loggingAdapter);
const blogPort = new BlogAdapter(
  loggingAdapter,
  configAdapter,
  gPTRuntimeAdapter,
  storageAdapter
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

    const selectedBlogName = await selectBlog();
    if (isCancel(selectedBlogName)) {
      outro("Cancelled");
      return;
    }
    if (isCancel(selectedBlogName)) {
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

    const selectedArticle = await fetchAndDisplayArticles(blogConfig);
    if (isCancel(selectedArticle)) {
      outro("Cancelled");
      return;
    }

    await displaySummary(blogConfig, selectedArticle as string);
    outro(`Successfully completed!`);
  } catch (error: any) {
    outro(`🛑 Error: ${error.message}`);
  }
};

run();

async function selectBlog() {
  const blogList = await getBlogListUseCase.execute();
  return select({
    message: `Pick a blog to read: ${dim("(Ctrl+c to exit)")}`,
    options: blogList.map((value) => ({
      label: value.name,
      value: value.name,
    })),
  });
}

async function fetchAndDisplayArticles(blogConfig: BlogConfig) {
  const loadingArticles = spinner();
  loadingArticles.start(`Loading articles for ${blogConfig.name}`);
  const articles = await fetchArticlesUseCase.execute(blogConfig);
  loadingArticles.stop(`Loading complete`);
  return select({
    message: `Pick an article to read: ${dim("(Ctrl+c to exit)")}`,
    options: articles.map((value) => ({ label: value, value })),
  });
}

async function displaySummary(blogConfig: BlogConfig, article: string) {
  const gptResponseDelay = spinner();
  gptResponseDelay.start("Fetching article summary");
  const summary = await fetchArticleDetailAndSummarizeUseCase.execute(
    blogConfig,
    article
  );
  console.log(summary);
  gptResponseDelay.stop("Complete");
}
