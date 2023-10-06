import { BlogConfig } from "../models/blogConfig";

export interface BlogPort {
  getBlogList(): Promise<BlogConfig[]>; // Returns full config now
  fetchArticles(config: BlogConfig): Promise<string[]>;
  fetchArticleDetail(config: BlogConfig, url: string): Promise<string>;
  fetchArticleSummary(
    company: string,
    article: string,
    text: string
  ): Promise<string>;
}
