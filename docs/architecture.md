# Architecture Notes

- **App Shell**: `src/main.tsx` mounts `App.tsx` into `index.html`. Routing lives in `src/App.tsx` using React Router with page components under `src/pages`.
- **Pages vs. Components**: Full-page views sit in `src/pages` (dashboard, calendar, budget, gallery, activity, onboarding, auth). Shared UI lives in `src/components`, with navigation layout in `Navigation.tsx`, Figma helpers under `components/figma`, and primitives under `components/ui`.
- **Styling**: Generated Tailwind output is kept in `src/styles/tailwind.generated.css`. Custom tokens and resets live in `src/styles/globals.css`; both are imported via `src/index.css`.
- **Build/Serve**: Vite config is in `vite.config.ts` (ESNext target, output to `build/`, dev server on port 3000). Aliases pin specific Radix and UI versions.
- **Testing**: Vitest is configured in `vite.config.ts` with jsdom, `vitest.setup.ts` pulls `@testing-library/jest-dom`, and sample specs should live next to source files (e.g., `src/pages/__tests__`).
