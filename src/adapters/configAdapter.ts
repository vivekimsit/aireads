import * as path from "path";
import * as fs from "fs";
import { ConfigPort } from "../core/ports/configPort";
import { BlogConfig } from "../core/models/blogConfig";

export class ConfigAdapter implements ConfigPort {
  private blogConfigs: BlogConfig[];

  constructor() {
    const configPath = path.resolve(
      process.cwd(),
      "src/configs/blogConfig.json"
    );
    this.blogConfigs = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }

  getConfigByName(blogName: string): BlogConfig | undefined {
    return this.blogConfigs.find((config) => config.name === blogName);
  }

  getAllConfigs(): BlogConfig[] {
    return this.blogConfigs;
  }
}
