import { BlogPort } from "../ports/blogPort";
import { ConfigPort } from "../ports/configPort";
import { ILogger as LoggingPort } from "../ports/loggingPort";
import { FetchTimeoutError, FetchError } from "../../adapters/blogAdapter";

export class FetchArticlesUseCase {
  constructor(
    private blogPort: BlogPort,
    private configPort: ConfigPort,
    private loggingPort: LoggingPort
  ) {}

  async execute(blogName: string): Promise<string[]> {
    this.loggingPort.info(`Fetching articles for ${blogName}`);

    const config = this.configPort.getConfigByName(blogName);
    if (!config) {
      this.loggingPort.error(`Config not found for ${blogName}`);
      throw new Error(`Config not found for ${blogName}`);
    }

    try {
      const articles = await this.blogPort.fetchArticles(
        config.url,
        config.articleListSelector
      );
      this.loggingPort.info(
        `Fetched ${articles.length} articles for ${blogName}`
      );
      return articles;
    } catch (error) {
      if (error instanceof FetchTimeoutError) {
        // Handle the timeout, perhaps retrying the request or informing the user.
        this.loggingPort.error(
          `Error fetching articles for ${blogName}: ${(error as Error).message}`
        );
      } else if (error instanceof FetchError) {
        // Handle other types of fetch errors.
        this.loggingPort.error(
          `Error fetching articles for ${blogName}: ${(error as Error).message}`
        );
      } else {
        this.loggingPort.error(
          `Error fetching articles for ${blogName}: ${(error as Error).message}`
        );
      }
      return [];
    }
  }
}
