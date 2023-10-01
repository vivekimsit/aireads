import "dotenv/config";
import axios from "axios";
import { URL } from "url";
import * as cheerio from "cheerio";
import { intro, outro, spinner } from "@clack/prompts";
import { saveBlogToFile, getBlogContent } from "./blogStorage";
import * as openai from "./openai";

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

		const loadingText = spinner();

		loadingText.start("Loading content");
		const text = await getBlogContent(blog);
		loadingText.stop("Loading done");

		// const $ = cheerio.load(data);
		// let text = $(blog.querySelector).text().trim();

		// if (!text) {
		// 	outro("Article not found");
		// 	return;
		// }

		// const url = new URL(blog.url);
		// const pathSegments = url.pathname.split("/");
		// const lastSegment = pathSegments[pathSegments.length - 1];
		// const title = lastSegment;
		// const datetime = new Date().toISOString();
		// const content = text;

		// await saveBlogToFile(title, datetime, content);

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
		// const summary = gptResponse.choices[0]?.text?.trim();
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

fetchAndSummarize(blogs.hubspot);
