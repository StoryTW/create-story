# @storytw/create-story

Create a Next.js or Vite project from a StoryTW template.

```sh
npx @storytw/create-story@latest
```

You can also run `npm create @storytw/story@latest`.

Choose a template, enter a name for the new project folder, and decide whether
to install dependencies. The CLI downloads the template from its GitHub `main`
branch into a new folder under your current directory.

- [Next.js + ESLint](https://github.com/StoryTW/nextjs-template-by-story)
- [Vite + ESLint](https://github.com/StoryTW/vite-template-by-story)

To run either generated project, use Node.js 24.11+ on the 24.x line or Node.js
26+, and pnpm 11 or newer. If you skip automatic installation, run:

```sh
cd ./my-app
pnpm install
pnpm dev
```

## Local development

```sh
npm ci
npm run typecheck
npm run build
node dist/cli.mjs
```

Run `npm pack` to build a local tarball you can install and test before publishing.
