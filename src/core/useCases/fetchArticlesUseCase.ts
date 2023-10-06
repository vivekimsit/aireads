import { BlogPort } from "../ports/blogPort";
import { ConfigPort } from "../ports/configPort";
import { ILogger as LoggingPort } from "../ports/loggingPort";
import { FetchTimeoutError, FetchError } from "../../adapters/blogAdapter";
import { BlogConfig } from "../models/blogConfig";

export class FetchArticlesUseCase {
  constructor(
    private blogPort: BlogPort,
    private configPort: ConfigPort,
    private loggingPort: LoggingPort
  ) {}

  async execute(blogConfig: BlogConfig): Promise<string[]> {
    const { name, url, articleListSelector } = blogConfig;
    this.loggingPort.info(`Fetching articles for ${name}`);

    try {
      const articles = await this.blogPort.fetchArticles(blogConfig);
      this.loggingPort.info(`Fetched ${articles.length} articles for ${name}`);
      return articles;
    } catch (error) {
      if (error instanceof FetchTimeoutError) {
        // Handle the timeout, perhaps retrying the request or informing the user.
        this.loggingPort.error(
          `Error fetching articles for ${name}: ${(error as Error).message}`
        );
      } else if (error instanceof FetchError) {
        // Handle other types of fetch errors.
        this.loggingPort.error(
          `Error fetching articles for ${name}: ${(error as Error).message}`
        );
      } else {
        this.loggingPort.error(
          `Error fetching articles for ${name}: ${(error as Error).message}`
        );
      }
      return [];
    }
  }
}
