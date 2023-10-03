import { BlogPort } from "../ports/blogPort";
import { BlogConfig } from "../models/blogConfig";

export class GetBlogListUseCase {
  constructor(private blogPort: BlogPort) {}

  async execute(): Promise<BlogConfig[]> {
    return await this.blogPort.getBlogList();
  }
}
