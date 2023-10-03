import { BlogPort } from "../ports/blogPort";
import { BlogConfig } from "../models/blogConfig";
import { ILogger as LoggingPort } from "../ports/loggingPort";

export class FetchArticleDetailAndSummarizeUseCase {
  constructor(private blogPort: BlogPort, private loggingPort: LoggingPort) {}

  async execute(blogConfig: BlogConfig, articleUrl: string): Promise<string> {
    try {
      const articleDetail = await this.blogPort.fetchArticleDetail(
        blogConfig,
        articleUrl
      );
      const summary = await this.blogPort.fetchArticleSummary(articleDetail);
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
}
