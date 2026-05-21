/**
 * One-off script: injects detailMd values into data/seed-typescript.json
 * for the 19 questions that don't have one yet (id 12 was filled manually).
 *
 * Run once:  pnpm tsx scripts/add-detail-md-typescript.ts
 * Then:      pnpm seed
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DETAILS: Record<number, string> = {
  1: `## What the extensions mean

\`.ts\` is for plain TypeScript — utilities, types, hooks without JSX, server code. \`.tsx\` tells the compiler the file may contain JSX, so it parses the \`<\` and \`>\` characters as element delimiters rather than comparison operators.

## Why the parser needs the hint

In TypeScript, \`<Foo>\` is ambiguous — it could be a generic type assertion or a JSX element. The compiler resolves this by file extension. In \`.ts\`:

\`\`\`ts
const x = <string>value; // type assertion, valid
\`\`\`

In \`.tsx\`:

\`\`\`tsx
const x = <string>value; // SyntaxError — looks like a JSX tag
const x = value as string; // use 'as' instead
\`\`\`

That's why React projects standardised on \`as\` for type assertions — it works in both flavours.

## When to pick which

- \`.tsx\` — anything returning JSX. Components, custom hooks that render, page files.
- \`.ts\` — pure logic. Utilities, type definitions, API clients, server actions without JSX, Zod schemas.

A hook that only manages state stays \`.ts\`. A hook that returns a rendered component goes \`.tsx\`.

## Real-world setup

\`\`\`
src/
├── components/
│   └── Button.tsx       // returns JSX
├── hooks/
│   ├── useDebounce.ts   // no JSX
│   └── useToast.tsx     // returns a portal/component
├── lib/
│   ├── api.ts           // pure
│   └── utils.ts         // pure
└── types/
    └── user.ts          // type definitions
\`\`\`

Mixing the convention up isn't a runtime bug — just a small ergonomic friction. Stay consistent and editors give you better hover behaviour, eslint rules can target one extension, and grep stays clean.`,

  2: `## Yes — TypeScript is a compile-time tool

Browsers and Node run JavaScript, not TypeScript. The types you write only exist during compilation; they're stripped away before anything runs. Two responsibilities live in the compile step:

1. **Type checking** — does the program make sense?
2. **Transpilation** — convert TS syntax to JS the runtime supports.

## What does the compiling

You have options depending on the project:

\`\`\`bash
# The reference compiler
tsc --noEmit          # type-check only
tsc                   # type-check + emit JS

# Speed-oriented stripper (no type checking)
swc, esbuild, Babel
\`\`\`

Most build systems split these: a fast stripper (swc, esbuild) handles transpilation; \`tsc --noEmit\` runs separately for type checking. Next.js uses swc under the hood; that's why \`pnpm dev\` doesn't catch type errors — you need \`pnpm typecheck\` in CI.

## What gets emitted

Take this input:

\`\`\`ts
interface User {
  id: string;
  name: string;
}

function greet(user: User): string {
  return \`Hello, \${user.name}\`;
}
\`\`\`

After compilation:

\`\`\`js
function greet(user) {
  return \`Hello, \${user.name}\`;
}
\`\`\`

The interface is gone. The parameter and return type annotations are gone. The runtime has no idea types ever existed.

## Why this matters

- **No runtime type validation.** Don't trust API responses just because TS says they match a type. Use Zod or a similar validator for data crossing the network.
- **Type-only imports are tree-shaken.** \`import type { User } from './types'\` adds zero bytes to your bundle.
- **You can publish either** — \`.d.ts\` declaration files alongside compiled JS, or raw TS if your consumers handle it.

In modern setups the compile step is invisible — bundlers handle it, dev servers do it on the fly. But understanding it is gone is what keeps you from making the "this is typed so it must be valid" mistake at runtime.`,

  3: `## The bugs you stop shipping

The headline benefit is catching whole categories of bugs at the editor before they ever run:

\`\`\`ts
function getUserName(user: { name: string }) {
  return user.naem; // ← red squiggle, "Property 'naem' does not exist"
}
\`\`\`

That's a typo that would have shipped, caused a crash in production, and taken half a day to track down. TypeScript flags it in 50ms.

## Refactor safety

This is the bigger payoff in any sizeable codebase. Rename a property and the compiler shows you every call site that needs updating:

\`\`\`ts
// Change interface
interface Product {
  price: number;     // was: cost
  // …
}

// Compiler instantly shows every reference to .cost across the codebase
\`\`\`

In plain JS the equivalent is grep + hope + a test suite. In TS it's mechanical.

## Self-documenting interfaces

Types replace a lot of comments. A function signature like:

\`\`\`ts
function fetchOrders(
  customerId: string,
  status?: "pending" | "shipped" | "delivered",
): Promise<Order[]>;
\`\`\`

tells you what to pass, what's optional, what the valid statuses are, and what comes back — in less space than the prose equivalent, with the guarantee that the docs can't go stale.

## IDE superpowers

- Autocomplete for object properties
- Jump-to-definition that actually works
- Hover for inline type information
- Refactors that work across files
- Errors as you type, not on save

The compounding effect is the developer feels supported rather than guessing.

## Where the cost shows up

- Slight upfront cost defining types
- Compile step in the build pipeline
- Junior friction with advanced generic types

For any codebase beyond a quick prototype, the trade is overwhelmingly in TS's favour. The bigger the team, the longer the project lives, the more obvious it becomes.`,

  4: `## What TypeScript is

A static type system layered on top of JavaScript. Same syntax (TS is a superset of JS), same runtime behaviour, plus a compile-time type checker. Nothing about the types survives to runtime — they're a tool for you and your editor.

\`\`\`ts
// Valid TS
const x: number = 42;
const y = 42; // also valid — type inferred

// Valid TS, runtime error
const z = JSON.parse(input) as { count: number };
console.log(z.count); // crashes if input doesn't have count
\`\`\`

## Why over JavaScript

### Catches typos and shape mismatches

\`\`\`ts
function greet(user: { firstName: string }) {
  return \`Hi \${user.firstName}\`;
}
greet({ firstNme: "Aaron" }); // error before you run it
\`\`\`

### Refactor confidence

Rename a property on a type and the compiler shows you every caller that needs updating. In plain JS you grep, hope, and run the tests.

### Documents the API

A signature like \`function payment(order: Order, method: "card" | "bank"): Promise<Receipt>\` tells you what to pass, what's optional, and what comes back. Comments lie; types don't.

### IDE leverage

Autocomplete, jump-to-definition, refactors across files — all driven by the type information. The editor stops being a glorified text box.

## Real-world example

On the Butlin's migration, we had a thousand-component legacy codebase being moved to the App Router. Strict-mode TypeScript was the thing that made big sweeps safe:

\`\`\`ts
// Pages Router: { params, searchParams } objects
// App Router: Promise<{ params, searchParams }>

// Change the type once, the compiler flags every page that needs awaiting
type PageProps = {
  params: Promise<{ slug: string }>;
};
\`\`\`

Without TS strict, half those changes would have shipped subtle bugs. With it, the compiler did the audit for us.

## When JS might still win

Tiny scripts, one-off automation, demos. Anything where the compile step costs more than the safety buys. For anything that another person will read or maintain, TS is the default.`,

  5: `## What optional chaining does

The \`?.\` operator short-circuits a property access or method call if the receiver is \`null\` or \`undefined\`, returning \`undefined\` instead of throwing:

\`\`\`ts
const user = getUser();
const city = user?.address?.city; // string | undefined
\`\`\`

If \`user\` is null, \`city\` is undefined. If \`user.address\` is null, \`city\` is undefined. Without optional chaining you'd write:

\`\`\`ts
const city = user && user.address && user.address.city;
\`\`\`

Same effect, four times the noise.

## Three flavours

### Property access

\`\`\`ts
user?.name
\`\`\`

### Method call

\`\`\`ts
user?.greet();  // calls greet if user exists, returns undefined otherwise
\`\`\`

### Dynamic access

\`\`\`ts
user?.[key]
arr?.[0]
\`\`\`

## Pairs with nullish coalescing

Optional chaining gives you \`undefined\` when something's missing; \`??\` gives you a fallback:

\`\`\`ts
const name = user?.name ?? "Anonymous";
\`\`\`

Use \`??\` not \`||\` here — \`||\` falls through for any falsy value, including the empty string and zero:

\`\`\`ts
const count = user?.count ?? 0;  // keeps 0 if count is 0
const count = user?.count || 0;  // also returns 0 if count is 0 — usually wrong intent
\`\`\`

## TypeScript narrows the result

\`\`\`ts
interface Order {
  customer?: {
    email: string;
  };
}

function notify(order: Order) {
  const email = order.customer?.email;
  //    ^? string | undefined  ← compiler knows
  if (email) {
    sendEmail(email);
    //         ^? string  ← narrowed inside the guard
  }
}
\`\`\`

Type narrowing means downstream code doesn't have to keep checking for undefined.

## Where it's overkill

If you've already validated the data (Zod, an API contract), you don't need optional chaining everywhere — the types say the value exists. Don't \`?.\` defensively when the type says you can't be undefined; that suggests your types are too loose.`,

  6: `## What it does

The nullish coalescing operator \`??\` returns the right-hand value only when the left is \`null\` or \`undefined\`:

\`\`\`ts
const port = config.port ?? 3000;
\`\`\`

If \`config.port\` is null or undefined, \`port\` is 3000. If it's any other value — including \`0\`, \`""\`, \`false\` — \`port\` is that value.

## Why not \`||\`?

\`||\` triggers on every falsy value:

\`\`\`ts
const count = userInput || 10;  // → 10 if userInput is 0, "", false, null, undefined
const count = userInput ?? 10;  // → 10 only if userInput is null or undefined
\`\`\`

The distinction matters anywhere a falsy-but-valid value carries meaning:

\`\`\`ts
// User configured retries to 0 (no retries) — both return 3, wrong
const retries = config.retries || 3;
const retries = config.retries ?? 3; // → 0, correct

// Empty string is a valid user input — \`||\` discards it
const greeting = userMessage || "default"; // ignores valid empty input
const greeting = userMessage ?? "default"; // keeps empty input
\`\`\`

## With optional chaining

The two combine naturally:

\`\`\`ts
const email = user?.contact?.email ?? "no-reply@example.com";
\`\`\`

\`?.\` returns undefined for missing properties; \`??\` provides the fallback. Together they replace verbose chains of \`&&\` and \`||\`.

## ??= for assignment

The compound form assigns only if the left side is null or undefined:

\`\`\`ts
options.timeout ??= 5000;
// equivalent to: if (options.timeout == null) options.timeout = 5000;
\`\`\`

Handy for default-setting in mutable config objects.

## Gotcha — parens with \`||\` and \`&&\`

Mixing \`??\` with the older logical operators requires explicit parens — it's a syntax error otherwise:

\`\`\`ts
// SyntaxError
const x = a || b ?? c;

// OK
const x = (a || b) ?? c;
const x = a || (b ?? c);
\`\`\`

That's a deliberate language design choice — the precedence isn't obvious so the spec makes you decide.`,

  7: `## The fundamental distinction

An **interface** is a compile-time contract — pure type information, erased at runtime. A **class** is a runtime construct that produces objects (and can also be used as a type).

## Interface — types only

\`\`\`ts
interface User {
  id: string;
  name: string;
  greet(): string;
}

function format(user: User): string {
  return user.greet();
}

// Interface is gone at runtime. typeof User is undefined.
\`\`\`

You can satisfy an interface with any object that has the right shape — structural typing, no inheritance required.

## Class — runtime + type

\`\`\`ts
class Logger {
  constructor(private prefix: string) {}

  info(message: string) {
    console.log(\`[\${this.prefix}] \${message}\`);
  }
}

const log = new Logger("api");
log.info("hello");

// At runtime: Logger is a constructor function with a prototype.
// At type level: Logger is also a type (the instance type).
\`\`\`

## When to use which

- **Interfaces (or \`type\` aliases) for data** — props, function arguments, API payloads, configuration. 90%+ of typing work in a React/Next codebase.
- **Classes when you need an instance with state and behaviour** — a Stripe wrapper, a connection pool, a feature flag client. They're worth it when you have lifecycle (connect/disconnect), shared instance state, or multiple methods that share private internals.

\`\`\`ts
// Class — bundles state and behaviour, encapsulates internals
class Cache<T> {
  #store = new Map<string, { value: T; expiresAt: number }>();

  set(key: string, value: T, ttlMs: number) {
    this.#store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  get(key: string): T | undefined {
    const entry = this.#store.get(key);
    if (!entry) return;
    if (entry.expiresAt < Date.now()) return;
    return entry.value;
  }
}
\`\`\`

## The big shift in modern React

Function components + hooks replaced almost all class usage on the UI side. You'll see classes for error boundaries (until react-error-boundary covers your case) and the occasional third-party adapter. New code rarely needs them.`,

  8: `## TS is a superset of JS

Every valid JavaScript program is also a valid TypeScript program. TS adds:

- A static type system
- A few syntax extensions (enums, access modifiers, namespaces)
- Tooling that depends on the type information (autocomplete, refactors)

It compiles to JavaScript — same runtime semantics, same V8/JIT behaviour, same garbage collection.

## What you write differently

### Type annotations

\`\`\`ts
// JS
function sum(a, b) {
  return a + b;
}

// TS
function sum(a: number, b: number): number {
  return a + b;
}
\`\`\`

### Interfaces and type aliases

\`\`\`ts
interface User {
  id: string;
  email: string;
}

type Result<T> = { ok: true; value: T } | { ok: false; error: string };
\`\`\`

### Generics

\`\`\`ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const x = first(["a", "b"]); // x: string | undefined
\`\`\`

## What you don't need to write differently

\`\`\`ts
// Still works — TS infers types from values
const users = [{ id: "1", name: "Aaron" }];
const names = users.map(u => u.name);
//                      ^^   ← inferred as { id: string; name: string }
\`\`\`

Modern TS leans heavily on inference. Over-annotating is the rookie move; let the compiler do the work and only annotate at API boundaries.

## What ships to runtime

After compilation, all of this is stripped:

\`\`\`ts
// TS source
interface User { id: string }
function greet(user: User): string {
  return \`Hi \${user.id}\`;
}

// Compiled JS
function greet(user) {
  return \`Hi \${user.id}\`;
}
\`\`\`

No type information survives. That's why you still need runtime validation for data crossing trust boundaries (\`zod.parse(apiResponse)\`).

## The trade

- **TS** — safety, refactor confidence, IDE leverage, slower edit-to-run loop
- **JS** — fewer tools to learn, no build step, faster iteration on tiny scripts

For anything more than a quick script, TS pays for itself within days.`,

  9: `## What it is

An interface declares the shape of an object — the properties it has, the types of those properties, the methods it supports. The compiler uses it for structural type checking; nothing about it survives to runtime.

\`\`\`ts
interface User {
  id: string;
  name: string;
  email?: string;          // optional
  readonly createdAt: Date; // can't be reassigned
  greet(): string;
}
\`\`\`

## How it's used

Function arguments, return types, component props, API responses, config:

\`\`\`ts
interface ButtonProps {
  variant: "primary" | "secondary";
  onClick: () => void;
  disabled?: boolean;
}

function Button(props: ButtonProps) {
  return <button onClick={props.onClick}>...</button>;
}
\`\`\`

## Extending and merging

Interfaces compose with \`extends\`:

\`\`\`ts
interface Animal {
  name: string;
}

interface Dog extends Animal {
  bark(): void;
}
\`\`\`

And they merge across declarations — declare the same interface twice in scope and the compiler unions the members. Useful for augmenting library types:

\`\`\`ts
// In your own code
declare global {
  interface Window {
    analytics: { track(event: string): void };
  }
}

// Now window.analytics is typed everywhere
\`\`\`

Type aliases don't merge — that's the main behavioural difference.

## Common patterns

### Index signatures

\`\`\`ts
interface Dictionary<T> {
  [key: string]: T;
}
\`\`\`

### Function signatures

\`\`\`ts
interface Logger {
  (message: string): void;
  level: "debug" | "info" | "warn";
}
\`\`\`

A callable interface — the function itself plus properties on it.

### Hybrid

\`\`\`ts
interface ApiClient {
  baseUrl: string;
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
}
\`\`\`

## interface vs type

Both can describe object shapes. Interfaces merge and extend cleanly; type aliases can also do unions, intersections, mapped types, and primitives. Pick one as the default for object shapes in your project and stay consistent — mixing them makes the public API look inconsistent in IDE hover previews.`,

  10: `## The fast answer

Use an interface (or type alias) when you just need to describe the *shape* of some data. Reach for a class only when you genuinely need a runtime instance with state and behaviour.

\`\`\`ts
// Interface — describes data
interface User {
  id: string;
  email: string;
  isActive: boolean;
}

// Class — encapsulates behaviour and internal state
class RateLimiter {
  #tokens = new Map<string, number>();
  constructor(private maxPerSecond: number) {}

  allow(key: string): boolean {
    const now = Date.now();
    const last = this.#tokens.get(key) ?? 0;
    if (now - last < 1000 / this.maxPerSecond) return false;
    this.#tokens.set(key, now);
    return true;
  }
}
\`\`\`

## The "is this data or is this behaviour?" test

If your "class" is just a constructor that sets fields and doesn't have meaningful methods, it should be an interface and a plain object:

\`\`\`ts
// 🚫 A class for the sake of it
class User {
  constructor(
    public id: string,
    public email: string,
  ) {}
}

const u = new User("1", "a@example.com");

// ✅ Just data
interface User {
  id: string;
  email: string;
}

const u: User = { id: "1", email: "a@example.com" };
\`\`\`

## When a class earns its keep

- **Stateful** — accumulates internal state across calls (caches, rate limiters, queues, EventEmitters)
- **Lifecycle** — connect/disconnect, open/close, start/stop
- **Encapsulation** — private fields that shouldn't be touched by consumers
- **Polymorphism** — multiple implementations of the same shape, swapped at runtime

\`\`\`ts
abstract class Notifier {
  abstract send(message: string): Promise<void>;
}

class SlackNotifier extends Notifier {
  async send(message: string) { /* … */ }
}

