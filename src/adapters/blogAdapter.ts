import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs/promises";
import { join } from "path";
import { BlogPort } from "../core/ports/blogPort";
import { BlogConfig } from "../core/models/blogConfig";
import { ILogger as LoggingPort } from "../core/ports/loggingPort";
import { ConfigPort } from "../core/ports/configPort";

export class BlogAdapter implements BlogPort {
  constructor(
    private loggingPort: LoggingPort,
    private configPort: ConfigPort
  ) {}

  async fetchArticles(
    url: string,
    articleListSelector: string
  ): Promise<string[]> {
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      const articles: string[] = [];

      $(articleListSelector).each((i, element) => {
        const link = $(element).find("a").attr("href");
        if (link) {
          articles.push(link);
        }
      });

      return articles;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.loggingPort.error(`Error fetching articles: ${error.message}`);
      }
      throw error;
    }
  }

  fetchArticleSummary(text: string): Promise<string> {
    throw new Error("Method not implemented.");
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
    const pathSegments = url.pathname.split("/").filter(Boolean);
    const lastSegment = pathSegments.pop() ?? "";
    const filePath = join("blogs", name, `${lastSegment}.md`);

    try {
      if (await this.ifBlogExists(filePath)) {
        const content = await fs.readFile(filePath, "utf8");
        return content;
      } else {
        this.loggingPort.info(
          "Article not found in local, fetching from remote"
        );
        const { data } = await axios.get(articleUrl);
        const $ = cheerio.load(data);
        const text = $(config.articleDetailSelector).text().trim();

        const title = lastSegment;
        const datetime = new Date().toISOString();
        await this.saveBlogToFile(name, title, datetime, text);
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

  private async saveBlogToFile(
    name: string,
    title: string,
    datetime: string,
    content: string
  ): Promise<void> {
    const filePath = join("blogs", name, `${title}.md`);
    const fileContent = `# ${title}\n\n## ${datetime}\n\n## ${content}`;
    await fs.writeFile(filePath, fileContent, "utf8");
  }
}
