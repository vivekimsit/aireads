"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    model: "gpt-3.5-turbo",
    timeout: 100000,
    hubspot: {
        url: "https://product.hubspot.com/blog",
        selector: "hs_cos_wrapper_post_body",
    },
};
