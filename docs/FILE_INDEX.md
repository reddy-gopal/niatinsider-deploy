# campus-next — auth, middleware, and routing file index

Snapshot of paths you asked for vs this repo (April 2026).

| You asked for | Actual path in repo | Notes |
|---------------|---------------------|--------|
| `middleware.ts` | `campus-next/middleware.ts` | Project root (not under `src/`). |
| `src/lib/api.ts` | **Not present** | Use `src/lib/apiBase.ts`, `src/lib/authApi.ts`, `src/lib/articlesApi.ts`. |
| `src/lib/authApi.ts` | `campus-next/src/lib/authApi.ts` | `ensureRefreshed`, `fetchMe`, `authApi` / `api` axios instances. |
| `src/app/page.tsx` | `campus-next/src/app/page.tsx` | Current home (Server Component + `HomePageClient`). |
| `src/app/home/page.tsx` | **Not present** | No `/home` route. |
| `src/app/login/page.tsx` | `campus-next/src/app/login/page.tsx` | Wraps `LoginClient`. |
| Zustand auth store | `campus-next/src/store/authStore.ts` | `bootstrapAuth`, `clearAuth`, `useAuthStore`. |
| `src/app/layout.tsx` | `campus-next/src/app/layout.tsx` | Root layout. |
| Navbar | `campus-next/src/components/Navbar.tsx` | |
| `article/[id]/page.tsx` | `campus-next/src/app/article/[slug]/page.tsx` | Dynamic segment is **`slug`**, not `id`. |
| `[campus]/article/[id]/page.tsx` | `campus-next/src/app/[campusSlug]/article/[articleSlug]/page.tsx` | Segments: **`campusSlug`**, **`articleSlug`**. |
| `[campus]/page.tsx` | `campus-next/src/app/[campusSlug]/page.tsx` | Campus landing. |

Full source snapshots:

- [`01-middleware-auth-api-layout.md`](./01-middleware-auth-api-layout.md) — middleware, `apiBase`, `authApi`, `authStore`, root `layout`, `login/page`, home `page`.
- [`02-pages-navbar.md`](./02-pages-navbar.md) — article routes, campus route, `Navbar`.
