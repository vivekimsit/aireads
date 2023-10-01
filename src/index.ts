import "dotenv/config";
import axios from "axios";
import * as cheerio from "cheerio";
import { intro, outro, spinner } from "@clack/prompts";
import * as openai from "./openai";

// For calling GPT-3 API
// import { createApi } from "openai";

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

const fetchAndSummarize = async (url: string, elementId: string) => {
	try {
		intro(" Reader 📖 ");

		const loadingText = spinner();

		loadingText.start("Loading content");
		const { data } = await axios.get(url);
		loadingText.stop("Loading done");

		const $ = cheerio.load(data);
		let text = $(`#${elementId}`).text();

		if (!text) {
			outro("Article not found");
			return;
		}

		// Trim the text to 100 words
		const words = text.split(/\s+/);
		console.log(`Word count: ${words.length}`);
		text = words.slice(0, 200).join(" ");
		console.log(`Summary: ${text}`);

		const gptResponseDelay = spinner();
		gptResponseDelay.start("Fetching summary from GPT...");

		try {
			// Fetch the summary from GPT-3
			const completion: GPTResponse = await openai.generateSummary({
				apiKey: openai_key,
				article: text,
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
		outro(`Successfully committed!`);
		// const summary = gptResponse.choices[0]?.text?.trim();
	} catch (error) {
		console.log(error);
	}
};

fetchAndSummarize(
	"https://product.hubspot.com/blog/hubspot-upgrades-mysql",
	"hs_cos_wrapper_post_body"
);
