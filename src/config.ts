import fs from "fs/promises";
import path from "path";
import os from "os";
import type { TiktokenModel } from "@dqbd/tiktoken";

export const config = {
	model: "gpt-3.5-turbo",
	timeout: 10_0000,
	hubspot: {
		url: "https://product.hubspot.com/blog",
		selector: "hs_cos_wrapper_post_body",
	},
};
