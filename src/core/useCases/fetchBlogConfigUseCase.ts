import { ConfigPort } from "../ports/configPort";
import { BlogConfig } from "../models/blogConfig";

export class FetchBlogConfigUseCase {
  constructor(private configPort: ConfigPort) {}

  execute(blogName: string): BlogConfig | undefined {
    return this.configPort.getConfigByName(blogName);
  }
}
