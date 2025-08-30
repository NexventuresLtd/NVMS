# Frontend Development Guidelines

**Project:** Nexventures Management System
**Tech Stack:** React, TypeScript, Tailwind CSS (or your chosen CSS framework), Axios/React Query
**Document Owner:** Alain Michael Muhirwa, CTO
**Last Updated:** June 27, 2025

---

## 1. Project Structure

We follow a **feature-based folder structure** for scalability and separation of concerns.
Anything that seems like it could be reused in a separate project should be made reusable.

```
src/
├── components/         # Shared/reusable UI components
├── features/           # Feature modules (e.g., wallet, auth, bulletin)
├── hooks/              # Global reusable custom hooks
├── services/           # API logic
├── store/              # Redux or Zustand store setup
├── types/              # Global TypeScript types/interfaces
├── routes/             # Route definitions and guards
├── layouts/            # Page layout wrappers
└── App.tsx, main.tsx   # App entry points
```

Use the `features/` directory for anything domain-specific.

---

## 2. Code Style & Standards

### TypeScript

- Always type props and state.
- Use interfaces for object shapes, types for primitives or unions.
- Prefer `type Props = {}` for component props unless extending other types.

```tsx
type ButtonProps = {
  label: string;
  onClick: () => void;
};
```

### ESLint & Prettier

- Follow the project’s ESLint and Prettier configuration.
- Lint and format before committing (`npm run lint && npm run format`).

### Naming Conventions

- Components: `PascalCase`
- Files and folders: `kebab-case`
- Variables and functions: `camelCase`

---

## 3. Component Guidelines

### Functional Components Only

Use functional components with hooks; do not use class components.

### Component Location

- Reusable: `src/components/`
- Feature-specific: `src/features/<feature>/components/`

### Separation

- Keep logic (hooks, API) separate from presentation.
- Use `useX()` hooks for business logic where possible.

```tsx
// Good example
<WalletTable transactions={data} />
```

---

## 4. State Management

- Use React context or Zustand for lightweight global state.
- Use Redux Toolkit only if state becomes complex or shared across many features.
- Keep local state inside components where possible.

---

## 5. API Integration

- Use **Axios** or **React Query** for API communication.
- Centralize endpoints in `src/services/`.
- Never call APIs directly inside components — use service functions or hooks.

```tsx
// src/services/walletService.ts
export const getWalletEntries = () => api.get("/wallet");

// Inside component
const { data } = useQuery(["wallet"], getWalletEntries);
```

---

## 6. Styling

- Use **Tailwind CSS** (or your selected CSS-in-JS/utility framework).
- Avoid inline styles unless necessary.
- Group Tailwind classes logically and limit to relevant components.

---

## 7. Routing

- Use `react-router-dom`.
- Routes defined in `src/routes/AppRoutes.tsx`.
- Use `ProtectedRoute` for authenticated access.

```tsx
<Route
  path="/wallet"
  element={
    <ProtectedRoute>
      <WalletPage />
    </ProtectedRoute>
  }
/>
```

---

## 8. Testing

- Use **React Testing Library** for component tests.
- Snapshot tests are allowed but not preferred.
- Keep tests close to the components (e.g., `Button.test.tsx` in the same folder).

---

## 9. Git & Pull Requests

- Use descriptive branch names: `feature/wallet-table`, `fix/login-redirect`.
- Write clear PR titles and descriptions.
- Keep PRs under 300 lines when possible.
- Assign at least one reviewer.

---

## 10. Documentation

- Document component props, hooks, and utility functions with JSDoc.
- Update relevant `.md` or Notion docs when adding new features.

```ts
/**
 * Formats amount to currency string
 * @param amount number
 * @returns string
 */
export const formatCurrency = (amount: number): string => ...
```

---

## 11. Environment Variables

- Store config in `.env` files.
- Do not hardcode API URLs or keys.
- Example:

```env
VITE_API_BASE_URL=https://api.nexventures.net
```

---

## 12. Accessibility & UX

- Use semantic HTML elements.
- Label inputs correctly.
- Ensure keyboard navigation works.
- Use `aria-*` attributes where needed.

---

## 13. Component Reusability

- Keep generic components like `Modal`, `Button`, `Input`, etc., in `components/`.
- Avoid creating a new component if one exists that can be reused with props.

---

## Final Notes

- Consistency is more important than perfection.
- Ask before building large utilities — chances are they already exist.
- When in doubt, document your decision.

---

If you have questions or need a walkthrough of the architecture, contact the CTO or lead frontend engineer.

---
