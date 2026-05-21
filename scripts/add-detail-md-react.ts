/**
 * One-off script: injects detailMd values into data/seed-react.json
 * for the 19 questions that don't have one yet (id 3 was filled manually).
 *
 * Run once:  pnpm tsx scripts/add-detail-md-react.ts
 * Then:      pnpm seed
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DETAILS: Record<number, string> = {
  1: `## What React actually is

React is a JavaScript library — not a framework — for building user interfaces from small, reusable components. You describe what the UI should look like for a given state, and React figures out the minimum set of DOM operations to get there.

## The component model

Every React app is a tree of components. A component is just a function that takes props and returns JSX:

\`\`\`tsx
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}</h1>;
}

function App() {
  return <Greeting name="Aaron" />;
}
\`\`\`

Composition replaces inheritance. You build complex UIs by nesting small components, not by extending classes.

## Declarative, not imperative

In vanilla JS you'd write *steps*: find the element, change its text, attach a listener, update the class. In React you write the *destination* — what the UI should look like for the current state — and let React figure out the steps:

\`\`\`tsx
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
\`\`\`

You never call \`textContent =\` or \`appendChild\`. React diffs the previous tree against the new one and applies the minimum change.

## What problem it solves

For anything beyond a static page, manual DOM manipulation gets unmaintainable fast — state ends up scattered between the DOM and your JS, and bugs creep in at the seams. React centralises state in the component tree and makes the UI a pure function of it.

## Where it stops

React is *just* the view layer. Routing, data fetching, forms, build pipeline — all bring-your-own. That's why meta-frameworks like Next.js exist: they fill the gaps with sensible defaults so you don't have to assemble the stack yourself.`,

  2: `## The style prop

React expects a JavaScript object, not a CSS string. Properties are camelCased and string or numeric values are accepted:

\`\`\`tsx
<div style={{ backgroundColor: "tomato", marginTop: 8 }} />
\`\`\`

Numeric values without a unit become pixels. So \`marginTop: 8\` is \`8px\`. Some properties (line-height, opacity, z-index) are unitless and stay as numbers.

## Why two braces

The outer \`{}\` enters JavaScript expression mode; the inner \`{}\` is the object literal. People hit this on day one and assume it's a React quirk — it's just JSX + JS.

## Dynamic styles

The whole point of inline styles is conditional values:

\`\`\`tsx
<button
  style={{
    backgroundColor: isPrimary ? "var(--primary)" : "transparent",
    opacity: isLoading ? 0.5 : 1,
  }}
>
  Save
</button>
\`\`\`

For one-off dynamic colours or computed positions (a draggable element's transform, say), inline styles are the right tool.

## Where they fall short

Anything you'd reuse — variants, hover states, media queries, focus rings — is awkward inline. Pseudo-classes don't exist at all in the style object. For everything reusable, a CSS class or a Tailwind utility wins.

## Modern preferences

Most teams I've worked with use Tailwind for the static stuff and reach for inline styles only when the value genuinely depends on runtime state:

\`\`\`tsx
<div
  className="rounded p-4 shadow"
  style={{ width: \`\${progress}%\` }}
/>
\`\`\`

Static visual concerns live in classes; the dynamic bit lives in \`style\`. Clean split.`,

  4: `## The component model

React's headline feature is composition: build a UI once as a small piece, reuse it everywhere. A Button, an Avatar, a Field — define them once with the right props and they slot into any page without duplication. Maintainability scales with the count of components, not the size of the app.

## The virtual DOM

You can write code as if the entire UI re-renders on every state change. React produces an in-memory tree, diffs it against the previous tree, and only updates the DOM nodes that actually changed. The mental model becomes "describe the destination", not "perform every step":

\`\`\`tsx
function ProductCard({ price, onSale }: Props) {
  return (
    <article className={onSale ? "ring-2 ring-red-500" : ""}>
      <h3>{title}</h3>
      <p>£{price}</p>
    </article>
  );
}
\`\`\`

Toggle \`onSale\` from \`false\` to \`true\` and only the className changes — everything else stays put.

## The ecosystem

Most frontend libraries today target React first. State (Zustand, Redux, Jotai), data fetching (TanStack Query, SWR), forms (React Hook Form, Formik), animation (Framer Motion), routing (React Router, Next.js) — they all assume React's lifecycle and hooks. Picking React buys you the largest set of off-the-shelf solutions in the JS world.

## TypeScript fit

The component-props-as-objects pattern maps cleanly to TS interfaces. Errors get caught at the call site, refactors flow through the type system. Strict-mode TS + React is the most productive combination on the frontend today.

## Skills travel

React Native, React for VR, server-side rendering, static export, RSC — same mental model, different target. The investment in learning React keeps paying out across very different surfaces.`,

  5: `## Where Flux came from

Meta announced Flux in 2014 alongside React. The thing it was reacting to was two-way data binding — frameworks like Angular 1 had \`ng-model\` mutating state from views, models updating views, and large apps becoming impossible to reason about. Flux's pitch: data flows in one direction, always.

## The pattern

Four pieces, in a loop:

1. **Actions** — plain objects describing "something happened" (\`{ type: 'CART_ADD', id }\`)
2. **Dispatcher** — a single channel that hands actions to stores
3. **Stores** — hold state, react to actions, emit change events
4. **Views** — read from stores, dispatch actions in response to interaction

User clicks → view dispatches an action → store updates → view re-renders. No back-channel.

## A minimal example

\`\`\`ts
type Action = { type: "increment" } | { type: "reset" };

let state = { count: 0 };
const listeners = new Set<() => void>();

function dispatch(action: Action) {
  if (action.type === "increment") state = { count: state.count + 1 };
  if (action.type === "reset") state = { count: 0 };
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
\`\`\`

That's a tiny store. Hook it up to a React component with \`useSyncExternalStore\` and you have a Flux loop.

## What survived

Almost nobody uses literal Flux anymore — the dispatcher abstraction was clunky. But its ideas live on everywhere:

- **Redux** — single store + reducers, the Flux pattern with sharp edges sanded off
- **Zustand** — minimal stores with subscriptions, same one-way flow
- **\`useReducer\`** — React's built-in mini-Flux

If you ever wonder why every modern state library funnels mutations through a single channel — that's the Flux inheritance.`,

  6: `## The pre-React-16 problem

Before React 16, a thrown exception anywhere in the tree would unmount the entire app and leave the user with a blank page. There was no way to isolate a failure to one widget.

## What React 16 added

Two lifecycle methods on class components that, together, define an *error boundary*:

\`\`\`tsx
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    // Update state so the next render shows the fallback.
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Side effect: log to your monitoring service.
    reportError(error, info);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
\`\`\`

Wrap a subtree in it and a thrown render error renders the fallback instead of nuking the page:

\`\`\`tsx
<ErrorBoundary fallback={<p>Something broke. Try refresh.</p>}>
  <Dashboard />
</ErrorBoundary>
\`\`\`

## Important limitations

Error boundaries do **not** catch:

- Errors inside event handlers — wrap those in try/catch yourself
- Async errors (e.g. \`fetch().then\` rejections)
- Errors during server-side rendering (handled differently)
- Errors in the error boundary itself

## Modern practice

You typically don't write the class by hand anymore — the \`react-error-boundary\` package wraps the same pattern in a hook-friendly API with a \`useErrorHandler\` for async cases.

In App Router you also get \`error.tsx\` files per route segment, which set up boundaries automatically:

\`\`\`tsx
// app/dashboard/error.tsx
"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div>
      <p>Couldn't load the dashboard.</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
\`\`\`

The Next.js convention removes the class-component ceremony entirely for the common case.`,

  7: `## View library, not framework

React solves rendering. Everything else — routing, data fetching, forms, authentication, build setup — is bring-your-own. That's freedom *and* fatigue: every new project starts with a stack of decisions before you write the first line of feature code. Meta-frameworks like Next.js exist to make those decisions for you, which is why most teams reach for one.

## The JSX learning curve

JSX + a build step is unusual baggage for "just a library". You need a bundler, a JSX transform, source maps, dev server, hot reload. That tooling is mature today, but for someone coming from a server-rendered page it's a leap.

## Boilerplate creeps in

Hooks help, but a React component still has a fair amount of ceremony around state, effects, memoisation, and event handlers compared to a Svelte or Vue equivalent:

\`\`\`tsx
function Input({ value, onChange }: Props) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    [onChange],
  );
  return <input value={value} onChange={handleChange} />;
}
\`\`\`

Three concepts (\`useCallback\`, generic event types, controlled inputs) for one input. Each one is justifiable; together they add up.

## The performance footguns

React doesn't memoise by default. Pass an inline object or arrow function as a prop and every child re-renders, regardless of \`React.memo\`. The mental load of keeping reference equality stable is real, and most teams only notice when a profiler shows the cost.

## Rapidly evolving

Class components → hooks → Suspense → concurrent rendering → Server Components → \`use\` for promises. Each shift is an improvement, but it also means patterns from two years ago feel out of date. The React 19 + Next.js 16 setup looks very different from React 16 + CRA, and the migration cost between them isn't free.

## Where it still wins

For all that, React is the most-employable, best-supported, most-flexible UI library out there. The criticism is real; so is the dominance.`,

  8: `## The two concepts, distinct

An **Element** is the data — a plain object React creates when you evaluate JSX. A **Component** is the *function* (or class) that returns Elements.

## What an Element looks like

\`\`\`tsx
const element = <h1 className="title">Hello</h1>;

// Equivalent to:
const element = React.createElement(
  "h1",
  { className: "title" },
  "Hello",
);
\`\`\`

Both produce roughly this object:

\`\`\`ts
{
  type: "h1",
  props: { className: "title", children: "Hello" },
  key: null,
  ref: null,
}
\`\`\`

That's it — no methods, no DOM nodes, no lifecycle. An Element is a *description* of what should appear on screen.

## What a Component looks like

\`\`\`tsx
function Title({ children }: { children: React.ReactNode }) {
  return <h1 className="title">{children}</h1>;
}
\`\`\`

\`Title\` is a function. Calling \`<Title>Hello</Title>\` produces an Element whose \`type\` is the \`Title\` function itself:

\`\`\`ts
{
  type: Title,
  props: { children: "Hello" },
  // ...
}
\`\`\`

React sees \`type\` is a function, calls it with props, gets back another Element, recurses until it bottoms out at host Elements (strings like \`"h1"\`).

## Why the distinction matters

People mix these up casually — "this component" usually means "this Element instance" in conversation, and that's fine. But when you're debugging reconciliation, the distinction is everything: React decides what to mount, update, or unmount by comparing the \`type\` field of old and new Elements. If \`type\` matches, it updates props; if not, it tears down and rebuilds. That's why moving a component between two different parent types remounts it.`,

  9: `## What "stateful" means

A stateful component owns data that can change over time, and re-renders when it does. In modern React that's any function component using \`useState\`, \`useReducer\`, or one of the higher-level state hooks.

## The simplest example

\`\`\`tsx
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount((c) => c + 1)}>
      Count: {count}
    </button>
  );
}
\`\`\`

\`useState\` returns the current value and a setter. Calling the setter queues a re-render with the new value. The state survives across renders — React holds onto it for the lifetime of the component instance.

## When state belongs in the component

- The data is **local to the UI** — a toggle, a form field, an open/closed accordion.
- Nobody else needs to read it — it doesn't leak into other parts of the tree.
- You want it to **reset on unmount** — close the modal, the draft state is gone.

If two unrelated subtrees need the same piece of state, that's the cue to lift it up (or move it to a store).

## useReducer for complex transitions

When state transitions have rules — "you can only confirm if all fields are valid" — \`useReducer\` makes them explicit:

\`\`\`tsx
type State = { status: "idle" | "loading" | "error"; value: string };
type Action =
  | { type: "type"; payload: string }
  | { type: "submit" }
  | { type: "fail" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "type":
      return { ...state, value: action.payload };
    case "submit":
      return { ...state, status: "loading" };
    case "fail":
      return { ...state, status: "error" };
  }
}

function Form() {
  const [state, dispatch] = useReducer(reducer, {
    status: "idle",
    value: "",
  });
  // ...
}
\`\`\`

Same shape as Redux at component scale — keeps the logic in one place and easy to test.`,

  10: `## What "stateless" means

A stateless component takes props and returns JSX. No \`useState\`, no \`useEffect\`, no internal mutable data. Same input → same output, every time.

\`\`\`tsx
function Avatar({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} className="rounded-full" />;
}
\`\`\`

## Why they're worth preferring

- **Predictable** — only thing that changes is the props you pass in.
- **Cheap to test** — render with some props, assert on the output. No setup, no mocking.
- **Composable** — they're the natural Lego blocks of a design system.

If you find yourself reaching for state in a presentational component, ask whether the state really belongs to the parent. Lifting it up keeps the leaf stateless.

## Where the line blurs

\`useEffect\`, \`useMemo\`, \`useCallback\`, \`useRef\` — these all add state in the React sense, even if they're "just" managing references or memos. A component using them isn't strictly stateless.

In practice the useful distinction isn't "stateless vs stateful" — it's **presentational vs container**:

\`\`\`tsx
// Container — owns the state, fetches the data
function UserCardContainer({ userId }: { userId: string }) {
  const { data, isLoading } = useUser(userId);
  if (isLoading) return <Spinner />;
  return <UserCard user={data} />;
}

// Presentational — pure props in, UI out
function UserCard({ user }: { user: User }) {
  return (
    <article>
      <Avatar src={user.avatarUrl} alt={user.name} />
      <h3>{user.name}</h3>
    </article>
  );
}
\`\`\`

The container deals with data and lifecycle; the presentational component stays pure. That split is what design systems are built on.`,

  11: `## Two related but distinct APIs

\`React.createElement\` is what JSX compiles down to — it constructs a brand new Element from scratch. \`React.cloneElement\` takes an existing Element and produces a copy of it with merged or overridden props.

## createElement

\`\`\`tsx
const a = <h1 className="title">Hello</h1>;
const b = React.createElement("h1", { className: "title" }, "Hello");
// a and b are equivalent.
\`\`\`

You almost never call it directly — JSX is the friendly syntax. The exception is meta-programming where you need to construct Elements dynamically from runtime data:

\`\`\`tsx
function dynamic(tag: keyof JSX.IntrinsicElements, text: string) {
  return React.createElement(tag, null, text);
}
\`\`\`

## cloneElement

The use case is taking an Element someone *gave you* (typically as children) and adding props to it before rendering:

\`\`\`tsx
function ToolTip({ children }: { children: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {React.cloneElement(children, {
        onMouseEnter: () => setOpen(true),
        onMouseLeave: () => setOpen(false),
      })}
      {open && <div className="tooltip">…</div>}
    </>
  );
}

<ToolTip>
  <button>Hover me</button>
</ToolTip>
\`\`\`

\`cloneElement\` lets \`ToolTip\` inject event handlers into the button without the consumer wiring them up.

## Why it's niche

In modern React you'd usually solve the same problem differently:

- **Render props or function-as-children** — pass state down explicitly.
- **Compound components with context** — siblings share state via a context provider instead of prop injection.

cloneElement still shows up in design system libraries (Radix, Headless UI internals) where the API surface really does need to forward props onto an arbitrary child element. For application code you can usually avoid it.`,

  12: `## The bind problem

In a class component, methods aren't auto-bound to the instance. Passing one as a callback loses \`this\`:

\`\`\`tsx
class Toggle extends React.Component {
  state = { on: false };

  handleClick() {
    // \`this\` is undefined here when called as a callback.
    this.setState({ on: !this.state.on });
  }

  render() {
    return <button onClick={this.handleClick}>Toggle</button>;
  }
}
\`\`\`

That \`onClick\` will throw the moment you click.

## Option 1: bind in the constructor

The classic fix, used in the React docs for years:

\`\`\`tsx
class Toggle extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  // …
}
\`\`\`

Works, but it's boilerplate for every method.

## Option 2: arrow function as a class field

The modern class-component answer. Class fields are bound to the instance automatically:

\`\`\`tsx
class Toggle extends React.Component {
  state = { on: false };

  handleClick = () => {
    this.setState({ on: !this.state.on });
  };

  render() {
    return <button onClick={this.handleClick}>Toggle</button>;
  }
}
\`\`\`

No constructor, no bind. The arrow's lexical \`this\` resolves to the instance.

## Option 3: skip the problem entirely

Write a function component. There's no \`this\` to bind:

\`\`\`tsx
function Toggle() {
  const [on, setOn] = useState(false);
  return <button onClick={() => setOn((o) => !o)}>Toggle</button>;
}
\`\`\`

This is the answer 99% of the time today. Class components linger in legacy code (especially around \`getDerivedStateFromError\` for error boundaries), but new code rarely needs them.`,

  13: `## Render must be pure

In a class component, \`render()\` — and in a function component, the function body itself — is expected to be a **pure function of props and state**. Same inputs, same output, no side effects. Breaking that contract causes bugs that range from subtle (flicker, wasted re-renders) to catastrophic (infinite loops).

## Things you must not do

### Don't call setState

\`\`\`tsx
function Bad() {
  const [count, setCount] = useState(0);
  setCount(count + 1); // infinite loop — re-render triggers re-render
  return <p>{count}</p>;
}
\`\`\`

State updates belong in event handlers or effects, never in the render body.

### Don't fetch, subscribe, or mutate

\`\`\`tsx
function Bad({ userId }: { userId: string }) {
  fetch(\`/api/users/\${userId}\`); // fires on every render
  return <div>…</div>;
}
\`\`\`

Those go in \`useEffect\`. Render runs many times — once is enough for a fetch.

### Don't read or write the DOM

No \`document.querySelector\`, no \`element.scrollIntoView\`. DOM work needs the DOM to exist, which means \`useEffect\` (which runs after commit) or a ref.

### Don't generate random IDs or read \`Date.now()\`

If render isn't deterministic, two consecutive renders can produce different output for the same inputs and React will warn (or worse, hydration will mismatch on SSR). Use \`useId\` for stable IDs; freeze the time value in state if you need it.

## Why this strictness?

React renders speculatively. With concurrent rendering, a component might be rendered twice and one render thrown away. StrictMode deliberately double-invokes in dev to surface this. If your render isn't idempotent, you'll see flicker, dropped state, or warnings — and the bug will be worse under load in production.

The discipline becomes muscle memory: render *describes*, effects *do*.`,

  14: `## What keys actually do

When React reconciles two versions of a list, it pairs items up by their \`key\` prop. Matched keys mean "this is the same item, just possibly updated". Unmatched keys mean "remove the old, mount the new". Without keys, React falls back to matching by position — and that's where the bugs come from.

## The classic bug

\`\`\`tsx
function TodoList({ items }: { items: Todo[] }) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={i}>
          <input defaultValue={item.text} />
        </li>
      ))}
    </ul>
  );
}
\`\`\`

Render with \`[{text: "A"}, {text: "B"}]\`. User types into the second input. Now the list reorders to \`[{text: "B"}, {text: "A"}]\`. React sees:

- Old key 0 = new key 0 → same DOM node, just update props
- Old key 1 = new key 1 → same DOM node, just update props

The DOM nodes don't move — only the \`defaultValue\` prop changes. But \`defaultValue\` is only consulted on mount, so the typed value stays in the wrong row. Worse: focus and scroll position attach to the wrong item.

## The fix

Use a stable identifier:

\`\`\`tsx
<li key={item.id}>
\`\`\`

Now React tracks identity correctly. Reordering moves the DOM nodes; the input keeps its value because it's the same instance.

## When index keys are fine

If the list never reorders, never has items inserted or deleted in the middle, and contains no internal state (controlled inputs, refs, animations), index keys are safe. A static breadcrumb trail, for example. Anywhere else, use the id.

## What stable means

A "stable" key doesn't change across renders for the same logical item. Common mistakes:

- \`key={Math.random()}\` — every render is a fresh key → every item remounts
- \`key={\\\`\${item.text}-\${i}\\\`}\` — changes when text changes → remount

The id from your data layer is always the safest answer.`,

  15: `## The standard pattern

\`\`\`tsx
function PostList({ posts }: { posts: Post[] }) {
  return (
    <ul>
      {posts.map((post) => (
        <PostRow key={post.id} post={post} />
      ))}
    </ul>
  );
}
\`\`\`

That's 90% of list rendering. The interesting senior-level moves are around the key, stability, and scale.

## Picking the right key

Always something stable and unique. The row's database id beats the array index in any list that can reorder, have items inserted, or have items removed. Composite keys are fine if no single field is unique:

\`\`\`tsx
{events.map((event) => (
  <li key={\`\${event.userId}:\${event.timestamp}\`}>{event.text}</li>
))}
\`\`\`

## Don't break memoisation downstream

If \`PostRow\` is wrapped in \`React.memo\`, passing inline objects or arrow functions in its props kills the optimisation — every render gets a new reference, so memo always sees "props changed":

\`\`\`tsx
// 🚫 new function every render
<PostRow onDelete={() => delete(post.id)} />

// ✅ stable
const handleDelete = useCallback((id: string) => delete(id), []);
<PostRow onDelete={handleDelete} id={post.id} />
\`\`\`

For very small lists the optimisation isn't worth the ergonomic cost. For a virtualised feed with thousands of rows, it's the difference between smooth scroll and dropped frames.

## When to virtualise

DOM nodes are expensive. Once a list is in the thousands (or has heavy items like images and embeds), rendering all of them is wasteful — the user only sees twenty at a time. Libraries like \`react-virtual\` or \`react-window\` render only what's in (or near) the viewport:

\`\`\`tsx
import { useVirtualizer } from "@tanstack/react-virtual";

function FeedList({ items }: { items: Post[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
  });
  // … render only rowVirtualizer.getVirtualItems()
}
\`\`\`

The pattern is the same — \`map\` + key — but only over the visible window. Constant DOM size regardless of data size.`,

  16: `## In a class component

\`render()\` is the method React calls to ask the component "what should be on screen right now?" It returns Elements (or null, or a fragment), and that's it. The contract is strict:

- **Pure** — same inputs, same output
- **No side effects** — no fetches, no subscriptions, no setState
- **Idempotent** — calling it twice with the same props/state produces the same result

\`\`\`tsx
class UserCard extends React.Component<{ user: User }> {
  render() {
    return (
      <article>
        <h3>{this.props.user.name}</h3>
        <p>{this.props.user.bio}</p>
      </article>
    );
  }
}
\`\`\`

Everything else — fetching data, subscribing to events, focusing inputs — lives in lifecycle methods (\`componentDidMount\`, \`componentDidUpdate\`).

## In a function component

There *is* no separate render method. The function body itself is the render method. Hooks (\`useState\`, \`useEffect\`, \`useRef\`) replace the lifecycle methods:

\`\`\`tsx
function UserCard({ user }: { user: User }) {
  return (
    <article>
      <h3>{user.name}</h3>
      <p>{user.bio}</p>
    </article>
  );
}
\`\`\`

Same contract, less ceremony. The function runs on every render, hooks preserve state across calls, effects run after the DOM is committed.

## Why purity matters more now

With concurrent rendering React might call render speculatively — start one render, throw it away, start another. StrictMode double-invokes in dev to catch components that assume "render runs exactly once per state change". If your render has a side effect — incrementing a counter, logging an event, fetching data — the effect runs twice and bugs creep in.

The rule of thumb: **render describes the UI for the current state. Side effects describe what to do about it.** Effects, event handlers, and refs are where the doing happens.`,

  17: `## The JS root cause

JavaScript functions don't carry their \`this\` context with them. When you reference a method without calling it — passing it as a callback, say — \`this\` becomes whatever the *caller* sets it to. In strict mode (which React enforces) that's usually \`undefined\`:

\`\`\`tsx
class Counter extends React.Component {
  state = { count: 0 };

  increment() {
    this.setState({ count: this.state.count + 1 }); // \`this\` is undefined
  }

  render() {
    return <button onClick={this.increment}>+1</button>;
  }
}
\`\`\`

The \`button\` calls \`onClick()\` directly — no instance attached — and you get \`Cannot read properties of undefined (reading 'setState')\`.

## Three ways to fix it

### Bind in the constructor

\`\`\`tsx
constructor(props) {
  super(props);
  this.increment = this.increment.bind(this);
}
\`\`\`

Works. Verbose if you have lots of methods.

### Class field arrow function

\`\`\`tsx
increment = () => {
  this.setState({ count: this.state.count + 1 });
};
\`\`\`

Class fields are bound to the instance. Arrow functions resolve \`this\` lexically — so it picks up the instance from where the field is defined. No constructor needed.

### Skip the problem with function components

\`\`\`tsx
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>+1</button>;
}
\`\`\`

No \`this\`, no problem. This is what almost all new React code does.

## When you still need to know this

Legacy class components — error boundaries written before \`react-error-boundary\`, ancient enterprise codebases, the React 16 era. If you maintain that code, understanding the bind dance is unavoidable. For new code, function components remove the question.`,

  18: `## What reconciliation is

When state or props change, React renders a new tree of Elements. Reconciliation is the algorithm it uses to compare that new tree against the previous one and figure out the minimum set of DOM operations needed to bridge the difference.

## The core rules

React doesn't do a full tree diff — that's O(n³). Instead, two heuristics:

1. **Different element types produce different trees.** If the type changes (\`div\` → \`span\`, \`Card\` → \`Modal\`), React tears down the old subtree completely and builds a new one from scratch. State is lost.
2. **Stable keys identify children across renders.** When matching siblings in a list, React uses the \`key\` prop to know "this is the same item, possibly moved".

\`\`\`tsx
// Type matches → React updates the existing DOM node in place
function Toggle({ on }: { on: boolean }) {
  return <button className={on ? "on" : "off"}>Toggle</button>;
}

// Type changes → React unmounts the old, mounts the new — state is lost
function Toggle({ on }: { on: boolean }) {
  return on ? <ButtonOn /> : <ButtonOff />;
}
\`\`\`

## The subtle bug — moving subtrees

The remount-on-type-change rule extends to *where* a subtree sits in the tree. If conditional rendering moves a component under a different parent, React treats it as a different instance:

\`\`\`tsx
// 🚫 form remounts when isAdvanced changes — state inside Form is lost
{isAdvanced ? <Sidebar><Form /></Sidebar> : <Form />}

// ✅ stable position — Form keeps its state
<>
  {isAdvanced && <Sidebar />}
  <Form />
</>
\`\`\`

This is the gotcha that bit me on the Butlin's App Router migration — a layout boundary change moved the booking form into a different subtree and the form started losing in-flight state on every step. The fix was structural, not state-management.

## Why keys matter for reconciliation specifically

Inside an array, React pairs old and new children by key. Same key = same item, just possibly updated. No key = pair by index, which means inserting or reordering causes incorrect identity matching. That's the deep reason "always use stable keys" matters — it's reconciliation, not just performance.`,

  19: `## Element vs Component, the senior version

The shallow answer: Element is the data, Component is the function. The deeper answer is in what \`type\` can be on an Element, and how reconciliation treats each kind.

## What \`type\` can hold

\`\`\`ts
type ReactElement = {
  type:
    | string // host element ("div", "h1")
    | FunctionComponent
    | ComponentClass
    | typeof React.Fragment
    | typeof React.Suspense
    | LazyComponent
    | ForwardRefComponent
    | MemoComponent
    | ProviderExoticComponent;
  props: any;
  key: string | number | null;
  ref: any;
};
\`\`\`

Reconciliation branches on \`type\`:

- **String** — host element. React maps it to a DOM node.
- **Function** — calls it with props, gets back an Element subtree.
- **Class** — instantiates, calls \`render\`.
- **React.Fragment** — renders children with no wrapper.
- **React.lazy** — suspends until the module loads.
- **React.forwardRef** — passes a ref through to a child.
- **React.memo** — short-circuits re-render if props are shallow-equal.

Same Element shape, very different rendering behaviour.

## Identity matters

Two Elements with the same string \`type\` but different keys are different instances. Two Elements with different \`type\` references — even if they wrap the same component — are different instances. This is why \`React.memo(Foo) !== Foo\`, and why a fresh \`memo\` call on every render destroys memoisation:

\`\`\`tsx
function App() {
  // 🚫 new memo() every render → memoised child is a new type → remount
  const MemoFoo = React.memo(Foo);
  return <MemoFoo />;
}

// ✅ define memo once, at module scope
const MemoFoo = React.memo(Foo);

function App() {
  return <MemoFoo />;
}
\`\`\`

## Immutability

Elements are frozen plain objects. You don't mutate them — you create new ones. That's what makes reconciliation tractable: React can hold onto the previous tree and diff against the new one without worrying about external mutation.

## The mental model that pays off

Elements are values. Components are functions that produce values. The DOM is what React commits at the end of reconciliation. Treat them as three distinct layers and a lot of React stops feeling magical.`,

  20: `## What StrictMode is

A wrapper component (\`<React.StrictMode>\`) that turns on development-time checks for the subtree inside it. It does nothing in production builds — every check is stripped. In dev it intentionally surfaces problems you'd otherwise discover later, in production, under concurrent rendering or after a refactor.

## What it does

### Double-invokes certain functions

- Function component bodies
- Class \`render\` methods
- Class \`constructor\`, \`getDerivedStateFromProps\`, \`shouldComponentUpdate\`
- Reducer functions passed to \`useReducer\`
- State initialiser callbacks

If any of those have side effects, the side effect runs twice in dev. That's the point — it makes bad behaviour loud.

### Re-runs effects with a tear-down/setup cycle

Since React 18, StrictMode runs each effect's setup, then its cleanup, then setup again, simulating a remount. This catches effects that don't clean up properly:

\`\`\`tsx
useEffect(() => {
  const id = setInterval(() => console.log("tick"), 1000);
  // ❌ no cleanup → in StrictMode you'll see two intervals after first render
  return () => clearInterval(id); // ✅ cleanup makes it idempotent
}, []);
\`\`\`

If you only get one "tick" per second in StrictMode, your effect is mount-safe.

### Warns about deprecated APIs

Legacy refs (\`string\` refs), \`findDOMNode\`, legacy context API — all flagged.

## Why bother

Concurrent rendering can mount, unmount, and remount components at any time. An effect that assumed "this runs exactly once" might fire multiple times in production; a reducer with a side effect inside it might be called twice. StrictMode is your dev-time safety net for those assumptions.

## Where I always turn it on

In \`app/layout.tsx\` (Next.js) or wherever you mount the app:

\`\`\`tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <React.StrictMode>{children}</React.StrictMode>
      </body>
    </html>
  );
}
\`\`\`

Newer Next.js templates wrap StrictMode automatically. If you mentor juniors, the double-invoke is the fastest way to teach why \`useEffect\` cleanup actually matters.`,
};

async function main() {
  const file = path.join(process.cwd(), "data", "seed-react.json");
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
    `seed-react.json — added detailMd to ${added}, skipped ${skipped} (already had one).`,
  );
}

main().catch((err: unknown) => {
  console.error("Failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
