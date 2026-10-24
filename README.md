# www.xuhaol.com

Personal homepage, built with [Eleventy](https://www.11ty.dev/) from Markdown.

## Editing

Pages live in `src/` as Markdown:

| File | URL |
|---|---|
| `src/index.md` | `/` (hero fields — name, tagline, links — are in its front matter) |
| `src/personal.md` | `/personal/` |
| `src/projects/hls-experience.md` | `/projects/hls-experience/` |

A new page needs front matter with `layout: page.njk` and `title`; add `toc: true` for an on-page contents list, and `tags: project` to list it under the **Project** menu. ` ```mermaid ` blocks render as diagrams. Wrap award text in `<span class="award">…</span>`. Links titled `[Paper]` and `[Slides]` (e.g. `[[Paper]](https://…)`) get an icon; a `[[Code]](https://github.com/org/repo)` link renders as the GitHub mark plus `org/repo`. A table cell containing only `*` characters (e.g. `* * *`) renders as Michelin stars (icon from [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:MichelinStar.svg), CC BY-SA 3.0).

Icons live in `_includes/icons/` (GitHub, LinkedIn, Facebook, Instagram, mail). In Markdown, `![LinkedIn](icon:linkedin)` inlines one, e.g. `[![LinkedIn](icon:linkedin)](https://…)`. The hero icon row comes from `profiles` in `src/index.md`.

PDFs (`Luo_Xuhao_*.pdf`, `slides/`) stay at the repo root and keep their URLs.

## Preview and deploy

```sh
npm install
npm start        # http://localhost:8080, live reload
```

Pushing to `master` builds and deploys via `.github/workflows/deploy.yml`. Repo **Settings → Pages → Source** must be set to **GitHub Actions**.
