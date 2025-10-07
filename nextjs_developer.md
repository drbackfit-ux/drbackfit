Next.js Developer Guidelines (App Router)

This document defines how this Next.js (App Router) application should be developed.
GitHub Copilot (and developers) should follow these rules to generate consistent, scalable, and maintainable code.

Scope: Next.js App Router, TypeScript, React Server Components (RSC), Tailwind CSS, ESLint/Prettier, Jest/RTL, Playwright.

1) Architecture

Core principles

RSC-first: Default to Server Components. Mark components as client with "use client" only when you need browser APIs, event handlers, refs/imperative APIs, or stateful interactive UI.

Separation of concerns: Keep UI, state, and data logic apart.

Presentational vs Container: Keep dumb (presentational) components separate from smart (data/composition) components.

Data flows

Reads: Prefer data fetching in Server Components using fetch() with Next’s caching (revalidate, cache, tags).

Writes/Mutations: Prefer Server Actions or Route Handlers (app/api/**/route.ts). Call business logic directly on the server—do not round-trip via client unless interactivity requires it.

Services layer: Centralize external API/DB calls and response normalization in services/ (server-only).

Validation: Use Zod (or Yup) to validate inputs and normalize responses at boundaries (requests, env, external APIs).

Global state: Minimize; prefer server state. Use Zustand/Redux (or React Context) only for truly shared client state that isn’t derived from the server.

2) Folder Structure

Use an App Router–oriented, domain-first structure with clear server/client boundaries.

src/
├─ app/                               # Routes (App Router)
│  ├─ (marketing)/                    # Route groups
│  │  └─ page.tsx
│  ├─ (dashboard)/
│  │  ├─ layout.tsx                   # Server layout
│  │  ├─ page.tsx                     # Server page
│  │  ├─ loading.tsx                  # Route-level skeleton
│  │  ├─ error.tsx                    # Route error boundary (client)
│  │  ├─ not-found.tsx
│  │  └─ users/
│  │     ├─ page.tsx
│  │     └─ [id]/
│  │        └─ page.tsx
│  ├─ api/                            # Route Handlers (server)
│  │  └─ users/
│  │     └─ route.ts
│  ├─ layout.tsx                      # Root layout (server)
│  └─ page.tsx                        # Home (server)
│
├─ components/
│  ├─ ui/                             # Reusable, mostly client (if interactive)
│  │  ├─ Button.tsx
│  │  └─ Input.tsx
│  └─ common/                         # Headers, Footers, Navbars (server or client)
│     ├─ Header.tsx
│     └─ Sidebar.tsx
│
├─ hooks/                             # Custom React hooks (client)
│  ├─ useAuth.ts
│  └─ useDebounce.ts
│
├─ services/                          # Business logic & API calls (server-only)
│  ├─ users.service.ts
│  └─ auth.service.ts
│
├─ lib/                               # Shared helpers (split by runtime)
│  ├─ server/                         # Server-only helpers (import 'server-only')
│  │  ├─ db.ts
│  │  └─ cookies.ts
│  ├─ client/                         # Client-only helpers (import 'client-only')
│  │  └─ analytics.ts
│  ├─ fetcher.ts                      # Typed fetch wrapper (isomorphic ok)
│  └─ cache.ts                        # revalidateTag helpers, keys, etc.
│
├─ store/                             # Zustand/Redux (client), only if needed
│  └─ useThemeStore.ts
│
├─ models/                            # Types & schemas
│  ├─ User.ts
│  └─ Product.ts
│
├─ utils/                             # Pure utilities (isomorphic)
│  ├─ formatDate.ts
│  └─ validators.ts
│
├─ styles/                            # Global styles, Tailwind config
│  ├─ globals.css
│  └─ tailwind.css
│
├─ actions/                           # Server Actions (server)
│  └─ user.actions.ts
│
├─ config/                            # App configuration
│  ├─ env.mjs                         # Zod-validated env
│  └─ next-seo.config.ts
│
├─ middleware.ts                      # Edge middleware (auth, headers)
├─ instrumentation.ts                 # Observability/metrics (server)
└─ tests/                             # Jest/RTL + Playwright
   ├─ unit/
   ├─ integration/
   └─ e2e/


Server-only vs client-only: In server modules, add import 'server-only'. In client-only modules, add import 'client-only'.

3) Naming Conventions

Components: UserCard.tsx, LoginForm.tsx
Client components must start with "use client" at the top.

Pages/Routes: page.tsx, layout.tsx, loading.tsx, error.tsx, not-found.tsx

Hooks: useAuth.ts, useUsers.ts

Services: users.service.ts, auth.service.ts

Actions: user.actions.ts

Models: User.ts, Product.ts

Utils: formatDate.ts, parseJwt.ts

Variables/Functions: Be descriptive: userList, isAuthenticated, fetchUsers.

4) File & Function Size

Component file length: ≤ ~300 lines.

Function length: ≤ 30–40 lines (extract helpers).

Hooks/Services: ≤ ~150 lines.

Avoid God components/pages. Split by concerns and by runtime (server vs client).

5) Next.js Principles

