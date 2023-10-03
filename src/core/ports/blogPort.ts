import { BlogConfig } from "../models/blogConfig";

export interface BlogPort {
  getBlogList(): Promise<BlogConfig[]>; // Returns full config now
  fetchArticles(url: string, articleListSelector: string): Promise<string[]>;
  fetchArticleDetail(config: BlogConfig): Promise<string>;
  fetchArticleSummary(text: string): Promise<string>;
}
