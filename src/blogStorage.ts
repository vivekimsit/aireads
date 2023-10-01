import { promises as fs } from "fs";
import { join } from "path";

const blogsDir = join(process.cwd(), "blogs");

// Initialize blog directory
fs.mkdir(blogsDir).catch((err) => {
  if (err.code !== "EEXIST") throw err;
});

export const saveBlogToFile = async (
  title: string,
  datetime: string,
  content: string
) => {
  const filePath = join(blogsDir, `${title}.md`);
  const fileContent = `# ${title}\n\n## ${datetime}\n\n## ${content}\n`;
  await fs.writeFile(filePath, fileContent);
};

export const readBlogFromFile = async (title: string): Promise<string> => {
  const filePath = join(blogsDir, `${title}.md`);
  return fs.readFile(filePath, "utf8");
};