Functional components with hooks only (no classes).

TypeScript everywhere. Props and return types must be typed.

Prefer composition over inheritance.

Default server, opt-in client. Add "use client" only when necessary.

Route co-location: Keep route-specific UI near its route segment.

6) Data Fetching & Caching (RSC)

Reads

Use await fetch(url, { cache, next: { revalidate, tags } }) in Server Components or services.

Static: cache: 'force-cache' (default) with revalidate (ISR) for periodic freshness.

Dynamic: cache: 'no-store' for per-request data.

Tag-based revalidation: Use revalidateTag('users') after mutations to bust cached reads.

Writes

Prefer Server Actions (forms or programmatic) or Route Handlers under app/api.

On successful mutation, call revalidateTag/revalidatePath to update stale pages.

Client fetching

Use React Query (or SWR) only for interactive client UIs that require live re-fetching, optimistic updates, etc.

Do not fetch internal APIs from server components; call services directly.

Error/Loading states

Use route-level loading.tsx for skeletons and streaming.

Use error.tsx to catch render-time errors in a route segment.

Explicitly handle loading, error, and empty states in UI components.

7) Server Actions (Mutations)

File location: src/actions/*.actions.ts or co-located with route in app/**.

Top of file: "use server".

Validate inputs with Zod; never trust client payloads.

Use idempotent patterns where possible; handle failure and partial success.

After writes, call revalidateTag/revalidatePath to refresh cached views.

Prefer progressive enhancement with <form action={actionFn}> + useFormStatus().

Example

// src/actions/user.actions.ts
"use server";

import { z } from "zod";
import { createUser } from "@/services/users.service";
import { revalidateTag } from "next/cache";

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

export async function createUserAction(formData: FormData) {
  const parsed = CreateUserSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten() };
  }

  await createUser(parsed.data);
  revalidateTag("users");
  return { ok: true };
}

8) API Layer (Route Handlers)

Location: app/api/<resource>/route.ts
Methods: GET, POST, PUT, PATCH, DELETE as exported functions.

Validate request with Zod; return typed, normalized responses.

Prefer Node runtime for heavy/DB operations; use Edge only when latency-sensitive and compatible.

// src/app/api/users/route.ts
import { NextResponse } from "next/server";
import { listUsers } from "@/services/users.service";

export async function GET() {
  const users = await listUsers();
  return NextResponse.json(users);
}

9) State Management

Default: Server state via RSC and fetch caching.

Client state: Local UI state within client components.

Global client state: Use Zustand or Redux Toolkit when needed (themes, ephemeral UI, cross-component interactions).

Avoid prop drilling by using context/store; keep stores small and focused.

10) Styling

Tailwind CSS (preferred).

Atomic/utility-first for UI primitives in components/ui/.

No inline styles unless absolutely necessary.

Use next-themes for theming if required.

Respect accessibility (focus states, contrast, semantic HTML).

11) Libraries & Tools

HTTP: Native fetch (typed), or Axios via a wrapper (but prefer fetch in server).

Data: React Query (client-state fetching), Zod for schemas.

Animation: Framer Motion (client components).

Routing: Next.js App Router (next/navigation).

Forms: Server Actions or react-hook-form (client) with Zod resolver.

Lint/Format: ESLint (eslint-config-next) + Prettier.

Tests: Jest + React Testing Library (unit/integration). Playwright (E2E).

Build: Turbopack (dev) / Next build.

CI: Type-check, lint, test, build on PR.

12) UI Rules

UI components are stateless unless local UI state is required.

Must be reusable and composable.

Prefer server components for pure presentation fed by server data; switch to client only when interactivity is needed.

Use next/image, next/font, and next/link consistently.

13) Routing Conventions

app/**/layout.tsx for persistent UI shells; template.tsx for re-rendering per navigation.

loading.tsx for streaming skeletons; error.tsx (client) for error boundaries.

not-found.tsx for 404s in a segment.

generateMetadata() for SEO meta at route level.

Dynamic routes: [id]/page.tsx. Prebuild with generateStaticParams() when possible.

Route segment config (per file):

export const revalidate = 3600;

export const dynamic = "force-static" | "force-dynamic";

export const runtime = "nodejs" | "edge";

14) Testing

Unit (Jest + RTL)

Test hooks, services, and pure utilities.

Mock fetch/services with MSW or jest mocks.

Component (RTL)

Test rendering, props, user interactions (for client components).

E2E (Playwright/Cypress)

Happy paths + critical flows.

Auth, navigation, error states, and responsive checks.

Test naming
functionName_condition_expectedResult()
Example: loginUser_withValidCredentials_returnsSuccess()

15) Scalability & Maintainability

Code as if it will serve millions of users.

Strict separation of concerns (UI vs data vs state).

Immutable models; treat server responses as read-only objects.

Always handle loading, error, and empty states.

Prefer streaming for long server work; show skeletons early.

Keep Client boundaries small to reduce bundle size.

16) Security & Privacy

No secrets in client code. Access secrets only in server modules/actions/route handlers.

Use HTTP-only cookies for session tokens; avoid localStorage for sensitive data.

