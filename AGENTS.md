# Repository Guidelines

## Project Structure & Module Organization

This is a Vite-powered React 19 application written in TypeScript. Application entry code is in `src/main.tsx`; the primary UI component is `src/App.tsx`. Keep component-specific styles beside their component (for example, `src/App.css`), and place shared global CSS in `src/index.css`. Put imported images and SVGs in `src/assets/`; files that must be served unchanged belong in `public/`.

## Build, Test, and Development Commands

- `npm install` installs the locked project dependencies.
- `npm run dev` starts the Vite development server with hot module replacement.
- `npm run build` runs TypeScript project builds and produces an optimized production bundle.
- `npm run lint` runs Oxlint over the codebase.
- `npm run preview` serves the production build locally after `npm run build`.

Run `npm run lint` and `npm run build` before opening a pull request. There is no automated test command configured yet; add a test runner and matching `*.test.tsx` files when introducing behavior that warrants regression coverage.

## Coding Style & Naming Conventions

Follow the existing TypeScript and JSX style: two-space indentation, single quotes, semicolons omitted, and trailing commas where the formatter already uses them. Use PascalCase for React component names and files (for example, `UserProfile.tsx`), camelCase for variables and functions, and descriptive CSS class names. Keep components focused; import assets with relative paths from `src/assets/` and avoid editing generated build output.

## Commit & Pull Request Guidelines

Git history is not available in this workspace, so no repository-specific commit convention can be confirmed. Use short, imperative commit subjects such as `Add district summary panel`. Keep commits scoped to one logical change. Pull requests should explain the user-visible change, link the related issue when one exists, list validation commands run, and include screenshots for UI changes.

## Configuration & Security

Do not commit secrets or environment-specific values. Keep any future client-exposed Vite variables under the `VITE_` prefix and document required values in the README or an example environment file.
