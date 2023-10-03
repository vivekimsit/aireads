import { BlogPort } from "../ports/blogPort";
import { ConfigPort } from "../ports/configPort";
import { ILogger } from "../ports/loggingPort";

export class FetchArticlesUseCase {
  constructor(
    private blogPort: BlogPort,
    private configPort: ConfigPort,
    private loggingPort: ILogger
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
      this.loggingPort.error(
        `Error fetching articles for ${blogName}: ${(error as Error).message}`
      );
      throw error;
    }
  }
}
