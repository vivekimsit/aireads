import "dotenv/config";
import axios from "axios";
import { dim } from "kolorist";
import * as openai from "./openai";
import * as cheerio from "cheerio";
import { intro, outro, spinner, select, isCancel } from "@clack/prompts";
import { getBlogContent } from "./blogStorage";
import { BlogAdapter } from "./adapters/blogAdapter";
import { GetBlogListUseCase } from "./core/useCases/fetchBlogList";

const blogPort = new BlogAdapter();
const getBlogListUseCase = new GetBlogListUseCase(blogPort);

interface BlogConfig {
  url: string;
  querySelector: string;
}

const openai_key = process.env.OPENAI_API_KEY ?? "";

type GPTResponse = {
  choices: {
    index: number;
    message: {
      content: string;
    };
    finish_reason: string;
  }[];
};

const sanitizeMessage = (message: string) =>
  message
    .trim()
    .replace(/[\n\r]/g, "")
    .replace(/(\w)\.$/, "$1");

const fetchAndSummarize = async () => {
  try {
    intro(" Reader 📖 ");

    const blogList = await getBlogListUseCase.execute();
    // const blogNames = await getBlogList();
    const blogSelection = await select({
      message: `Pick a blog to read: ${dim("(Ctrl+c to exit)")}`,
      options: blogList.map((value) => ({ label: value, value })),
    });
    if (isCancel(blogSelection)) {
      outro("Cancelled");
      return;
    }

    const blogLinks = await getArticleList(blogSelection as string);
    const selected = await select({
      message: `Pick a blog to read: ${dim("(Ctrl+c to exit)")}`,
      options: blogLinks.map((value) => ({ label: value, value })),
    });

    if (isCancel(selected)) {
      outro("Cancelled");
      return;
    }

    const loadingText = spinner();
    loadingText.start("Loading content");

    const text = await getBlogContent({
      name: blogSelection as string,
      url: selected as string,
      // @ts-ignore
      querySelector: blogsConfig[blogSelection].querySelector,
    });

    loadingText.stop("Loading done");

    // Trim the text to 100 words
    const words = text.split(/\s+/);
    // console.log(`Word count: ${words.length}`);
    const trimmedText = words.slice(0, 200).join(" ");
    // console.log(`Summary: ${text}`);

    const gptResponseDelay = spinner();
    gptResponseDelay.start("Fetching summary from GPT...");

    try {
      // Fetch the summary from GPT-3
      const completion: GPTResponse = await openai.generateSummary({
        apiKey: openai_key,
        article: trimmedText,
      });
      const summary = completion.choices
        .filter((choice) => choice.message?.content)
        .map((choice) => sanitizeMessage(choice.message!.content));
      console.log(summary);
    } catch (error: any) {
      outro(`🛑 ${error.message}`);
      process.exit(1);
    }
    gptResponseDelay.stop("Complete");
    outro(`Successfully completed!`);
  } catch (error) {
    console.log(error);
  }
};

const blogsConfig = {
  hubspot: {
    url: "https://product.hubspot.com/blog",
    querySelector: "#hs_cos_wrapper_post_body",
    querySelectorAll:
      ".blog-index.blog-section .blog-index__post-list.blog-index__post-list--top-latest.blog-index__post-list--with-featured .blog-index__post-content h2",
  },
  spotify: {
    url: "https://engineering.atspotify.com",
    querySelector: "main article .default-post-content",
    querySelectorAll: ".posts-list.home-post-list li article h2",
  },
  slack: {
    url: "https://slack.engineering",
    querySelector: "loop-container loop-container--grid",
    querySelectorAll: ".loop-container.loop-container--grid article",
  },
};

const getBlogList = async (): Promise<string[]> => {
  return Object.keys(blogsConfig);
};

const getArticleList = async (blogName: string): Promise<string[]> => {
  // @ts-ignore
  const blog = blogsConfig[blogName];
  const { data } = await axios.get(blog.url);
  const $ = cheerio.load(data);

  const blogLinks: string[] = [];

  $(blog.querySelectorAll).each((i, element) => {
    const link = $(element).find("a").attr("href");
    if (link) {
      blogLinks.push(link);
    }
  });

  return blogLinks;
};

fetchAndSummarize();
