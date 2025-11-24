# Repository Guidelines

## Project Structure & Module Organization
- Entrypoint is `src/main.tsx` mounting `App.tsx`; `index.html` hosts the Vite root.
- Page and feature views live in `src/components` (e.g., `Dashboard.tsx`, `CalendarView.tsx`, `GalleryPage.tsx`); shared atoms are under `src/components/ui`, and Figma image helpers sit in `src/components/figma`.
- Global styles come from `src/index.css` (Tailwind v4 build output) with supplemental tokens in `src/styles/globals.css`. Assets and attribution notes live in `src/Attributions.md`.
- Keep new screens in `src/components`, and prefer colocated helper files (e.g., `Feature/FeatureCard.tsx`) when adding scoped logic.

## Build, Test, and Development Commands
- `npm install` — install dependencies.
- `npm run dev` — start the Vite dev server (default: http://localhost:5173) with hot reload.
- `npm run build` — produce an optimized production bundle in `dist/`; run before opening a PR.
- If you add tests, wire a `test` script (e.g., Vitest) and document the command here.

## Coding Style & Naming Conventions
- TypeScript + React functional components; use hooks over class components. Prefer `React.FC`-free declarations (`export function Component()`).
- File naming: PascalCase for components (`WeddingCard.tsx`), camelCase for utilities, and `*.tsx` for anything rendering JSX.
- Styling uses Tailwind utility classes already emitted to `index.css`; avoid inline styles unless needed for dynamic values.
- Indent with 2 spaces; single quotes for imports/strings to match existing files; keep imports sorted by library → local.

## Testing Guidelines
- No test harness is present; add Vitest + React Testing Library when introducing behavioral changes or new data flows.
- Co-locate tests next to components as `Component.test.tsx`; name suites after the component and cover rendering, key interactions, and edge states.
- Aim for smoke coverage on new pages and regression coverage for bug fixes.

## Commit & Pull Request Guidelines
- Use clear, imperative commit subjects (`Add dashboard stats cards`, `Fix gallery image fallback`). If you introduce a series, group related changes logically.
- PRs should include: scope summary, screenshots for visual updates, reproduction steps for fixes, and a checklist of commands run (`npm run build`, tests if added).
- Link related issues or tasks; note any follow-ups or known gaps explicitly.
