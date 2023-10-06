import { BlogPort } from "../ports/blogPort";
import { BlogConfig } from "../models/blogConfig";
import { ILogger as LoggingPort } from "../ports/loggingPort";

export class FetchArticleDetailAndSummarizeUseCase {
  constructor(private blogPort: BlogPort, private loggingPort: LoggingPort) {}

  async execute(blogConfig: BlogConfig, articleUrl: string): Promise<string> {
    try {
      const absoluteUrl = this.toAbsoluteURL(blogConfig.url, articleUrl);
      const articleDetail = await this.blogPort.fetchArticleDetail(
        blogConfig,
        absoluteUrl
      );

      const url = new URL(absoluteUrl);
      const pathSegments = url.pathname.split("/").filter(Boolean);
      const lastSegment = pathSegments.pop() ?? "";
      const summary = await this.blogPort.fetchArticleSummary(
        blogConfig.name,
        lastSegment,
        articleDetail
      );
      return summary;
    } catch (error) {
      if (error instanceof Error) {
        this.loggingPort.error(
          `Error fetching and summarizing article: ${error.message}`
        );
      }
      throw error;
    }
  }

  private toAbsoluteURL(
    baseURL: string,
    relativeOrAbsoluteURL: string
  ): string {
    // If the URL is already absolute, return it.
    if (
      relativeOrAbsoluteURL.startsWith("http://") ||
      relativeOrAbsoluteURL.startsWith("https://")
    ) {
      return relativeOrAbsoluteURL;
    }

    // Otherwise, combine the base and relative URLs.
    const url = new URL(relativeOrAbsoluteURL, baseURL);
    return url.href;
  }
}
