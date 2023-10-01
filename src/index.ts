import "dotenv/config";
import axios from "axios";
import { dim } from "kolorist";
import * as openai from "./openai";
import * as cheerio from "cheerio";
import { intro, outro, spinner, select, isCancel } from "@clack/prompts";
import { getBlogContent } from "./blogStorage";

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

const fetchAndSummarize = async (blog: BlogConfig) => {
  try {
    intro(" Reader 📖 ");

    const blogLinks = await getBlogList("https://product.hubspot.com/blog");
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
      url: selected as string,
      querySelector: blog.querySelector,
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

const blogs = {
  hubspot: {
    url: "https://product.hubspot.com/blog/imbalanced-traffic-routing",
    querySelector: "#hs_cos_wrapper_post_body",
  },
};

const getBlogList = async (url: string): Promise<string[]> => {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const blogLinks: string[] = [];

  $(
    ".blog-index.blog-section .blog-index__post-list.blog-index__post-list--top-latest.blog-index__post-list--with-featured .blog-index__post-content h2"
  ).each((i, element) => {
    const link = $(element).find("a").attr("href");
    if (link) {
      blogLinks.push(link);
    }
  });

  return blogLinks;
};

fetchAndSummarize(blogs.hubspot);
// getBlogList("https://product.hubspot.com/blog");
