import { BlogPort } from "../core/ports/blogPort";
import { BlogConfig } from "../core/models/blogConfig";

const blogConfigs: BlogConfig[] = [
  {
    name: "HubSpot",
    url: "https://hubspot.com/blog",
    articleListSelector:
      ".blog-index.blog-section .blog-index__post-list.blog-index__post-list--top-latest.blog-index__post-list--with-featured .blog-index__post-content h2",
    articleDetailSelector: "#hs_cos_wrapper_post_body",
  },
  // add more here
];

export class BlogAdapter implements BlogPort {
  fetchArticles(blogName: string): Promise<string[]> {
    throw new Error("Method not implemented.");
  }
  fetchArticleDetail(blogName: string, articleName: string): Promise<string> {
    throw new Error("Method not implemented.");
  }
  fetchArticleSummary(text: string): Promise<string> {
    throw new Error("Method not implemented.");
  }
  async getBlogList(): Promise<string[]> {
    return blogConfigs.map((blog) => blog.name);
  }
}
