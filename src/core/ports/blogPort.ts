export interface BlogPort {
  getBlogList(): Promise<string[]>;
  fetchArticles(blogName: string): Promise<string[]>;
  fetchArticleDetail(blogName: string, articleName: string): Promise<string>;
  fetchArticleSummary(text: string): Promise<string>;
}
