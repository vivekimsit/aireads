"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogPort = exports.gPTRuntimeAdapter = exports.storageAdapter = exports.configAdapter = exports.loggingAdapter = void 0;
// config.ts
const blogAdapter_1 = require("./adapters/blogAdapter");
const fileStorageAdapter_1 = require("./adapters/fileStorageAdapter");
const configAdapter_1 = require("./adapters/configAdapter");
const loggingAdapter_1 = require("./adapters/loggingAdapter");
const gPTRuntimeAdapter_1 = require("./adapters/gPTRuntimeAdapter");
exports.loggingAdapter = new loggingAdapter_1.LoggingAdapter();
exports.configAdapter = new configAdapter_1.ConfigAdapter();
exports.storageAdapter = new fileStorageAdapter_1.FileStorageAdapter(process.cwd());
exports.gPTRuntimeAdapter = new gPTRuntimeAdapter_1.GPTAdapter(exports.loggingAdapter);
exports.blogPort = new blogAdapter_1.BlogAdapter(exports.loggingAdapter, exports.configAdapter, exports.gPTRuntimeAdapter, exports.storageAdapter);
