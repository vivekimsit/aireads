"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readBlogFromFile = exports.saveBlogToFile = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const blogsDir = (0, path_1.join)(process.cwd(), "blogs");
// Initialize blog directory
fs_1.promises.mkdir(blogsDir).catch((err) => {
    if (err.code !== "EEXIST")
        throw err;
});
const saveBlogToFile = async (title, datetime, content) => {
    const filePath = (0, path_1.join)(blogsDir, `${title}.md`);
    const fileContent = `# ${title}\n\n## ${datetime}\n\n## ${content}\n`;
    await fs_1.promises.writeFile(filePath, fileContent);
};
exports.saveBlogToFile = saveBlogToFile;
const readBlogFromFile = async (title) => {
    const filePath = (0, path_1.join)(blogsDir, `${title}.md`);
    return fs_1.promises.readFile(filePath, "utf8");
};
exports.readBlogFromFile = readBlogFromFile;
