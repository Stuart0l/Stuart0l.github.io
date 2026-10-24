import { readFileSync } from "node:fs";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import markdownItAnchor from "markdown-it-anchor";

// Inline SVG from _includes/icons/, coloured by currentColor.
const icon = (name) =>
  readFileSync(new URL(`./_includes/icons/${name}.svg`, import.meta.url), "utf8")
    .trim()
    .replace(/ width="\d+" height="\d+"/, "")
    .replace("<svg ", '<svg class="icon" aria-hidden="true" focusable="false" fill="currentColor" ');

const GITHUB_REPO = /^https:\/\/github\.com\/([^/]+\/[^/#?]+)/;

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addShortcode("icon", icon);
  eleventyConfig.addWatchTarget("./_includes/icons/");

  eleventyConfig.amendLibrary("md", (md) => {
    md.use(markdownItAnchor, { level: [2, 3] });

    // ```mermaid blocks render client-side; emit them untouched instead of highlighting.
    const fence = md.renderer.rules.fence;
    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      if (token.info.trim() === "mermaid") {
        return `<pre class="mermaid">${md.utils.escapeHtml(token.content)}</pre>\n`;
      }
      return fence(tokens, idx, options, env, self);
    };

    // Publication links: [[Paper]] / [[Slides]] get an icon; [[Code]] to GitHub
    // becomes the GitHub mark + "org/repo".
    const PUB_LINKS = { "[paper]": "paper", "[slides]": "slides", "[code]": "github" };
    md.core.ruler.push("pub_links", (state) => {
      for (const block of state.tokens) {
        const t = block.children;
        if (!t) continue;
        for (let i = 0; i + 2 < t.length; i++) {
          if (t[i].type !== "link_open" || t[i + 1].type !== "text" || t[i + 2].type !== "link_close") continue;
          const name = PUB_LINKS[t[i + 1].content.toLowerCase()];
          if (!name) continue;
          const repo = name === "github" && t[i].attrGet("href")?.match(GITHUB_REPO)?.[1];
          const label = repo || t[i + 1].content.slice(1, -1);
          t[i].attrJoin("class", "pub-link");
          t[i + 1].type = "html_inline";
          t[i + 1].content = `${icon(name)}<span>${md.utils.escapeHtml(label)}</span>`;
        }
      }
    });

    // A table cell of only * characters, e.g. "* * *", renders as Michelin stars,
    // and the table gets a footer row with the total.
    md.core.ruler.push("michelin_stars", (state) => {
      const tokens = state.tokens;
      let total = 0, starCol = -1, col = -1, cols = 0;
      for (let j = 0; j < tokens.length; j++) {
        const t = tokens[j];
        if (t.type === "table_open") { total = 0; starCol = -1; cols = 0; }
        else if (t.type === "th_open") cols++;
        else if (t.type === "tr_open") col = -1;
        else if (t.type === "td_open") col++;
        else if (t.type === "inline" && tokens[j - 1]?.type === "td_open") {
          const cell = t.content.replace(/\s+/g, "");
          if (!/^\*+$/.test(cell)) continue;
          const n = cell.length;
          total += n;
          starCol = col;
          const label = `${n} Michelin star${n > 1 ? "s" : ""}`;
          const html = `<span class="michelin" role="img" aria-label="${label}" title="${label}">${icon("michelin").repeat(n)}</span>`;
          t.children = [Object.assign(new state.Token("html_inline", "", 0), { content: html })];
        } else if (t.type === "table_close" && total > 0) {
          const cells = Array.from({ length: cols }, (_, c) =>
            c === 0 ? "<td>Total</td>"
            : c === starCol ? `<td><span class="michelin-total">${icon("michelin")}<span>${total}</span></span></td>`
            : "<td></td>");
          const foot = new state.Token("html_block", "", 0);
          foot.content = `<tfoot><tr>${cells.join("")}</tr></tfoot>\n`;
          tokens.splice(j, 0, foot);
          j++;
          total = 0;
        }
      }
    });

    // ![Facebook](icon:facebook) → inline SVG from _includes/icons/.
    const image = md.renderer.rules.image;
    md.renderer.rules.image = (tokens, idx, options, env, self) => {
      const name = tokens[idx].attrGet("src").match(/^icon:([\w-]+)$/)?.[1];
      if (!name) return image(tokens, idx, options, env, self);
      const label = md.utils.escapeHtml(tokens[idx].content);
      return `<span class="icon-img" role="img" aria-label="${label}" title="${label}">${icon(name)}</span>`;
    };
  });

  // Table of contents from rendered <h2 id="…"> headings.
  eleventyConfig.addFilter("toc", (html) =>
    [...html.matchAll(/<h2 id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g)].map(([, id, text]) => ({
      id,
      text: text.replace(/<[^>]+>/g, ""),
    }))
  );

  for (const path of [
    "Luo_Xuhao_CV.pdf",
    "Luo_Xuhao_Resume.pdf",
    "Luo_Xuhao_Resume_ch.pdf",
    "slides",
    "favicon.ico",
    "logo.jpg",
    "CNAME",
    "assets",
  ]) {
    eleventyConfig.addPassthroughCopy(path);
  }

  return {
    dir: { input: "src", includes: "../_includes", output: "_site" },
    markdownTemplateEngine: false,
  };
}
