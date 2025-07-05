import { readdirSync } from "fs";
import { posix } from "path";

const assets = readdirSync("./public/assets", { recursive: true });

const preloadLinks: { rel: "preload"; href: string; as: "image" }[] = assets
  .filter((asset) => asset.toString().endsWith(".webp"))
  .map((asset) => {
    return {
      rel: "preload",
      href: posix.join("/assets", asset.toString()),
      as: "image",
    };
  });

export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  app: {
    head: {
      title: "寻根之旅",
      link: preloadLinks,
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' }
      ]
    },
  },
});
