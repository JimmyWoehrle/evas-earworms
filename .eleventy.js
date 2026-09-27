module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addFilter("readableDate", (value) => new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(value)));
  eleventyConfig.addFilter("absoluteUrl", (path, base) => new URL(String(path).replace(/^\/+/, ""), base.endsWith("/") ? base : base + "/").href);
  eleventyConfig.addFilter("xmlEscape", (value = "") => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;"));
  eleventyConfig.addCollection("publishedPosts", (api) => api.getFilteredByGlob("src/posts/*.md").filter((item) => !item.data.draft).sort((a, b) => b.date - a.date));
  return {
    pathPrefix: process.env.PATH_PREFIX || "/",
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk", htmlTemplateEngine: "njk", templateFormats: ["md", "njk", "html"]
  };
};
