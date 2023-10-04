import { promises as fs } from "fs";
import { join } from "path";
import axios from "axios";
import { URL } from "url";
import * as cheerio from "cheerio";

const blogsDir = join(process.cwd(), "blogs");

interface BlogConfig {
  name: string;
  url: string;
  querySelector: string;
}

// Initialize blog directory
fs.mkdir(blogsDir).catch((err) => {
  if (err.code !== "EEXIST") throw err;
});

export const saveBlogToFile = async (
  name: string,
  title: string,
  datetime: string,
  content: string
) => {
  fs.mkdir(join(blogsDir, name)).catch((err) => {
    if (err.code !== "EEXIST") throw err;
  });

  const filePath = join(blogsDir, name, `${title}.md`);
  const fileContent = `# ${title}\n\n## ${datetime}\n\n## ${content}\n`;
  await fs.writeFile(filePath, fileContent);
};

export const readBlogFromFile = async (title: string): Promise<string> => {
  const filePath = join(blogsDir, `${title}.md`);
  return fs.readFile(filePath, "utf8");
};

const ifBlogExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

export const getBlogContent = async (blog: BlogConfig) => {
  const name = blog.name;
  const url = new URL(blog.url);
  const pathSegments = url.pathname.split("/").filter(Boolean);
  const lastSegment = pathSegments.pop() ?? "";
  const filePath = `./blogs/${name}/${lastSegment}.txt`;

  const fileExists = await ifBlogExists(filePath);

  if (fileExists) {
    const content = await fs.readFile(filePath, "utf8");
    return content;
  } else {
    console.log("Article not found in local, fetching from remote");
    const { data } = await axios.get(blog.url);
    const $ = cheerio.load(data);
    let text = $(blog.querySelector).text().trim();

    const title = lastSegment;
    const datetime = new Date().toISOString();
    const content = text;

    await saveBlogToFile(name, title, datetime, content);
    return text;
  }
};
