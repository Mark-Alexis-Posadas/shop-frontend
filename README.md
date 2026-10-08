# E-commerce client

React + TypeScript + Vite frontend.

## Development

Start the backend from `../server` with `npm run dev` (port 5000), then run `npm run dev` here and open the Vite URL.

## Feature-based structure

```text
src/
  app/
    layouts/AppLayout.tsx
    providers/AppProviders.tsx
    query-client.ts
    router.tsx
  features/
    home/pages/HomePage.tsx
    products/
      api/products.api.ts
      components/ProductCard.tsx
      hooks/use-products.ts
      pages/ProductsPage.tsx
      types.ts
  shared/
    components/
    stores/ui-store.ts
    styles/index.css
  assets/
  main.tsx
```

- `app`: application setup, providers, routing, and layouts.
- `features`: keep a feature's pages, API calls, hooks, components, and types together. Add auth, cart, and orders here when implemented.
- `shared`: reusable UI and utilities that do not depend on a specific feature. Shared code should not import feature modules.
- TanStack Query owns server data; Zustand owns client UI state. Feature-specific Zustand stores belong inside their feature.
- Use direct imports. Create subfolders when needed rather than empty placeholders. Only extract shared code when multiple features need it.
- Routes remain code-based TanStack Router routes. API requests use the development `/api` proxy in `vite.config.ts`; production needs equivalent routing or API URL configuration.

The existing Home page is the home route. Products retains loading, error, empty, and success states. Authentication and checkout are not implemented yet.

## Checks

- `npm run build`
- `npm run lint`
