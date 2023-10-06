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
      {
        name: "Spotify",
        url: "https://engineering.atspotify.com",
        articleListSelector: ".posts-list.home-post-list li article h2",
        articleDetailSelector: "main article .default-post-content",
      },
      {
        name: "Slack",
        url: "https://slack.engineering",
        articleDetailSelector: "main article .entry__content.s-wysiwyg",
        articleListSelector: ".loop-container.loop-container--grid article",
      },
      {
        name: "Fly",
        url: "https://fly.io/blog/",
        articleDetailSelector: "main article section",
        articleListSelector: "main article",
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
