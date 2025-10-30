module.exports = {
  plugins: [
    {
      postcssPlugin: "remove-astro-runtime-css",
      Once(root) {
        root.walkRules((rule) => {
          if (
            rule.selector.includes("astro-island") ||
            rule.selector.includes("astro-slot") ||
            rule.selector.includes("astro-static-slot")
          ) {
            rule.remove();
          }
        });
      },
    },
  ],
};
module.exports.postcss = true;
