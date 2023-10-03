import { ConfigPort } from "../core/ports/configPort";
import { BlogConfig } from "../core/models/blogConfig";

export class ConfigAdapter implements ConfigPort {
  private blogConfigs: BlogConfig[];

  constructor() {
    this.blogConfigs = [
      {
        name: "HubSpot",
        url: "https://product.hubspot.com/blog",
        articleListSelector:
          ".blog-index.blog-section .blog-index__post-list.blog-index__post-list--top-latest.blog-index__post-list--with-featured .blog-index__post-content h2",
        articleDetailSelector: "#hs_cos_wrapper_post_body",
      },
    ];
  }

  getConfigByName(blogName: string): BlogConfig | undefined {
    return this.blogConfigs.find((config) => config.name === blogName);
  }

  getAllConfigs(): BlogConfig[] {
    return this.blogConfigs;
  }
}
