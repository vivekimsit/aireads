import { BlogConfig } from "../models/blogConfig";

export interface ConfigPort {
  getConfigByName(blogName: string): BlogConfig | undefined;
  getAllConfigs(): BlogConfig[];
}
