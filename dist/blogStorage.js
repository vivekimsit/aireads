"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlogContent = exports.readBlogFromFile = exports.saveBlogToFile = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const axios_1 = __importDefault(require("axios"));
const url_1 = require("url");
const cheerio = __importStar(require("cheerio"));
const blogsDir = (0, path_1.join)(process.cwd(), "blogs");
// Initialize blog directory
fs_1.promises.mkdir(blogsDir).catch((err) => {
    if (err.code !== "EEXIST")
        throw err;
});
const saveBlogToFile = async (name, title, datetime, content) => {
    fs_1.promises.mkdir((0, path_1.join)(blogsDir, name)).catch((err) => {
        if (err.code !== "EEXIST")
            throw err;
    });
    const filePath = (0, path_1.join)(blogsDir, name, `${title}.md`);
    const fileContent = `# ${title}\n\n## ${datetime}\n\n## ${content}\n`;
    await fs_1.promises.writeFile(filePath, fileContent);
};
exports.saveBlogToFile = saveBlogToFile;
const readBlogFromFile = async (title) => {
    const filePath = (0, path_1.join)(blogsDir, `${title}.md`);
    return fs_1.promises.readFile(filePath, "utf8");
};
exports.readBlogFromFile = readBlogFromFile;
const ifBlogExists = async (filePath) => {
    try {
        await fs_1.promises.access(filePath);
        return true;
    }
    catch {
        return false;
    }
};
const getBlogContent = async (blog) => {
    const name = blog.name;
    const url = new url_1.URL(blog.url);
    const pathSegments = url.pathname.split("/").filter(Boolean);
    const lastSegment = pathSegments.pop() ?? "";
    const filePath = `./blogs/${name}/${lastSegment}.txt`;
    const fileExists = await ifBlogExists(filePath);
    if (fileExists) {
        const content = await fs_1.promises.readFile(filePath, "utf8");
        return content;
    }
    else {
        console.log("Article not found in local, fetching from remote");
        const { data } = await axios_1.default.get(blog.url);
        const $ = cheerio.load(data);
        let text = $(blog.querySelector).text().trim();
        const title = lastSegment;
        const datetime = new Date().toISOString();
        const content = text;
        console.log(blog.querySelector);
        console.log(content);
        await (0, exports.saveBlogToFile)(name, title, datetime, content);
        return text;
    }
};
exports.getBlogContent = getBlogContent;
