import { BlogPort } from "../ports/blogPort";

export class GetBlogListUseCase {
  constructor(private blogPort: BlogPort) {}

  async execute(): Promise<string[]> {
    return await this.blogPort.getBlogList();
  }
}