class EmailNotifier extends Notifier {
  async send(message: string) { /* … */ }
}
\`\`\`

If your codebase doesn't have those signals, interfaces and plain functions are simpler, more testable, and play better with serialisation. In React land that covers the vast majority of files.`,

  11: `## What \`as const\` does

\`as const\` tells the compiler to infer the *narrowest possible* type for a value:

- String and number literals stay literal
- Arrays become readonly tuples
- Object properties become readonly literal types

\`\`\`ts
const a = "hello";              // type: string
const b = "hello" as const;     // type: "hello"

const arr1 = [1, 2, 3];                  // type: number[]
const arr2 = [1, 2, 3] as const;         // type: readonly [1, 2, 3]

const obj1 = { kind: "click", x: 10 };           // { kind: string; x: number }
const obj2 = { kind: "click", x: 10 } as const;  // { readonly kind: "click"; readonly x: 10 }
\`\`\`

## The use cases

### Discriminated unions from data

\`\`\`ts
const actions = [
  { type: "increment" },
  { type: "decrement" },
  { type: "reset" },
] as const;

type Action = typeof actions[number]; // { type: "increment" } | { type: "decrement" } | ...
\`\`\`

Without \`as const\`, \`type\` would be widened to \`string\` and the union would collapse.

### Stable lookup tables

\`\`\`ts
const STATUS = {
  pending: "Awaiting review",
  active: "Live",
  archived: "Retired",
} as const;

type Status = keyof typeof STATUS; // "pending" | "active" | "archived"
\`\`\`

This is the modern replacement for \`enum\` in most cases — no runtime overhead, plays well with tree-shaking, types derive from data.

### Tuple inference

\`\`\`ts
// Without const — TS widens to (string | number)[]
function tuple<T extends readonly unknown[]>(...args: T): T {
  return args;
}

const pair = tuple("user", 1);
//    ^? readonly [string, number]   ← with constraint + spread, preserved
\`\`\`

\`as const\` on a tuple preserves the order and length information.

### useReducer action types

\`\`\`ts
const initialState = { count: 0 };

function reducer(state: typeof initialState, action: Action) {
  switch (action.type) {
    case "increment": return { count: state.count + 1 };
    case "decrement": return { count: state.count - 1 };
    case "reset":     return initialState;
  }
}
\`\`\`

The \`Action\` union (derived from the \`actions\` array above) means the switch is exhaustive — add a new action and the compiler flags the missing case.

## When not to use it

For mutable objects — \`as const\` makes everything \`readonly\`, which the compiler enforces. If you assign into the object later, it'll complain. Save it for true constants and config maps.`,

  13: `## Interface vs type — what's actually different

For describing an object shape, both work and produce equivalent types. The real differences are in capability and behaviour.

\`\`\`ts
interface User {
  id: string;
  name: string;
}

type User = {
  id: string;
  name: string;
};
\`\`\`

Either one is fine. The compiler is happy with both.

## Where interfaces are different

### Declaration merging

\`\`\`ts
interface User { id: string }
interface User { name: string }
// Resulting type: { id: string; name: string }
\`\`\`

Same name twice merges the members. This is how you augment third-party types (\`declare module\` for a library, \`declare global\` for window) — only interfaces merge.

### \`extends\` syntax

\`\`\`ts
interface Admin extends User {
  role: "admin";
}
\`\`\`

Familiar OO-style inheritance.

## Where type aliases are different

### Unions and intersections

\`\`\`ts
type Status = "active" | "archived";
type AdminUser = User & { role: "admin" };
type Result<T> = { ok: true; value: T } | { ok: false; error: string };
\`\`\`

Interfaces can't do these directly.

### Mapped and conditional types

\`\`\`ts
type Optional<T> = { [K in keyof T]?: T[K] };
type ReturnTypeOf<F> = F extends (...args: any[]) => infer R ? R : never;
\`\`\`

Type-level computation needs \`type\`.

### Primitives and tuples

\`\`\`ts
type Port = number;
type RGB = [number, number, number];
\`\`\`

Interfaces only describe object shapes.

## A working policy

Pick one as the default and document it. The two policies I've seen work:

**Interface-first** — use \`interface\` for any object shape, fall back to \`type\` only when you need unions, intersections, mapped types, or primitives. Plays well with library augmentation.

**Type-first** — use \`type\` for everything. More consistent, no surprises when you need to flip between union and object types. The compiler hover preview looks the same shape everywhere.

On the Heyman Al component library we went type-first because most of the public API was discriminated unions for variants. Mixing \`interface\` and \`type\` made the IDE preview inconsistent — \`type\` would show the expanded shape, \`interface\` would just show the name. One convention, written down, fixed it.

## The wrong answer

Mixing them randomly. Whichever you pick, be consistent. The cost of disagreement is small but real.`,

  14: `## TS supports function overloading — at the type level only

You write multiple signatures above a single implementation. The implementation accepts the union of all inputs and returns the union of all outputs. At each call site, the compiler picks the matching overload to drive autocomplete and type narrowing.

\`\`\`ts
// Overload signatures — what the world sees
function parse(input: string): string[];
function parse(input: number): number[];
function parse(input: boolean): boolean[];

// Implementation — must satisfy all overloads
function parse(input: string | number | boolean): string[] | number[] | boolean[] {
  if (typeof input === "string") return input.split(",");
  if (typeof input === "number") return [input, input * 2];
  return [input, !input];
}

const a = parse("a,b,c");  // a: string[]
const b = parse(10);       // b: number[]
const c = parse(true);     // c: boolean[]
\`\`\`

Without overloads, the return type would be the union \`string[] | number[] | boolean[]\` — and the caller would have to narrow it themselves. With overloads, the compiler picks the right one based on the argument types.

## When it shines

When the return type genuinely depends on the input *shape*, not just on a generic. Common examples:

- DOM \`document.createElement("a")\` returning \`HTMLAnchorElement\` vs \`document.createElement("div")\` returning \`HTMLDivElement\`
- Schema validators where the type changes based on options
- A query builder where \`.select("id")\` returns a different row type than \`.select("*")\`

## When generics are cleaner

If the return type is just "same as input" or "shape derived from input", generics usually beat overloads:

\`\`\`ts
// Overload form — verbose
function wrap(value: string): { value: string };
function wrap(value: number): { value: number };
function wrap(value: any) { return { value }; }

// Generic form — concise, scales infinitely
function wrap<T>(value: T): { value: T } {
  return { value };
}
\`\`\`

## When discriminated unions are cleaner

If you're overloading based on an options object, a discriminated union is often nicer to consume:

\`\`\`ts
type FetchOptions =
  | { mode: "json"; url: string }
  | { mode: "blob"; url: string };

function smartFetch(opts: FetchOptions) {
  if (opts.mode === "json") return fetch(opts.url).then(r => r.json());
  return fetch(opts.url).then(r => r.blob());
}
\`\`\`

## Watch outs

- Overload order matters — the most specific should come first.
- The implementation signature is *not* visible to callers; only the overloads are.
- Overloads can lie. The implementation can return something different than the overload promises — the compiler trusts you.

Reach for overloads when the type behaviour really is overloaded; reach for generics or unions first when they fit.`,

  15: `## TypeScript matches types by shape, not by name

If two types have the same set of compatible properties, they're considered the same type — even if neither was declared to implement the other. That's structural typing, and it's the opposite of the *nominal* typing in Java or C# where a class has to explicitly \`implements\` an interface to satisfy it.

## The classic example

\`\`\`ts
interface Point {
  x: number;
  y: number;
}

function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

const p1 = { x: 1, y: 2 };
const p2 = { x: 4, y: 6, label: "End" };

distance(p1, p2); // ✅ both have x and y, both satisfy Point
\`\`\`

\`p2\` was never declared as a \`Point\`. It doesn't matter — the compiler checks shape.

## Why this matters in practice

You can satisfy interfaces from third-party libraries with plain objects, no \`new SomeClass\` needed:

\`\`\`ts
// react-query expects { isLoading, data, error }
const fakeQuery = { isLoading: false, data: [1, 2, 3], error: null };
renderTable(fakeQuery);
\`\`\`

Great for tests, mocks, and gluing libraries together.

## Where nominal typing leaks back in

Some types are *almost* the same but logically distinct:

\`\`\`ts
type UserId = string;
type ProductId = string;

function deleteUser(id: UserId) { /* … */ }

const pId: ProductId = "abc";
deleteUser(pId); // ✅ compiles — both are string. Bug.
\`\`\`

The compiler sees two strings and says fine. To get nominal-ish behaviour, brand them:

\`\`\`ts
type UserId = string & { __brand: "UserId" };
type ProductId = string & { __brand: "ProductId" };

declare const userId: (s: string) => UserId;
declare const productId: (s: string) => ProductId;

deleteUser(productId("abc")); // ❌ compiler complains
deleteUser(userId("abc"));    // ✅
\`\`\`

The \`__brand\` is a compile-time fiction (no runtime cost), but it gives you a unique nominal type per concept. Worth it for IDs, currency types, anything where mixing values would be a real bug.

## The mental model

Duck typing with compiler help. If it has \`.quack()\` and \`.swim()\`, the compiler says it's a duck — regardless of family tree.`,

  16: `## Regular enum

A regular \`enum\` compiles to a real JavaScript object that exists at runtime:

\`\`\`ts
enum Status {
  Pending,
  Active,
  Archived,
}

// Compiles to roughly:
// var Status = { Pending: 0, Active: 1, Archived: 2,
//                0: "Pending", 1: "Active", 2: "Archived" };
\`\`\`

Notice the reverse lookup — \`Status[0]\` gives you \`"Pending"\`. Cost: a few bytes per enum in the bundle.

## Const enum

A \`const enum\` is erased at compile time — every reference is inlined as a literal:

\`\`\`ts
const enum Status {
  Pending = "pending",
  Active = "active",
}

const current: Status = Status.Active;

// Compiles to:
// var current = "active";
\`\`\`

Zero runtime footprint. But const enums are incompatible with several modern build setups — Babel can't compile them (they need TypeScript's compiler), and \`isolatedModules\` (which Next.js and esbuild use) forbids them. That makes them a non-starter in most production codebases today.

## What I actually use

An \`as const\` object plus a derived union — same ergonomics, no compiler tax, plays well with tree-shaking:

\`\`\`ts
const STATUS = {
  pending: "pending",
  active: "active",
  archived: "archived",
} as const;

type Status = (typeof STATUS)[keyof typeof STATUS];
// → "pending" | "active" | "archived"

// Usage
function setStatus(s: Status) { /* … */ }
setStatus(STATUS.pending);  // ✅
setStatus("active");         // ✅
setStatus("draft");          // ❌ Argument is not assignable
\`\`\`

You get:

- The same string-literal narrowing as a const enum
- A real runtime value you can iterate over (\`Object.keys(STATUS)\`)
- Compatibility with \`isolatedModules\`, Babel, and every bundler
- Tree-shaking removes the object if no runtime reference uses it

## TL;DR

- **Regular enum** — fine, costs a few bytes, supports reverse lookup. Default if you need enums.
- **Const enum** — zero runtime cost, but broken under \`isolatedModules\`. Avoid in modern setups.
- **\`as const\` object + derived union** — what most TS projects use today. Universal, tiny, expressive.`,

  17: `## What currying is

Currying turns a function of N arguments into a chain of N single-argument functions:

\`\`\`ts
// Uncurried
function add(a: number, b: number, c: number): number {
  return a + b + c;
}
add(1, 2, 3); // 6

// Curried
function addCurried(a: number) {
  return (b: number) => (c: number) => a + b + c;
}
addCurried(1)(2)(3); // 6
\`\`\`

## Why bother

You can fix one argument and pass the partially-applied function around. That's useful when a callback API expects a function with fewer parameters than your real function has:

\`\`\`ts
function fetchUser(token: string, id: string): Promise<User> {
  return fetch(\`/api/users/\${id}\`, { headers: { auth: token } }).then(r => r.json());
}

const withToken = (token: string) => (id: string) => fetchUser(token, id);

const authedFetch = withToken(currentSession.token);

// Now pass authedFetch around — consumers see (id) => Promise<User>
listUserIds.map(authedFetch);
\`\`\`

Same shape as dependency injection, with closures instead of containers.

## React example

Event handlers that need a parameter the JSX site knows:

\`\`\`tsx
function TodoList({ todos, onToggle }: Props) {
  const handleToggle = (id: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    onToggle(id);
  };

  return todos.map(todo => (
    <button key={todo.id} onClick={handleToggle(todo.id)}>
      {todo.text}
    </button>
  ));
}
\`\`\`

Each call to \`handleToggle(todo.id)\` returns a fresh function with that id baked in. Beware that this creates a new function every render — if the child is memoised, you'll bust the memoisation.

## TypeScript inference

The compiler usually handles currying fine, but generic curried helpers get tricky:

\`\`\`ts
function pipe<A, B>(fn1: (a: A) => B) {
  return <C>(fn2: (b: B) => C) => (a: A) => fn2(fn1(a));
}

const upper = pipe((s: string) => s.trim())((s) => s.toUpperCase());
upper("  hello  "); // "HELLO"
\`\`\`

For longer pipelines the type inference often breaks down and you end up with \`any\` somewhere in the chain. Libraries like \`ts-toolbelt\` or hand-rolled overloads paper over it, but the complexity grows fast.

## When to reach for it

Sparingly. The use cases where currying actually clarifies the code are narrow — usually function composition pipelines and dependency-pre-binding. For most callback work, a plain arrow function is clearer and easier to type.`,

  18: `## Both accept any value

\`any\` and \`unknown\` are both top types — any value assigns to them. The difference is in what you can do *with* the value afterwards.

\`\`\`ts
let a: any = JSON.parse(input);
a.user.id;        // ✅ compiler doesn't check
a();              // ✅ compiler doesn't check
a + "hello";      // ✅ compiler doesn't check
\`\`\`

\`any\` turns type checking off for that variable. Everything compiles. Bugs run.

\`\`\`ts
let u: unknown = JSON.parse(input);
u.user.id;        // ❌ Object is of type 'unknown'
u();              // ❌ Object is of type 'unknown'
u + "hello";      // ❌ Object is of type 'unknown'
\`\`\`

\`unknown\` accepts anything, but the compiler refuses to let you use it until you narrow.

## Narrowing unknown

\`\`\`ts
function handle(value: unknown) {
  if (typeof value === "string") {
    value.toUpperCase(); // ✅ narrowed to string
  }
  if (value instanceof Error) {
    console.error(value.message); // ✅ narrowed to Error
  }
  if (typeof value === "object" && value !== null && "id" in value) {
    const id = (value as { id: string }).id; // narrowed via custom guard
  }
}
\`\`\`

The compiler walks you down to a usable type by checking what \`value\` actually is.

## Where to use which

### unknown — the right default for outside data

\`\`\`ts
async function fetchUser(id: string): Promise<unknown> {
  const res = await fetch(\`/api/users/\${id}\`);
  return res.json(); // res.json() returns Promise<any> by spec, narrow it
}

const data = await fetchUser("1");
const user = UserSchema.parse(data); // Zod or similar — runtime validation
\`\`\`

Network responses, third-party callbacks, \`JSON.parse\`, \`localStorage.getItem\` — anywhere the data comes from outside your code, \`unknown\` makes you validate before using.

### any — escape hatch only

When migrating untyped JS, dealing with a library that lacks types, or proving a point to the compiler. Tag with a comment so the next reader knows it's deliberate:

\`\`\`ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const legacyApi = (window as any).LegacyWidget;
\`\`\`

## Why prefer unknown

\`any\` propagates. Touch one \`any\` and the result is \`any\`, and the next, and the next. The whole codebase quietly loses type safety. \`unknown\` doesn't — it forces narrowing at each boundary, so the loss is contained.

If you're tempted to use \`any\`, ask whether \`unknown\` plus a narrowing block would do the job. 95% of the time, it will.`,

  19: `## What infer does

\`infer\` lets a conditional type capture and name a type the compiler works out for you. It only appears inside the \`extends\` clause of a conditional type, and it gives you a placeholder you can reference in the true branch.

## The canonical example

\`\`\`ts
type ReturnTypeOf<F> = F extends (...args: any[]) => infer R ? R : never;

type A = ReturnTypeOf<() => string>;       // string
type B = ReturnTypeOf<(n: number) => User>; // User
type C = ReturnTypeOf<number>;              // never
\`\`\`

The line \`F extends (...args: any[]) => infer R\` reads: "if \`F\` is a function returning *something*, name that something \`R\`."

Without \`infer\` you could check whether \`F\` is a function, but you couldn't extract its return type. \`infer\` is the only way to pull a piece out of a matched shape.

## More uses

### Extract an array element type

\`\`\`ts
type Element<T> = T extends (infer U)[] ? U : never;

type A = Element<string[]>;   // string
type B = Element<User[]>;     // User
\`\`\`

### Extract a promise's resolved type

\`\`\`ts
type Awaited<T> = T extends Promise<infer U> ? U : T;

type A = Awaited<Promise<string>>; // string
type B = Awaited<number>;          // number (no unwrap needed)
\`\`\`

(This is now built into TS as \`Awaited<T>\`.)

### Pull a parameter type

\`\`\`ts
type FirstArg<F> = F extends (a: infer A, ...rest: any[]) => any ? A : never;

type A = FirstArg<(s: string, n: number) => void>; // string
\`\`\`

## Real use on a component library

On the Heyman Al library I used infer to derive prop types from a variant map — define variants \`as const\`, infer the keys, and consumers always get the live union. No restating, no drift:

\`\`\`ts
const variants = {
  primary: "bg-blue-600 text-white",
  secondary: "bg-gray-200 text-gray-900",
  ghost: "bg-transparent text-gray-700",
} as const;

type Variant = keyof typeof variants;
// → "primary" | "secondary" | "ghost"

// Add a new variant to the object, the union updates automatically.
interface ButtonProps {
  variant: Variant;
  children: React.ReactNode;
}
\`\`\`

Same idea with infer makes it work even for deeply nested shapes:

\`\`\`ts
type ValueOf<T> = T extends Record<string, infer V> ? V : never;

type ClassName = ValueOf<typeof variants>;
// → "bg-blue-600 text-white" | "bg-gray-200 text-gray-900" | ...
\`\`\`

## Why it's powerful

Most utility types in the standard library (\`ReturnType\`, \`Parameters\`, \`ConstructorParameters\`, \`Awaited\`, \`NonNullable\`) use infer under the hood. Once you understand it, you can write your own type-level helpers that extract exactly what you need from third-party types — no manual restating.`,

  20: `## What \`never\` represents

\`never\` is the type of a value that can't exist. A function that always throws or loops forever returns \`never\`. The empty union (a value that satisfies no type) is \`never\`. Anywhere the compiler proves "this code path is unreachable", the type narrows to \`never\`.

\`\`\`ts
function fail(message: string): never {
  throw new Error(message);
}

function loop(): never {
  while (true) { /* … */ }
}
\`\`\`

These functions return \`never\` because they don't return at all.

## The killer use case — exhaustive checks

This is where never earns its keep in real code:

\`\`\`ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }
  | { kind: "triangle"; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.side ** 2;
    case "triangle":
      return (shape.base * shape.height) / 2;
    default: {
      // shape has been narrowed to never — every case handled
      const _exhaustive: never = shape;
      return _exhaustive;
    }
  }
}
\`\`\`

Add a new \`kind: "rhombus"\` to the union. The default case stops narrowing to \`never\`, and the assignment \`const _exhaustive: never = shape\` becomes a compile error: "Type 'Shape' is not assignable to type 'never'".

The compiler is telling you: "you added a case to the union but didn't handle it in the switch". A whole class of "missed case" bugs becomes impossible to ship.

## Other places never shows up

### Empty unions

\`\`\`ts
type Result = "ok" | "error";
type Inverse = Exclude<Result, "ok" | "error">; // never — nothing left
\`\`\`

### Conditional type fallbacks

\`\`\`ts
type ReturnTypeOf<F> = F extends (...args: any[]) => infer R ? R : never;
\`\`\`

When the match fails, you get \`never\` — meaning "this combination produces no usable type".

### Filtering union members

\`\`\`ts
type StringOnly<T> = T extends string ? T : never;
type Result = StringOnly<string | number | boolean>; // string
\`\`\`

The conditional type distributes over the union. \`number\` and \`boolean\` map to \`never\`, which is then absorbed (union with never is identity), leaving \`string\`.

## The mental model

\`never\` is the absurd value — the type that can have no inhabitants. That sounds esoteric until you realise it's what makes exhaustive checks, type filtering, and error-throwing functions all work correctly. It's the bottom of the type lattice, and most of TS's powerful inference relies on it.`,
};

async function main() {
  const file = path.join(process.cwd(), "data", "seed-typescript.json");
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
    `seed-typescript.json — added detailMd to ${added}, skipped ${skipped} (already had one).`,
  );
}

main().catch((err: unknown) => {
  console.error("Failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
