import { ILogger } from "../core/ports/loggingPort";
import fs from "fs";

export enum LogTarget {
  CONSOLE = "console",
  FILE = "file",
  REMOTE = "remote",
}

export class LoggingAdapter implements ILogger {
  private target: LogTarget;

  constructor(target: LogTarget = LogTarget.CONSOLE) {
    this.target = target;
  }
  log(message: string): void {
    this.writeLog("LOG", message);
  }

  error(message: string): void {
    this.writeLog("ERROR", message);
  }

  info(message: string): void {
    this.writeLog("INFO", message);
  }

  warn(message: string): void {
    this.writeLog("WARN", message);
  }

  debug(message: string): void {
    this.writeLog("DEBUG", message);
  }

  private writeLog(level: string, message: string): void {
    const formattedMessage = `[${level}] ${new Date().toISOString()}: ${message}`;

    switch (this.target) {
      case LogTarget.CONSOLE:
        console.log(formattedMessage);
        break;
      case LogTarget.FILE:
        fs.appendFileSync("log.txt", `${formattedMessage}\n`);
        break;
      case LogTarget.REMOTE:
        // Remote API call to send logs, left as an exercise
        break;
    }
  }
}
