/**
 * One-off script: injects detailMd values into data/seed-nextjs.json
 * for the 19 questions that don't have one yet (id 11 was filled manually).
 *
 * Run once:  pnpm tsx scripts/add-detail-md-nextjs.ts
 * Then:      pnpm seed
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DETAILS: Record<number, string> = {
  1: `## What Next.js is

A React framework built by Vercel that adds the pieces React itself leaves out — routing, data fetching, rendering strategies, image and font optimisation, and a production build pipeline. You get an opinionated, batteries-included setup so you can build a real app instead of assembling a stack.

## The problems it solves

A plain React SPA hits a familiar wall as soon as it grows up:

- **SEO** — empty HTML shell, content loaded by JS. Crawlers see nothing.
- **Slow first paint** — user waits for the bundle, then for data, then for hydration.
- **Routing** — bring-your-own (React Router, TanStack Router, etc.).
- **Code splitting** — manual or framework-imposed.
- **Data fetching** — invent your own pattern, lift state, hope for the best.

Next.js solves each of these with sensible defaults:

\`\`\`tsx
// app/products/[id]/page.tsx
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await fetch(\`https://api.example.com/products/\${id}\`)
    .then((r) => r.json());

  return (
    <article>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </article>
  );
}
\`\`\`

That single file gives you a route at \`/products/[id]\`, server-side data fetching with built-in caching, automatic code splitting, and HTML that ships rendered. None of which you wrote setup for.

## What you get out of the box

- File-based routing
- React Server Components
- Multiple rendering modes (SSG / SSR / ISR / streaming)
- \`next/image\` for image optimisation
- \`next/font\` for self-hosted fonts with zero layout shift
- Built-in caching layers (Data Cache, Full Route Cache, Router Cache)
- API endpoints via Route Handlers
- Middleware for edge logic
- First-class TypeScript

## When not to reach for it

Static marketing sites with very little dynamic content can ship faster as a plain HTML setup or with Astro. A Storybook-only design system doesn't need a framework. For everything else — apps, dashboards, e-commerce, content-driven sites — Next is the default for a reason.`,

  2: `## The three classic modes

### CSR — Client-Side Rendering

The server sends an empty HTML shell. The browser downloads JS, executes it, fetches data, renders the UI.

\`\`\`html
<!-- What the server sends -->
<div id="root"></div>
<script src="/bundle.js"></script>
\`\`\`

- ✅ Cheap to deploy (any static host)
- ❌ Bad SEO — crawler sees nothing
- ❌ Slow first contentful paint
- ❌ Bigger JS bundle

This is what \`create-react-app\` shipped. Fine for an internal dashboard, painful for a public website.

### SSG — Static Site Generation

Pages are pre-rendered to HTML *at build time*. The CDN serves the static files.

\`\`\`tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function Post({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  return <article>{post.body}</article>;
}
\`\`\`

- ✅ Fastest possible response — already an HTML file
- ✅ Cheap to host (any CDN)
- ✅ Great SEO
- ❌ Content frozen until next build
- ❌ Build time scales with page count

### SSR — Server-Side Rendering

Pages are rendered *on every request*.

\`\`\`tsx
// app/dashboard/page.tsx
export const dynamic = "force-dynamic"; // opt out of caching

export default async function Dashboard() {
  const user = await getCurrentUser();
  return <DashboardView user={user} />;
}
\`\`\`

- ✅ Always fresh
- ✅ Per-user content possible (cookies, headers)
- ❌ Slower than SSG (server has to do work each request)
- ❌ Needs a Node/Edge runtime

## The fourth mode — ISR

Sits between SSG and SSR: pre-rendered like SSG, but refreshed in the background after a TTL or on-demand. See the ISR question for the deep dive.

## The App Router shift

In App Router the choice isn't *per page* anymore — it's *per component*. A page can have a static Server Component shell with an interactive Client Component island and a dynamic Server Component data section, each fetched and cached differently. The mental model becomes "where does this need to run, and how fresh does it need to be?" — answered locally rather than globally.`,

  3: `## What it is

The App Router is the routing system introduced in Next.js 13 and stabilised in 14. It lives in the \`app/\` directory and replaces the older \`pages/\` router. The headline shifts:

- Built on React Server Components by default
- Nested layouts that persist across navigation
- Streaming with Suspense
- Parallel and intercepting routes
- Async Server Components that fetch with native \`fetch\`

## File conventions

\`\`\`
app/
├── layout.tsx        ← wraps the whole app (must exist)
├── page.tsx          ← UI for /
├── loading.tsx       ← Suspense fallback for /
├── error.tsx         ← error boundary for /
├── not-found.tsx     ← 404 for /
├── dashboard/
│   ├── layout.tsx    ← wraps /dashboard/*
│   ├── page.tsx      ← UI for /dashboard
│   └── settings/
│       └── page.tsx  ← UI for /dashboard/settings
├── api/
│   └── webhook/
│       └── route.ts  ← API endpoint at /api/webhook
└── (marketing)/      ← route group, no URL effect
    ├── about/
    │   └── page.tsx
    └── pricing/
        └── page.tsx
\`\`\`

Each filename is meaningful. \`page.tsx\` makes a route public; \`route.ts\` makes an API endpoint; \`layout.tsx\` wraps a subtree. Dynamic segments use \`[slug]\`, catch-all uses \`[...slug]\`, optional catch-all uses \`[[...slug]]\`, route groups use \`(name)\`.

## Server-first

Components are Server Components by default. That means:

- They render on the server, never ship JS to the browser
- They can be async, await data directly
- They can read from the database, the filesystem, environment variables

\`\`\`tsx
// Server Component — runs on the server
export default async function Page() {
  const products = await db.product.findMany();
  return <ProductList products={products} />;
}
\`\`\`

Need state, effects, browser APIs, or event handlers? Mark the file \`"use client"\` and you get a Client Component. The boundary is one-way — server can render client, not the other way.

## Why it was worth the migration

Three big wins on the Butlin's migration:

1. **Less client JS** — moving the booking summary to a Server Component cut the bundle on that route.
2. **Persistent layouts** — the global header stopped re-rendering on navigation between sibling routes.
3. **Streaming with Suspense** — slow data sections wrapped in \`<Suspense>\` could load independently while fast sections rendered immediately.

## Mental shift from Pages

| Pages Router | App Router |
| --- | --- |
| getStaticProps / getServerSideProps | async Server Component with \`fetch\` |
| \`_app.tsx\` + \`_document.tsx\` | \`layout.tsx\` |
| Single layout for the whole app | Nested layouts per segment |
| API routes in \`pages/api\` | Route Handlers (\`route.ts\`) |
| File-system routing | File-system routing + special files |

Same conceptual primitive — your folder structure is your route table — with richer per-segment control.`,

  4: `## What layout.tsx does

A \`layout.tsx\` file defines UI that's shared across a route segment and all its children. It receives a \`children\` prop and wraps the page (or nested layouts).

\`\`\`tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[240px_1fr]">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
\`\`\`

Every route under \`/dashboard/*\` now gets the sidebar without each page wiring it up.

## The big property — layouts persist across navigation

Anything inside a layout doesn't remount when the user navigates between sibling routes in the same segment. State, scroll position, embedded media, animations — all preserved:

\`\`\`
app/dashboard/
├── layout.tsx        ← has a <video> playing in the corner
├── page.tsx          ← /dashboard
├── analytics/
│   └── page.tsx      ← /dashboard/analytics
└── settings/
    └── page.tsx      ← /dashboard/settings
\`\`\`

Navigate from \`/dashboard/analytics\` to \`/dashboard/settings\` — the video keeps playing. The Sidebar doesn't re-render. Only the inner content area updates. That's a fundamental shift from Pages Router, where the whole tree was rebuilt on every navigation.

## Nested layouts

Layouts compose. A nested layout wraps a deeper segment:

\`\`\`tsx
// app/dashboard/settings/layout.tsx — nested under dashboard layout
export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <SettingsNav />
      <div className="p-6">{children}</div>
    </div>
  );
}
\`\`\`

User on \`/dashboard/settings/billing\` sees:

\`\`\`
<RootLayout>
  <DashboardLayout>
    <SettingsLayout>
      <BillingPage />
    </SettingsLayout>
  </DashboardLayout>
</RootLayout>
\`\`\`

Each layer can hold its own state and won't re-render when sibling routes change.

## The root layout

There must be a root \`app/layout.tsx\` exporting an \`<html>\` and \`<body>\` tag — it's the entry point:

\`\`\`tsx
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
\`\`\`

This is where you mount providers, fonts (\`next/font\`), and the analytics script.

## Server Component by default

Layouts are Server Components unless you mark them \`"use client"\`. So you can fetch shared data inside one and pass it down without prop-drilling through every page:

\`\`\`tsx
export default async function OrgLayout({ children }: { children: React.ReactNode }) {
  const org = await getCurrentOrganisation();
  return (
    <OrgProvider value={org}>
      {children}
    </OrgProvider>
  );
}
\`\`\`

That's a powerful primitive — pre-fetched data at the layout level, available to every nested page without re-fetching.`,

  5: `## The basic rule

Folder structure inside \`app/\` (or \`pages/\`) maps directly to the URL structure. Each route is a folder; the route's UI lives in a special filename inside it.

\`\`\`
app/
├── page.tsx              → /
├── about/
│   └── page.tsx          → /about
├── blog/
│   ├── page.tsx          → /blog
│   └── [slug]/
│       └── page.tsx      → /blog/:slug
└── docs/
    └── [...slug]/
        └── page.tsx      → /docs/* (catch-all)
\`\`\`

No route configuration file. No \`<Switch>\` or \`<Routes>\` JSX. The directory is the table.

## Special filenames inside a route folder

Each one has a defined role:

\`\`\`
app/dashboard/
├── page.tsx       ← the route's UI (required to be reachable)
├── layout.tsx     ← wraps page and children with shared UI
├── loading.tsx    ← Suspense fallback shown while page loads
├── error.tsx      ← error boundary for this segment
├── not-found.tsx  ← rendered when notFound() is called
├── template.tsx   ← like layout but recreates state on navigation
└── route.ts       ← HTTP handler if this is an API endpoint instead of a page
\`\`\`

Mix and match. A folder can have a \`page\` and a \`loading\`. A folder can have *only* a \`layout\` (it wraps children but isn't itself a route).

## Dynamic segments

Square brackets in the folder name capture a value:

\`\`\`
app/products/[id]/page.tsx              → /products/:id
app/posts/[...slug]/page.tsx            → /posts/* (matches /posts/a/b/c)
app/shop/[[...slug]]/page.tsx           → /shop and /shop/* (optional catch-all)
\`\`\`

The matched value arrives as the \`params\` prop:

\`\`\`tsx
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // App Router 15+: params is a Promise
  return <h1>Product {id}</h1>;
}
\`\`\`

## Route groups

A folder name in parens like \`(marketing)\` lets you organise files without adding to the URL:

\`\`\`
app/
├── (marketing)/        ← group folder, no URL effect
│   ├── about/page.tsx  → /about
│   └── pricing/page.tsx → /pricing
└── (app)/
    ├── layout.tsx      ← different layout for the app section
    └── dashboard/page.tsx → /dashboard
\`\`\`

Two completely different layouts (marketing site vs logged-in app) sharing the same root, organised by intent.

## Private folders

Folders prefixed with underscore (\`_components\`) are ignored by routing — perfect for colocating components used only by a specific route without polluting the URL space:

\`\`\`
app/dashboard/
├── page.tsx
└── _components/
    ├── chart.tsx
    └── stats.tsx
\`\`\`

\`/dashboard\` is reachable; \`/dashboard/_components\` is not.

## Why it wins

You can guess a route's URL by looking at the folder, and you can find the file for any URL by following the folder structure. The cognitive load of "which page file owns this URL" effectively disappears.`,

  6: `## Two routers, same app

Next.js supports both \`pages/\` (the original) and \`app/\` (introduced in 13, stabilised in 14). You can run them side by side in the same project — they coexist. The app/ router takes precedence when a route matches both.

## pages/ — the original

\`\`\`
pages/
├── _app.tsx              ← global wrapper
├── _document.tsx         ← custom <html> / <body>
├── index.tsx             → /
├── about.tsx             → /about
├── blog/
│   ├── index.tsx         → /blog
│   └── [slug].tsx        → /blog/:slug
└── api/
    └── users.ts          → /api/users
\`\`\`

Each file is a page. Data is fetched at the page level with named functions:

\`\`\`tsx
// pages/blog/[slug].tsx
export async function getStaticProps({ params }) {
  const post = await getPost(params.slug);
  return { props: { post } };
}

export async function getStaticPaths() {
  const slugs = await getAllSlugs();
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  };
}

export default function PostPage({ post }) {
  return <article>{post.body}</article>;
}
\`\`\`

Three named functions, special meanings: \`getStaticProps\` (build-time data), \`getServerSideProps\` (request-time data), \`getStaticPaths\` (which dynamic routes to pre-render).

## app/ — the new model

\`\`\`
app/
├── layout.tsx            ← global wrapper
├── page.tsx              → /
├── blog/
│   ├── page.tsx          → /blog
│   └── [slug]/
│       └── page.tsx      → /blog/:slug
└── api/
    └── users/
        └── route.ts      → /api/users
\`\`\`

No \`_app\` or \`_document\` — layouts replace both. No named data-fetching functions — Server Components fetch directly:

\`\`\`tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug); // direct fetch in a Server Component
  return <article>{post.body}</article>;
}
\`\`\`

Same end result, half the moving parts.

## The differences that matter

| | pages/ | app/ |
| --- | --- | --- |
| Default render | Client (CSR + SSR/SSG) | Server Component |
| Data fetching | Named functions | Async components |
| Layouts | Single \`_app.tsx\` | Nested \`layout.tsx\` per segment |
| Loading states | Manual | \`loading.tsx\` + Suspense |
| Error handling | \`_error.tsx\` | \`error.tsx\` per segment |
| API endpoints | \`pages/api/*.ts\` | \`route.ts\` files |
| Streaming | No | Yes |
| Parallel/intercepting routes | No | Yes |

## Migration in practice

On the Butlin's migration we ran both for a few months. The pain point was layout duplication — the shared header had to live in both \`_app\` and the new root \`layout.tsx\` until the final pages route was gone. Once the last route was ported, the duplicate disappeared and the App Router benefits (nested layouts, streaming, less client JS) all kicked in.

## Should you start in app/?

For new projects, yes — \`app/\` is the supported path forward and where new features land. Pages/ is in maintenance mode. The exception is if you're depending on a specific Pages-only library that hasn't been ported yet.`,

  7: `## The two component types

### Server Component

Renders on the server. Its JavaScript never ships to the browser. Can be async. Can read from databases, filesystems, environment variables, anything server-only.

\`\`\`tsx
// Server Component — no "use client" directive
import { db } from "@/lib/db";

export default async function ProductList() {
  const products = await db.product.findMany();
  return (
    <ul>
      {products.map((p) => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}
\`\`\`

What the browser receives is just the rendered HTML / RSC payload — no \`ProductList\` function, no \`db\` import, none of the loop logic.

### Client Component

Renders in the browser. Marked with the \`"use client"\` directive at the top of the file. Where \`useState\`, \`useEffect\`, event handlers, refs, and browser-only APIs live.

\`\`\`tsx
// Client Component
"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount((c) => c + 1)}>
      Count: {count}
    </button>
  );
}
\`\`\`

## Default is server

Every component in \`app/\` is a Server Component unless its file (or an ancestor file via import) has \`"use client"\`. You opt into client behaviour — opposite of the old default in Pages Router.

## The boundary is one-way

A Server Component can render a Client Component:

\`\`\`tsx
// Server Component
import { Counter } from "./counter"; // Client Component

export default function Page() {
  return (
    <div>
      <h1>Welcome</h1>
      <Counter />
    </div>
  );
}
\`\`\`

But a Client Component can't import a Server Component (because the browser can't execute server logic). The pattern is to pass Server Component-rendered content as \`children\`:

\`\`\`tsx
// Client Component
"use client";

export function Tabs({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(0);
  return (
    <>
      <button onClick={() => setActive(0)}>Tab 1</button>
      {children}
    </>
  );
}

// Server Component using it
<Tabs>
  <ServerRenderedContent />
</Tabs>
\`\`\`

\`children\` is just a slot — the inner content can be a Server Component because the Client Component never has to render it from scratch, it just places it.

## What you save by going server-heavy

Every component you keep on the server is JS that doesn't ship to the browser. Less to download, less to parse, less to hydrate. On the Butlin's booking flow, keeping the summary as a Server Component (only the inputs were \`"use client"\`) cut the route's JS bundle significantly without changing the perceived UX.

## When to go client

- Needs interaction (clicks, keystrokes, hover, drag)
- Uses \`useState\`, \`useEffect\`, \`useRef\`, \`useContext\`
- Touches \`window\`, \`document\`, \`localStorage\`
- Uses a library that does any of the above

Push \`"use client"\` as deep into the tree as possible. A page can be a Server Component with a tiny Client Component island for one button — that's the ideal pattern, not the whole page going client.`,

  8: `## What the directive does

\`"use client"\` at the top of a file marks it as a Client Component. The component (and everything it imports that isn't itself a Server Component) runs in the browser. \`useState\`, \`useEffect\`, event handlers, refs, and browser-only APIs become available.

\`\`\`tsx
"use client";

import { useState } from "react";

export function Toggle() {
  const [on, setOn] = useState(false);
  return (
    <button onClick={() => setOn((v) => !v)}>
      {on ? "On" : "Off"}
    </button>
  );
}
\`\`\`

## When you need it

You need \`"use client"\` whenever the component:

- Uses any React hook (\`useState\`, \`useEffect\`, \`useRef\`, \`useContext\`)
- Attaches event handlers (\`onClick\`, \`onChange\`, etc.)
- Reads \`window\`, \`document\`, \`localStorage\`, \`sessionStorage\`
- Uses a class component
- Imports a library that does any of the above (most UI libraries — Framer Motion, Headless UI, etc.)

If the file does none of those, leave it as a Server Component. Default to server.

## The "push it down" rule

The boundary is transitive — everything imported from a Client Component file is treated as client. So this is bad:

\`\`\`tsx
// app/page.tsx
"use client"; // ❌ pulls the whole page client-side

export default function Page() {
  return (
    <>
      <HugeStaticContent />   {/* now client */}
      <AlsoStatic />          {/* now client */}
      <TinyInteractiveBit />  {/* needed to be client anyway */}
    </>
  );
}
\`\`\`

This is much better — push the directive down to only the file that needs it:

\`\`\`tsx
// app/page.tsx — stays Server Component
import { TinyInteractiveBit } from "./tiny-interactive-bit";

export default function Page() {
  return (
    <>
      <HugeStaticContent />
      <AlsoStatic />
      <TinyInteractiveBit />  {/* only this is client */}
    </>
  );
}

// tiny-interactive-bit.tsx
"use client";

export function TinyInteractiveBit() { /* … */ }
\`\`\`

Same UX, fraction of the JS bundle.

## Hybrid patterns

### Server-rendered children inside a Client Component

A Client Component can take Server-rendered content via \`children\`:

\`\`\`tsx
// app/dashboard/page.tsx — Server Component
import { Tabs } from "./tabs"; // Client Component

export default function Dashboard() {
  return (
    <Tabs>
      <AnalyticsPanel />   {/* Server Component */}
      <SettingsPanel />    {/* Server Component */}
    </Tabs>
  );
}
\`\`\`

Tabs has the state (active index, click handlers); panels stay on the server.

### Reusable component used from both sides

If a component is used by both Server and Client trees, mark it Client — it'll still work everywhere, just won't get the Server Component bundle savings:

\`\`\`tsx
// components/icon.tsx
"use client";
export function Icon({ name }: { name: string }) {
  return <svg>{/* … */}</svg>;
}
\`\`\`

Actually for an icon with no state or events, leave it as a Server Component — it'll render server-side when used from a Server tree, and inline into a Client tree fine. Only add \`"use client"\` if the component itself needs browser behaviour.

## Common mistake — async client components

\`\`\`tsx
"use client";

// ❌ Server Components can be async, Client Components cannot (yet).
export default async function Page() { /* … */ }
\`\`\`

Async function components are a Server Component feature. In a Client Component, use \`useEffect\` + state, or the new \`use()\` hook on a promise, or move the data fetch to a parent Server Component.`,

  9: `## The bracket convention

Square brackets in a folder name make a route segment dynamic:

\`\`\`
app/products/[id]/page.tsx       → /products/:id (matches /products/abc)
app/blog/[slug]/page.tsx         → /blog/:slug
app/users/[userId]/posts/[postId]/page.tsx → /users/:userId/posts/:postId
\`\`\`

The captured value comes in via the \`params\` prop (a Promise in App Router 15+):

\`\`\`tsx
// app/products/[id]/page.tsx
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await fetch(\`/api/products/\${id}\`).then((r) => r.json());
  return <ProductView product={product} />;
}
\`\`\`

## Catch-all and optional catch-all

\`[...slug]\` matches one or more segments:

\`\`\`
app/docs/[...slug]/page.tsx
  /docs/a            → slug = ["a"]
  /docs/a/b          → slug = ["a", "b"]
  /docs/a/b/c/d      → slug = ["a", "b", "c", "d"]
  /docs              → does NOT match (needs at least one segment)
\`\`\`

\`[[...slug]]\` (double brackets) matches zero or more — the parent path included:

\`\`\`
app/shop/[[...slug]]/page.tsx
  /shop              → slug = undefined
  /shop/category     → slug = ["category"]
  /shop/category/sub → slug = ["category", "sub"]
\`\`\`

Useful for marketing sites where \`/shop\` and \`/shop/men\` should hit the same handler with different params.

## Pre-rendering with generateStaticParams

For routes you want statically generated at build time, return the list of valid param objects:

\`\`\`tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await db.post.findMany({ select: { slug: true } });
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await db.post.findUnique({ where: { slug } });
  if (!post) notFound();
  return <article>{post.body}</article>;
}
\`\`\`

Build time, Next pre-renders one page per slug. Runtime, the static HTML is served from the CDN. New posts after build trigger ISR or 404 (configurable via \`dynamicParams\`).

## Handling missing data

For a dynamic route where the param may not match anything, call \`notFound()\` to render the nearest \`not-found.tsx\`:

\`\`\`tsx
import { notFound } from "next/navigation";

export default async function Page({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound(); // throws → caught by error boundary
  return <ProductView product={product} />;
}
\`\`\`

Cleaner than returning \`null\` or a custom 404 component — Next handles status code, metadata, and rendering for you.

## Validating params

Params are always strings. If you expect a number, validate:

\`\`\`tsx
export default async function Page({ params }: Props) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();
  const product = await getProduct(numericId);
  // …
}
\`\`\`

Or use Zod for richer validation. The compiler can't help you here — params come from the URL bar.`,

  10: `## What next/image does

\`next/image\` is the built-in image component. It gives you, for free:

- Lazy loading (images below the fold load when scrolled into view)
- Responsive \`srcset\` (modern browsers download the right size)
- Modern formats (WebP, AVIF served when supported)
- Reserved space (no layout shift)
- An Image Optimisation API that crops, resizes, and re-encodes on demand

\`\`\`tsx
import Image from "next/image";

<Image
  src="/hero.jpg"
  width={1200}
  height={600}
  alt="A wide hero image"
/>
\`\`\`

The browser receives an optimised WebP at the right size for the device, lazy-loaded, with reserved space matching the aspect ratio.

## The required props

- \`src\` — local (in \`/public\`) or remote (allowed in \`next.config.js\`)
- \`width\` and \`height\` — used to reserve space (prevents layout shift)
- \`alt\` — required, accessibility

For local imports, \`width\` and \`height\` are inferred from the imported asset:

\`\`\`tsx
import hero from "@/public/hero.jpg";

<Image src={hero} alt="Hero" /> // dimensions baked in at import time
\`\`\`

## The above-the-fold trick

Below-the-fold images lazy-load by default. Above-the-fold (LCP candidate) images should opt out — pass \`priority\`:

\`\`\`tsx
<Image
  src="/hero.jpg"
  width={1200}
  height={600}
  alt="Hero"
  priority   // preload, don't lazy-load
/>
\`\`\`

This was probably the single largest contributor to the Butlin's 4.8s → 2.5s LCP improvement. Marking the hero \`priority\` and migrating every \`<img>\` to \`<Image>\` did the lifting.

## Responsive images

The \`sizes\` prop tells the browser how big the image will render at different viewport widths, so it can pick the right \`srcset\` candidate:

\`\`\`tsx
<Image
  src="/product.jpg"
  width={800}
  height={800}
  alt="Product"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
/>
\`\`\`

Mobile gets the full-width version, desktop a quarter-width. Without \`sizes\`, the browser downloads the largest candidate.

## fill mode for unknown dimensions

If you can't know the dimensions upfront (CMS-driven content sized by container), use \`fill\` and let the parent control the size:

\`\`\`tsx
<div className="relative aspect-video w-full">
  <Image
    src={cmsImage.url}
    alt={cmsImage.alt}
    fill
    style={{ objectFit: "cover" }}
    sizes="100vw"
  />
</div>
\`\`\`

The parent must have a \`position\` set (relative, absolute, fixed). \`<Image fill>\` absolutely positions itself to fill it.

## Remote images

External URLs need an allowlist in \`next.config.js\`:

\`\`\`js
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.example.com" },
    ],
  },
};
\`\`\`

This prevents attackers from using your origin's bandwidth to optimise arbitrary remote images.

## Why bother

A typical image-heavy marketing page can drop hundreds of KB just by swapping \`<img>\` for \`<Image>\` — better format, right size for the device, lazy loading. Combined with \`priority\` on the LCP candidate, this is the highest-leverage Core Web Vitals optimisation in any image-heavy Next.js codebase.`,

  12: `## Pages Router — named functions

Three named exports control what data the page gets and when it's fetched:

\`\`\`tsx
// pages/blog/[slug].tsx

// Runs at build time. Result is the page's props.
export async function getStaticProps({ params }) {
  const post = await getPost(params.slug);
  return { props: { post }, revalidate: 60 }; // ISR
}

// Tells Next which slugs to pre-render at build.
export async function getStaticPaths() {
  return {
    paths: await getAllSlugs(),
    fallback: false,
  };
}

// Default export receives the props.
export default function PostPage({ post }) {
  return <article>{post.body}</article>;
}
\`\`\`

Or for SSR — runs on every request:

\`\`\`tsx
export async function getServerSideProps(context) {
  const session = await getSession(context.req);
  if (!session) return { redirect: { destination: "/login", permanent: false } };
  return { props: { session } };
}
\`\`\`

Three patterns, three named functions. Per-page. Page-level only.

## App Router — async Server Components

The named functions are gone. Server Components can be async — you just await your data right where you render it:

\`\`\`tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  return <article>{post.body}</article>;
}
\`\`\`

The render and the fetch live together. Caching and rendering mode are controlled by:

- The \`fetch\` call itself — \`fetch(url, { cache: "no-store" })\` or \`{ next: { revalidate: 60, tags: ["..."] } }\`
- Route segment exports — \`export const revalidate = 60\` or \`export const dynamic = "force-dynamic"\`

## Caching behaviour shifts

| Behaviour | Pages Router | App Router |
| --- | --- | --- |
| Static at build | getStaticProps without revalidate | Default for non-cookie/header-touching pages |
| Static with revalidation | getStaticProps + revalidate | export const revalidate, or fetch with { next: { revalidate } } |
| On-demand revalidation | revalidate() in API route | revalidatePath / revalidateTag in route handler |
| Server-rendered each request | getServerSideProps | dynamic = "force-dynamic", or reading cookies/headers |
| Per-user content | getServerSideProps | Reading cookies()/headers() in a Server Component |

App Router defaults to static unless you do something that requires dynamic — read cookies, headers, opt out via \`dynamic = "force-dynamic"\`. The model is "as static as possible unless proven otherwise".

## Fetching from multiple sources

In Pages Router, parallel fetches require coordination:

\`\`\`tsx
export async function getServerSideProps() {
  const [user, posts] = await Promise.all([getUser(), getPosts()]);
  return { props: { user, posts } };
}
\`\`\`

In App Router, just await them — but you can also push each into its own Server Component and let Suspense stream them in independently:

\`\`\`tsx
export default function Page() {
  return (
    <>
      <Suspense fallback={<UserSkeleton />}>
        <UserSection />
      </Suspense>
      <Suspense fallback={<PostsSkeleton />}>
        <PostsSection />
      </Suspense>
    </>
  );
}
\`\`\`

Fast section renders immediately, slow section streams in when ready. No coordinator. Just composition.

## Mental shift

Pages Router puts data fetching at the page boundary — one place per route, named functions. App Router puts it next to the render — any Server Component can fetch, multiple components can fetch in the same page, each independently configured. The model is more flexible and easier to reason about once it clicks.`,

  13: `## What Route Handlers are

Route Handlers are the App Router replacement for \`pages/api/\` routes. A \`route.ts\` file inside \`app/\` exports HTTP method functions:

\`\`\`ts
// app/api/users/route.ts
export async function GET(request: Request) {
  const users = await db.user.findMany();
  return Response.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await db.user.create({ data: body });
  return Response.json(user, { status: 201 });
}
\`\`\`

The file lives at the URL its folder describes — \`app/api/users/route.ts\` serves \`/api/users\`. Each method (\`GET\`, \`POST\`, \`PUT\`, \`PATCH\`, \`DELETE\`, \`OPTIONS\`, \`HEAD\`) is a named export.

## Web standards, not Next-specific

The key difference from Pages API routes — they use the standard Web \`Request\` and \`Response\` objects, not the Next-specific \`req\` / \`res\`:

\`\`\`ts
// Pages: pages/api/hello.ts
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ message: "hello" });
}

// App: app/api/hello/route.ts
export function GET() {
  return Response.json({ message: "hello" });
}
\`\`\`

The App version is portable — the same handler runs in Vercel Edge, Cloudflare Workers, Deno, anywhere the Web Fetch API is supported.

## Dynamic segments

Same convention as pages — \`[slug]\` in the folder name:

\`\`\`ts
// app/api/users/[id]/route.ts
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await db.user.findUnique({ where: { id } });
  if (!user) return new Response("Not found", { status: 404 });
  return Response.json(user);
}
\`\`\`

## Caching

Like pages, Route Handlers default to dynamic if they touch cookies, headers, or read the \`request.url\` query. Static \`GET\` handlers are cached — opt out with:

\`\`\`ts
export const dynamic = "force-dynamic";
// or
export const revalidate = 60;
\`\`\`

## Streaming responses

You can return a streaming \`Response\` for long-running operations like AI streaming:

\`\`\`ts
export async function POST(request: Request) {
  const { prompt } = await request.json();
  const stream = await llm.streamCompletion(prompt);
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });
}
\`\`\`

## When to reach for Route Handlers vs Server Components

- **Server Component** — when the data only feeds a UI rendered by Next. Fetch directly in the page, skip the API entirely.
- **Route Handler** — when external consumers need it (mobile app, webhooks, third-party integrations) or when the response shape is data, not UI (file uploads, OAuth callbacks, REST/GraphQL endpoints).

Don't build an API route just to call it from a Server Component on the same page. That's a network hop you don't need.

## Common patterns

### Webhook receiver

\`\`\`ts
// app/api/webhooks/stripe/route.ts
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();
  const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_SECRET);
  await handleEvent(event);
  return new Response(null, { status: 200 });
}
\`\`\`

### File upload

\`\`\`ts
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  await uploadToS3(file);
  return Response.json({ ok: true });
}
\`\`\`

### CORS

\`\`\`ts
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export function OPTIONS() {
  return new Response(null, { headers: cors });
}

export async function GET() {
  const data = await getData();
  return Response.json(data, { headers: cors });
}
\`\`\`

Web standards everywhere. Once you internalise the Request / Response API, the framework gets out of your way.`,

  14: `## Four overlapping caches

Next.js maintains several caches with different lifetimes and busting strategies:

| Cache | Where | What it caches | Lifetime |
| --- | --- | --- | --- |
| Request Memoization | Server, per render | Identical fetches in a single render tree | One render |
| Data Cache | Server, persistent | fetch() responses | Until revalidated |
| Full Route Cache | Server, persistent | Rendered HTML / RSC payload | Until invalidated |
| Router Cache | Browser | Prefetched route segments | Per-session |

Each does a different job. Together they're why a typical Next page barely touches the database.

## Request Memoization

Same URL fetched twice in a single render → only one network call:

\`\`\`tsx
// app/layout.tsx
async function Layout() {
  const user = await fetch("/api/user").then(r => r.json());
  // …
}

// app/page.tsx (rendered inside layout)
async function Page() {
  const user = await fetch("/api/user").then(r => r.json()); // dedup'd
  // …
}
\`\`\`

Both calls hit the network *once*. React's cache extension makes \`fetch\` deduplicating by default in Server Components.

## Data Cache

Persistent across requests. Default for \`fetch()\` in Server Components:

\`\`\`tsx
// Cached forever (until revalidated)
fetch("https://api.example.com/products");

// Cached for 60s, then revalidated on the next request
fetch("https://api.example.com/products", { next: { revalidate: 60 } });

// Not cached — runs every request
fetch("https://api.example.com/products", { cache: "no-store" });

// Cached with tags — invalidate by tag from anywhere
fetch("https://api.example.com/products", { next: { tags: ["products"] } });
\`\`\`

## Full Route Cache

The rendered output of a page. If the page is fully static (no cookies, no headers, no dynamic fetches), Next caches the rendered HTML / RSC and serves it directly. Massive throughput improvement — no React render on each request.

Opt out by reading dynamic sources:

\`\`\`tsx
import { cookies, headers } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();  // → page becomes dynamic
  // …
}
\`\`\`

Or explicitly:

\`\`\`tsx
export const dynamic = "force-dynamic";
\`\`\`

## On-demand invalidation

Two flavours:

### revalidatePath — invalidate by URL

\`\`\`ts
import { revalidatePath } from "next/cache";

revalidatePath("/products");           // single route
revalidatePath("/products/[id]");      // dynamic route template
revalidatePath("/", "layout");         // root and everything below
\`\`\`

### revalidateTag — invalidate by tag

\`\`\`ts
import { revalidateTag } from "next/cache";

revalidateTag("products");
\`\`\`

This invalidates the Data Cache for every fetch tagged \`"products"\`, regardless of which page made the fetch. The pattern I used on Butlin's:

\`\`\`tsx
// In a Server Component
const hotel = await fetch(\`/api/hotels/\${id}\`, {
  next: { tags: [\`hotel:\${id}\`] },
}).then(r => r.json());

// In a webhook from the booking system
revalidateTag(\`hotel:\${hotelId}\`);
\`\`\`

A single revalidateTag call invalidates every page (search results, product page, recommendation widgets) that fetched that hotel. No tracking which routes to flush by hand.

## Router Cache (browser)

The browser keeps the React Server Component payload for visited routes, so navigating back is instant. Cleared on full page refresh, or explicitly via \`router.refresh()\`.

## A working mental model

1. **Cache by default** — Next is aggressive about caching, especially fetch and Full Route.
2. **Invalidate on writes** — when the underlying data changes (CMS publish, form submit, webhook), call revalidatePath / revalidateTag.
3. **Opt out for per-user content** — \`dynamic = "force-dynamic"\`, or read cookies/headers.
4. **Tag your fetches** — even if you don't need invalidation yet. Easier to add later than to refactor every fetch.

The cache layers feel complex on day one. Once you've used revalidateTag in anger, the model snaps into place.`,

  15: `## Same job, different routers

Both tell Next.js which dynamic routes to pre-render at build time. They're not interchangeable APIs — Pages Router uses one, App Router uses the other.

## getStaticPaths (Pages Router)

Lives next to \`getStaticProps\` in a dynamic page file. Returns an object describing the paths to pre-render and the fallback behaviour for unmatched paths.

\`\`\`tsx
// pages/blog/[slug].tsx
export async function getStaticPaths() {
  const posts = await getAllPosts();

  return {
    paths: posts.map((post) => ({
      params: { slug: post.slug },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const post = await getPost(params.slug);
  return { props: { post } };
}
\`\`\`

\`fallback\` controls what happens when a slug doesn't match any pre-rendered path:

- \`false\` — 404
- \`true\` — render on-demand, then cache (with a loading state on first hit)
- \`"blocking"\` — render on-demand, no loading state (request waits)

## generateStaticParams (App Router)

The App Router replacement. An async function that returns an array of params objects. No \`paths\` / \`params\` wrapping, no fallback option — fallback behaviour is controlled by a separate \`dynamicParams\` export.

\`\`\`tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export const dynamicParams = true; // default — render unknown slugs on-demand
// or dynamicParams = false to 404 instead

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return <article>{post.body}</article>;
}
\`\`\`

The data fetch happens in the Server Component, not in a separate \`getStaticProps\`.

## The deduplication win

If you have nested dynamic segments — say \`app/categories/[category]/products/[product]/page.tsx\` — both segments need their own \`generateStaticParams\`. App Router calls them in tree order and automatically dedupes the combinations:

\`\`\`tsx
// app/categories/[category]/generateStaticParams
export async function generateStaticParams() {
  return [{ category: "clothing" }, { category: "shoes" }];
}

// app/categories/[category]/products/[product]/page.tsx
export async function generateStaticParams({
  params,
}: {
  params: { category: string };
}) {
  const products = await getProducts(params.category);
  return products.map((p) => ({ product: p.slug }));
}
\`\`\`

Next runs the outer once, then the inner for each result, and pre-renders the cartesian product. Pages Router would need both \`getStaticPaths\` to coordinate, which it can't really do.

## Migrating between them

The transformation is mostly mechanical:

\`\`\`tsx
// Pages
export async function getStaticPaths() {
  const slugs = await getSlugs();
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  };
}

// App
export async function generateStaticParams() {
  const slugs = await getSlugs();
  return slugs.map((slug) => ({ slug }));
}

export const dynamicParams = false;
\`\`\`

The big behavioural change is that App Router renders Server Components, so the data fetching moves from \`getStaticProps\` into the component body. \`generateStaticParams\` is purely about *which routes* to pre-render — the *how* lives in the component.`,

  16: `## What middleware does

Middleware runs at the Edge *before* a request hits a route. It receives the incoming request, can inspect cookies, headers, geography, and URL, then decide what to do: continue, rewrite the URL, redirect, or return a custom response.

\`\`\`ts
// middleware.ts (or proxy.ts in Next 16+) at the project root
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Auth gate
  const token = request.cookies.get("session")?.value;
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/private/:path*"],
};
\`\`\`

## The matcher config

\`matcher\` controls which routes middleware runs on. Middleware runs on every matched request — keep it small. Three formats:

\`\`\`ts
// String
export const config = { matcher: "/dashboard/:path*" };

// Array
export const config = { matcher: ["/dashboard/:path*", "/profile/:path*"] };

// Object with conditions
export const config = {
  matcher: [
    {
      source: "/api/:path*",
      missing: [{ type: "header", key: "next-router-prefetch" }],
    },
  ],
};
\`\`\`

Excluding internal paths matters. Without a matcher, middleware runs on every request including \`_next/static\` assets — expensive and pointless.

## What it can do

### Redirect

\`\`\`ts
return NextResponse.redirect(new URL("/login", request.url));
\`\`\`

### Rewrite (URL stays the same, different content served)

\`\`\`ts
return NextResponse.rewrite(new URL("/au/products", request.url));
\`\`\`

### Set cookies

\`\`\`ts
const response = NextResponse.next();
response.cookies.set("locale", "tr-TR", { path: "/" });
return response;
\`\`\`

### Modify request headers

\`\`\`ts
const headers = new Headers(request.headers);
headers.set("x-user-id", userId);
return NextResponse.next({ request: { headers } });
\`\`\`

### Return a response directly

\`\`\`ts
if (rateLimited(request)) {
  return new NextResponse("Rate limit exceeded", { status: 429 });
}
\`\`\`

## Real-world patterns

### Auth gate

\`\`\`ts
export function middleware(request: NextRequest) {
  const session = request.cookies.get("session");
  if (!session && isProtected(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("returnTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
\`\`\`

### Locale negotiation

\`\`\`ts
export function middleware(request: NextRequest) {
  const locale = request.cookies.get("locale")?.value
    ?? request.headers.get("accept-language")?.split(",")[0]
    ?? "en";

  if (!request.nextUrl.pathname.startsWith(\`/\${locale}\`)) {
    return NextResponse.rewrite(
      new URL(\`/\${locale}\${request.nextUrl.pathname}\`, request.url),
    );
  }
  return NextResponse.next();
}
\`\`\`

### A/B test bucketing

\`\`\`ts
export function middleware(request: NextRequest) {
  let bucket = request.cookies.get("ab")?.value;
  if (!bucket) {
    bucket = Math.random() < 0.5 ? "A" : "B";
  }

  const response = NextResponse.rewrite(
    new URL(\`/home-\${bucket}\`, request.url),
  );
  response.cookies.set("ab", bucket);
  return response;
}
\`\`\`

## Constraints

- Runs in the Edge runtime — Node APIs unavailable (no fs, no crypto except the Web Crypto subset, no node modules)
- Can't render React or use Server Components
- Limited body size (~1MB) — can't process large uploads
- Cold-start friendly but has its own latency budget per request

Keep middleware decisive — make a quick routing decision and bail. Heavy work belongs in a Route Handler or a Server Component.

## Next 16 — proxy.ts

In Next 16, the file was renamed \`proxy.ts\` (same API, clearer name — middleware acts as a proxy in front of routes). Existing \`middleware.ts\` still works during the transition.`,

  17: `## What parallel routes do

Parallel routes let you render multiple independent pages in the same layout, each in its own slot, each with its own loading and error state. They render simultaneously and stream independently.

## The convention

A folder prefixed with \`@\` is a *slot*:

\`\`\`
app/dashboard/
├── layout.tsx
├── @analytics/
│   ├── page.tsx
│   └── loading.tsx
├── @team/
│   ├── page.tsx
│   └── loading.tsx
└── page.tsx          ← the default content slot ("children")
\`\`\`

The layout receives slots as named props alongside \`children\`:

\`\`\`tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <section>{children}</section>
      <aside>
        {analytics}
        {team}
      </aside>
    </div>
  );
}
\`\`\`

Each slot is rendered by Next as an independent subtree. They stream in independently — fast section appears first, slow section follows.

## Why this matters

### Independent loading states

\`\`\`tsx
// app/dashboard/@analytics/loading.tsx
export default function Loading() {
  return <AnalyticsSkeleton />;
}

// app/dashboard/@team/loading.tsx
export default function Loading() {
  return <TeamSkeleton />;
}
\`\`\`

Each slot has its own \`loading.tsx\`. Slow analytics fetch doesn't block the team panel from rendering.

### Independent error boundaries

\`\`\`tsx
// app/dashboard/@analytics/error.tsx
"use client";
export default function Error() {
  return <p>Couldn't load analytics</p>;
}
\`\`\`

Analytics crashing doesn't take down the whole dashboard.

### Different routes for the same layout slot

Each slot has its own URL navigation. \`/dashboard\` shows the default for each slot; \`/dashboard/team/edit\` could change just the team slot while analytics stays put:

\`\`\`
app/dashboard/
├── layout.tsx
├── @team/
│   ├── page.tsx       ← /dashboard
│   ├── default.tsx    ← shown when slot doesn't match the URL
│   └── edit/
│       └── page.tsx   ← /dashboard/edit shows this in the team slot
└── @analytics/
    └── default.tsx    ← stays the same when navigating to /dashboard/edit
\`\`\`

The default.tsx is mandatory for slots that won't match every URL — it's the fallback when the URL doesn't include a route for that slot.

## Pairs naturally with modals

The modal-over-feed pattern is the canonical use of parallel routes + intercepting routes:

\`\`\`
app/
├── feed/
│   ├── layout.tsx
│   ├── page.tsx                    ← /feed
│   ├── @modal/
│   │   ├── default.tsx             ← null when no modal
│   │   └── (.)photos/[id]/page.tsx ← intercepted, opens as modal
│   └── photos/[id]/
│       └── page.tsx                ← /feed/photos/123 (full page on direct visit)
\`\`\`

Click a photo from the feed: intercepted route opens it in the @modal slot over the feed. Visit \`/feed/photos/123\` directly: the full page renders. Same URL, different UI based on entry point.

## When to reach for it

- Dashboards where each panel has its own data and loading time
- Modal overlays without losing the underlying page context
- Sections that should refresh independently (e.g. live metrics vs static config)
- Anywhere you'd otherwise have one big Suspense boundary but want finer control

When you don't need any of those, just nest components. Parallel routes add a folder convention; the benefit has to justify the structural complexity.`,

  18: `## What intercepting routes do

Intercepting routes let one URL render different UI depending on how you got there. The classic example: clicking an image in a feed shows it in a modal over the feed, but visiting the same URL directly renders the full page.

## The convention

The intercept marker goes in the folder name in parentheses, describing how many levels up to look:

- \`(.)folder\` — same level
- \`(..)folder\` — one level up
- \`(..)(..)folder\` — two levels up
- \`(...)folder\` — from the root

\`\`\`
app/
├── feed/
│   ├── page.tsx
│   ├── @modal/
│   │   ├── default.tsx
│   │   └── (.)photos/[id]/
│   │       └── page.tsx     ← intercepts /feed/photos/[id] from within /feed
│   └── ...
└── photos/[id]/
    └── page.tsx              ← full page at /photos/[id] on direct visit
\`\`\`

When the user clicks a thumbnail link to \`/photos/123\` from inside \`/feed\`, the intercept catches it and renders the modal version. If the user pastes \`/photos/123\` into the URL bar, the full page renders.

## The full pattern — parallel + intercepting

Intercepting routes are paired with parallel routes to get the modal-over-feed UX:

\`\`\`tsx
// app/feed/layout.tsx
export default function FeedLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}

// app/feed/@modal/default.tsx — empty when no modal
export default function Default() {
  return null;
}

// app/feed/@modal/(.)photos/[id]/page.tsx — intercepted
import { Modal } from "@/components/modal";

export default async function PhotoModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const photo = await getPhoto(id);
  return (
    <Modal>
      <img src={photo.url} alt={photo.alt} />
    </Modal>
  );
}

// app/photos/[id]/page.tsx — full page
export default async function PhotoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const photo = await getPhoto(id);
  return <FullPhotoView photo={photo} />;
}
\`\`\`

User clicks a photo in the feed → URL becomes \`/photos/123\` → intercept catches it → modal renders over feed.

User refreshes or shares the link → no intercept context → full page renders.

## Why this is useful

The traditional way to do this is to:

- Keep the photo URL fake (\`#photo-123\` or a query param like \`?photo=123\`)
- Or build a separate state-managed modal layer
- Or render both layouts client-side and toggle them

Each loses something — bookmarking, link sharing, accessibility, or SEO. Intercepting routes give you real URLs that work in both contexts.

## Where it makes sense

- Photo / video previews from a feed
- Quick-edit dialogs (click row → modal opens at \`/users/123/edit\` → refresh = full page)
- Detail panels in a list/detail layout

## Where it gets confusing

The convention is genuinely weird looking — most engineers can't recall the dot syntax without a doc lookup. Use intercepting routes only when the UX benefit is clear. For a one-off modal, plain state in a Client Component is simpler and just as good.`,

  19: `## What we're optimising

Three metrics make up Core Web Vitals:

- **LCP (Largest Contentful Paint)** — time until the biggest visible element renders. Target: ≤ 2.5s.
- **CLS (Cumulative Layout Shift)** — how much the page jumps around as it loads. Target: ≤ 0.1.
- **INP (Interaction to Next Paint)** — responsiveness to user input. Target: ≤ 200ms.

Each has its own enemies. Optimising one without thinking about the others is how you end up with a fast LCP and a janky INP.

## LCP playbook

The LCP element is almost always an above-the-fold image, video, or large heading. The wins:

### next/image with priority

\`\`\`tsx
import Image from "next/image";

<Image
  src="/hero.jpg"
  width={1600}
  height={900}
  alt="Hero"
  priority   // preload, skip lazy-loading
  sizes="100vw"
/>
\`\`\`

This was the single biggest lever on the Butlin's 4.8s → 2.5s LCP improvement.

### next/font for zero FOIT

\`\`\`tsx
// app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
\`\`\`

Self-hosted by Next, no third-party round trip.

### Server Components for less JS

Move the LCP-adjacent component to a Server Component so the browser doesn't have to hydrate it. The hero header almost never needs interactivity.

### Preconnect / dns-prefetch

\`\`\`tsx
export const metadata = {
  other: {
    "link-preconnect": "https://images.example.com",
  },
};
\`\`\`

For critical third-party origins.

## CLS playbook

### Reserve space for images

Always pass width and height (or use \`fill\` with a sized parent) to next/image. CLS happens when an image arrives and pushes content down — reserving space prevents it.

### font-display: swap with care

Self-hosted fonts via \`next/font\` use \`font-display: swap\` by default — text renders immediately in a fallback, then re-renders when the web font loads. Without size-adjust, that re-render can cause CLS. \`next/font\` auto-generates size-adjusted fallbacks to match the metrics — that's why it's better than a manual \`@font-face\`.

### Avoid late-loading layout shifters

Ads, embeds, banner notifications — reserve space with min-height or a skeleton. A cookie banner that pops in at the top after 2s is a CLS catastrophe.

## INP playbook

### Keep the main thread free

Big work in event handlers blocks input. Push heavy computation off the main thread:

\`\`\`tsx
"use client";
import { useTransition } from "react";

function Search() {
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState([]);

  function handleChange(value: string) {
    startTransition(() => {
      setResults(expensiveSearch(value)); // marked low-priority
    });
  }
  // …
}
\`\`\`

\`useTransition\` marks the state update as non-urgent — React keeps the input responsive even if the filter is slow.

### Defer non-critical work

\`\`\`tsx
// app/layout.tsx
import Script from "next/script";

<Script src="https://analytics.example.com/script.js" strategy="lazyOnload" />
\`\`\`

Strategies:
- \`beforeInteractive\` — blocks page until loaded (use for polyfills only)
- \`afterInteractive\` (default) — loads after hydration
- \`lazyOnload\` — loads after window onLoad

Analytics, chat widgets, social embeds — push them to lazyOnload.

### Lazy load below-the-fold

\`\`\`tsx
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("./heavy-chart"), {
  loading: () => <ChartSkeleton />,
});
\`\`\`

Code-split anything that's not visible on first paint.

## Measure in the field

Lighthouse gives synthetic numbers — useful, but not what users actually experience. Hook up the web-vitals library and ship metrics to your analytics:

\`\`\`tsx
"use client";
import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    fetch("/api/vitals", { method: "POST", body: JSON.stringify(metric) });
  });
  return null;
}
\`\`\`

Real users on slow phones on flaky networks are who you're optimising for. Synthetic scores are a leading indicator, not the goal.`,

  20: `## What next build produces

Running \`next build\` writes a directory structure that describes how every route should be served. Each route ends up in one of a few buckets:

\`\`\`
.next/
├── server/                ← server-side bundles (Node or Edge)
│   ├── app/
│   │   └── ...
│   └── pages/
│       └── ...
├── static/                ← hashed static assets (JS chunks, CSS)
├── cache/                 ← Next's incremental cache
└── BUILD_ID               ← unique build identifier
\`\`\`

The build log tells you the disposition of each route:

\`\`\`
Route (app)                              Size     First Load JS
┌ ○ /                                    1.2 kB        85 kB
├ ● /products/[slug]                     2.4 kB        92 kB
└ ƒ /dashboard                           3.1 kB        96 kB

○  (Static)            prerendered as static HTML
●  (SSG)               prerendered as static HTML + JSON
ƒ  (Dynamic)           server-rendered on demand
\`\`\`

## The buckets

### Static HTML (○)

Fully pre-rendered, just HTML and JS chunks. Serve from any CDN — no runtime needed.

### Static with generateStaticParams (●)

Pre-rendered at build for each generated param. Same hosting story as static HTML.

### Dynamic (ƒ)

Rendered per request. Needs a runtime — either Node or Edge.

### Edge functions

Routes that opt into the Edge runtime (\`export const runtime = "edge"\`) become V8 isolates instead of Node processes. Fast cold starts (~10ms), but no Node APIs.

### Image Optimisation API

\`/_next/image\` runs on the server for on-demand resizing. Needs a runtime.

## Why this matters for deployment

The runtime split dictates where you can deploy:

| Build output | Where it can run |
| --- | --- |
| All static | Any CDN (Cloudflare Pages, S3 + CloudFront, GitHub Pages) |
| Some dynamic (Node) | Vercel, AWS Amplify, self-hosted Node |
| Some dynamic (Edge) | Vercel, Cloudflare Workers, Netlify Edge |
| Image Optimisation | Same as dynamic — needs a runtime |

You can force fully-static output (no dynamic routes, no image optimisation) with \`output: "export"\` in \`next.config.js\`. Get a plain HTML site, deploy anywhere, lose Server Components rendering and ISR.

## The Build Output API

Standardises the build artefacts so non-Vercel platforms can serve Next correctly. \`AWS Amplify\`, \`Cloudflare Pages\`, \`Netlify\` all use it. Self-hosting via Docker with \`output: "standalone"\` bundles only the runtime you need into a minimal Node container:

\`\`\`js
// next.config.js
module.exports = {
  output: "standalone",
};
\`\`\`

Now \`.next/standalone/\` is a self-contained Node app you can copy into a Docker image.

## What the build tells you about performance

The size column is the route's incremental JS. The First Load JS column is total — including shared chunks. Anything significantly above the "First Load JS shared by all" baseline is a red flag — usually a heavy client-only library imported into the route. Code-split it with \`next/dynamic\` or move logic to a Server Component.

## Edge vs Node runtime choice

| | Edge | Node |
| --- | --- | --- |
| Cold start | ~10ms | 100-500ms |
| Memory | Limited (~128MB) | Generous |
| Node APIs | No (Web standard only) | Yes |
| Best for | Auth gates, redirects, light dynamic | Heavy data fetching, DB connections, file processing |

Per-route opt-in:

\`\`\`tsx
export const runtime = "edge"; // or "nodejs" (default in App Router)
\`\`\`

## Quick mental model

- **Static** scales effectively for free.
- **ISR** is the best compromise for content that changes occasionally.
- **Dynamic SSR** is for per-user or always-fresh content — costs scale with traffic.
- **Edge** is for low-latency global gates and rewrites — not heavy work.

A typical Next app on Vercel is a mix: marketing static, product pages ISR, dashboard dynamic SSR, auth at the Edge. The build output makes that mix visible.`,
};

async function main() {
  const file = path.join(process.cwd(), "data", "seed-nextjs.json");
  const raw = await readFile(file, "utf8");
  const data = JSON.parse(raw) as Array<{
    id: number;
    detailMd?: string | null;
    [k: string]: unknown;
  }>;

  let added = 0;
  let skipped = 0;
  for (const q of data) {
    const md = DETAILS[q.id];
    if (!md) continue;
    if (q.detailMd) {
      skipped += 1;
      continue;
    }
    q.detailMd = md;
    added += 1;
  }

  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
  console.log(
    `seed-nextjs.json — added detailMd to ${added}, skipped ${skipped} (already had one).`,
  );
}

main().catch((err: unknown) => {
  console.error("Failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
