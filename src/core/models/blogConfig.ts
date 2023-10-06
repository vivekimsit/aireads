export type BlogConfig = {
  name: string;
  url: string;
  articleListSelector: string;
  articleDetailSelector: string;
  maxArticlesToFetch?: number; // Optional, if not provided, can default to a system-wide value.
};