Implement CSRF where relevant (forms not using Server Actions).

Add security headers (CSP, Frame-Options, etc.) via next.config.js or middleware.

Validate and sanitize all inputs (Zod at edges).

Avoid exposing internal errors; map to safe messages.

17) Performance

Use next/image for optimized images; set width/height/sizes.

Use next/font for local/Google fonts; avoid FOUT/FOIT.

Code-split client components with next/dynamic as needed.

Prefer static or ISR (revalidate) where possible; use dynamic only when required.

Use prefetch on <Link> (default) and avoid over-fetching.

Keep client bundles small: reduce "use client" surfaces, remove unused deps.

Measure: Lighthouse, Web Vitals (instrumentation), and bundle analyzer.

18) Environment & Config

Define and validate env in src/config/env.mjs with Zod.

Do not read env variables in client components.

Set compiler, images, headers, and rewrites in next.config.js as needed.

Use instrumentation.ts for analytics/metrics initialization on the server.

Configure middleware.ts for auth gating, internationalization, or header policies.

Example env validation

// src/config/env.mjs
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  API_BASE_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
});

export const env = EnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  API_BASE_URL: process.env.API_BASE_URL,
  DATABASE_URL: process.env.DATABASE_URL,
});

19) Avoid Anti-Patterns

❌ Don’t put API/DB calls in client components.
✅ Do them in Server Components, Server Actions, or Route Handlers.

❌ Don’t use any in TypeScript.
✅ Use proper types/interfaces and Zod schemas.

❌ Don’t create “God Components.”
✅ Split into small, focused components and hooks.

❌ Don’t hardcode user-visible strings.
✅ Use i18n or constants modules.

❌ Don’t duplicate code.
✅ Extract helpers/hooks/services.

❌ Don’t fetch internal APIs from server code.
✅ Call the underlying service logic directly.

❌ Don’t expand "use client" to entire route trees without reason.
✅ Keep client boundaries minimal.

20) Examples

A) Server page with cached fetch (ISR)

// src/app/(dashboard)/users/page.tsx
import { listUsers } from "@/services/users.service";

export const revalidate = 3600; // ISR: revalidate every hour

export default async function UsersPage() {
  const users = await listUsers(); // server fetch
  if (users.length === 0) return <p>No users yet.</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Users</h1>
      <ul className="divide-y">
        {users.map(u => (
          <li key={u.id} className="py-2">
            {u.name} — {u.email}
          </li>
        ))}
      </ul>
    </div>
  );
}


B) Service (server-only) with tag-based caching

// src/services/users.service.ts
import "server-only";
import { z } from "zod";
import { cache } from "react";
import { env } from "@/config/env.mjs";

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});
const UsersSchema = z.array(UserSchema);

export const listUsers = cache(async () => {
  const res = await fetch(`${env.API_BASE_URL}/users`, {
    next: { tags: ["users"] },
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  const data = await res.json();
  return UsersSchema.parse(data);
});

export async function createUser(input: z.infer<typeof UserSchema>) {
  const res = await fetch(`${env.API_BASE_URL}/users`, {
    method: "POST",
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to create user");
  return UserSchema.parse(await res.json());
}


C) Client component using a Server Action

// src/components/ui/CreateUserForm.tsx
"use client";

import { useFormStatus } from "react-dom";
import { createUserAction } from "@/actions/user.actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn">
      {pending ? "Creating..." : "Create user"}
    </button>
  );
}

export default function CreateUserForm() {
  return (
    <form action={createUserAction} className="space-y-2">
      <input name="name" placeholder="Name" className="input" required />
      <input name="email" type="email" placeholder="Email" className="input" required />
      <SubmitButton />
    </form>
  );
}

21) Testing Examples

Jest config hint
Use next/jest to create a Jest config with SWC transforms. Place tests next to code or under tests/.

RTL sample

import { render, screen } from "@testing-library/react";
import Button from "@/components/ui/Button";

it("Button_onClick_callsHandler", () => {
  const onClick = jest.fn();
  render(<Button onClick={onClick}>Click</Button>);
  screen.getByRole("button", { name: /click/i }).click();
  expect(onClick).toHaveBeenCalled();
});


Playwright E2E example

import { test, expect } from "@playwright/test";

test("home_shows_header", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /welcome/i })).toBeVisible();
});

22) Copilot Hints

Use Server Components by default; add "use client" only when needed.

Suggest Server Actions for simple form mutations with Zod validation.

Prefer fetch in server/services with typed schemas and caching (revalidate, tags).

Use React Query only inside client components that need live data.

Propose small, typed UI components with Tailwind classes.

Split large components into smaller components and hooks.

Generate Zod schemas alongside TypeScript types for models and inputs.

Checklist (TL;DR)

 RSC-first; "use client" only when necessary

 Data reads on server; writes via Server Actions/Route Handlers

 Services centralize API/DB, with Zod validation

 Tagged caching and revalidate after mutations

 Tailwind for styling; no inline styles

 Tests: Jest/RTL + Playwright

 Handle loading/error/empty states

 No secrets in client; validate env with Zod

 Keep components small; avoid duplication and “God components”