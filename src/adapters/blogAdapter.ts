import axios, { AxiosError } from "axios";
import * as cheerio from "cheerio";
import fs from "fs/promises";
import { join } from "path";
import { BlogPort } from "../core/ports/blogPort";
import { BlogConfig } from "../core/models/blogConfig";
import { ILogger as LoggingPort } from "../core/ports/loggingPort";
import { ConfigPort } from "../core/ports/configPort";
import { GPTRuntimePort } from "../core/ports/gPTRuntimePort";
import { StoragePort } from "../core/ports/storagePort";

const DEFAULT_MAX_ARTICLES = 5;

export class BlogAdapter implements BlogPort {
  private readonly TIMEOUT = 5000; // 5 seconds

  constructor(
    private loggingPort: LoggingPort,
    private configPort: ConfigPort,
    private gptPort: GPTRuntimePort,
    private storagePort: StoragePort
  ) {}

  async fetchArticles(blogConfig: BlogConfig): Promise<string[]> {
    const { url, articleListSelector, maxArticlesToFetch } = blogConfig;
    let data;
    try {
      const response = await axios.get(url, { timeout: this.TIMEOUT });
      data = response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.code === "ECONNABORTED") {
        throw new FetchTimeoutError("The request took too long!");
      } else {
        throw new FetchError("There was a problem fetching the articles.");
      }
    }

    try {
      const $ = cheerio.load(data);
      const allArticles: string[] = [];

      $(articleListSelector).each((i, element) => {
        const link = $(element).find("a").attr("href");
        if (link) {
          allArticles.push(link);
        }
      });

      const limitedArticles = allArticles.slice(
        0,
        maxArticlesToFetch || DEFAULT_MAX_ARTICLES
      );
      return limitedArticles;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.loggingPort.error(`Error fetching articles: ${error.message}`);
      }
      throw new ParsingError("There was an error processing the fetched data.");
    }
  }

  async fetchArticleSummary(
    company: string,
    article: string,
    text: string
  ): Promise<string> {
    try {
      const summary = await this.gptPort.summarize(text);
      await this.storagePort.save(
        ["summaries", company, `${article}.md`],
        summary
      );
    } catch (error) {
      if (error instanceof Error) {
        this.loggingPort.error(`Error summarizing article: ${error.message}`);
      }
    }
    return "";
  }

  async getBlogList(): Promise<BlogConfig[]> {
    return this.configPort.getAllConfigs();
  }

  async fetchArticleDetail(
    config: BlogConfig,
    articleUrl: string
  ): Promise<string> {
    const name = config.name;
    const url = new URL(articleUrl);
    this.loggingPort.info(`Fetching article ${url}`);
    const pathSegments = url.pathname.split("/").filter(Boolean);
    const lastSegment = pathSegments.pop() ?? "";
    const filePath = join("blogs", name, `${lastSegment}.md`);

    try {
      if (await this.ifBlogExists(filePath)) {
        this.loggingPort.info("Blog found in local cache.");
        const content = await fs.readFile(filePath, "utf8");
        return content;
      } else {
        this.loggingPort.info(
          "Article not found in local, fetching from remote"
        );
        const { data } = await axios.get(url.href);
        const $ = cheerio.load(data);
        const text = $(config.articleDetailSelector).text().trim();

        const title = lastSegment;
        const datetime = new Date().toISOString();
        const fileContent = `# ${title}\n\n## ${datetime}\n\n## ${text}`;
        await this.storagePort.save(
          ["blogs", name, `${title}.md`],
          fileContent
        );
        return text;
      }
    } catch (error) {
      if (error instanceof Error) {
        this.loggingPort.error(
          `Error fetching article detail for ${name}: ${error.message}`
        );
      }
      throw error;
    }
  }

  private async ifBlogExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

export class FetchTimeoutError extends Error {}
export class FetchError extends Error {}
export class ParsingError extends Error {}
