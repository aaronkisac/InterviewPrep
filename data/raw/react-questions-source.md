# React Interview Questions — raw source

Source dump (FullStack.Cafe / sudheerj / Pau1fitz style). Q1–Q59 carry scraped
answers (Q30 blank); Q60–Q92 are titles only ("Read answer on FullStack.Cafe").
Difficulty stars: ⭐ entry · ⭐⭐ mid · ⭐⭐⭐ senior.

---

#### Q1: What is React? ⭐
React is an open-source JavaScript library created by Facebook for building complex, interactive UIs in web and mobile applications. React's core purpose is to build UI components; it is often referred to as just the "V" (View) in an "MVC" architecture.

#### Q2: How would you write an inline style in React? ⭐
`<div style={{ height: 10 }}>`

#### Q3: What is JEST? ⭐
Jest is a JavaScript unit testing framework made by Facebook based on Jasmine; provides automated mock creation and a jsdom environment. Often used for testing React components.

#### Q4: What are the advantages of ReactJS? ⭐
Virtual DOM performance, JSX readability, client + server rendering, easy integration as a view library, easy to test.

#### Q5: How to write comments in ReactJS? ⭐
JSX comments are wrapped in curly braces: `{/* comment */}`, single or multi-line.

#### Q6: What is context? ⭐
Context provides a way to pass data through the component tree without passing props manually at every level (e.g. authenticated user, locale, theme).

#### Q7: What is virtual DOM? ⭐
The virtual DOM (VDOM) is an in-memory representation of the real DOM, synced via a process called reconciliation.

#### Q8: How does React work? ⭐
React builds a virtual DOM; on state change it diffs the VDOM, then reconciliation applies the minimal set of changes to the real DOM.

#### Q9: What is the use of refs? ⭐
A ref returns a reference to an element. Avoid in most cases; useful for direct DOM access or a component instance.

#### Q10: What is props in ReactJS? ⭐
Props are inputs to a component — single values or objects passed from parent to child, similar to HTML attributes. Read-only.

#### Q11: What are the major features of ReactJS? ⭐
Virtual DOM, server-side rendering support, unidirectional data flow, reusable/composable components.

#### Q12: What is ReactJS? ⭐
An open-source frontend JavaScript library for building user interfaces, especially single-page applications. Handles the view layer.

#### Q13: What are props in React? ⭐
Properties passed into a child component from its parent; read-only.

#### Q14: What is Flux? ⭐⭐
A unidirectional application data-flow paradigm popular in early React; mostly superseded by Redux.

#### Q15: How error boundaries handled in React (15)? ⭐⭐
React 15 had basic support via `unstable_handleError`; renamed `componentDidCatch` from React 16.

#### Q16: What are the limitations of ReactJS? ⭐⭐
View library not a framework, learning curve, extra config for MVC integration, JSX/inline templating complexity, over-engineering risk.

#### Q17: What's the difference between an "Element" and a "Component" in React? ⭐⭐
An element is an object describing what to render. A component is a function/class that accepts input and returns elements.

#### Q18: What are stateful components? ⭐⭐
A component whose behaviour depends on its state. Historically class components with state set in the constructor.

#### Q19: What are stateless components? ⭐⭐
A component whose behaviour is independent of state. Functional components preferred unless lifecycle is needed.

#### Q20: What are portals in ReactJS? ⭐⭐
`ReactDOM.createPortal(child, container)` renders children into a DOM node outside the parent's hierarchy.

#### Q21: What are fragments? ⭐⭐
`<React.Fragment>` (or `<>`) groups children without adding extra DOM nodes.

#### Q22: Why is it necessary to capitalize the components? ⭐⭐
Components are constructors, not DOM elements; lowercase names are treated as DOM tags.

#### Q23: What is reconciliation? ⭐⭐
When props/state change, React compares the new element tree with the previous one and updates the DOM only where needed.

#### Q24: What is the purpose of using super constructor with props argument? ⭐⭐
`super(props)` must be called before `this`; passing props lets you access `this.props` inside the constructor.

#### Q25: When to use a Class Component over a Functional Component? ⭐⭐
Historically, class for state/lifecycle; functional otherwise (now hooks cover both).

#### Q26: What are the advantages of using React? ⭐⭐
Predictable rendering, JSX readability, server-side rendering for SEO/perf, easy testing, view-only so framework-agnostic.

#### Q27: What are Higher-Order components? ⭐⭐
A HOC is a function that takes a component and returns a new component — for code reuse, render hijacking, props/state manipulation.

#### Q28: What are controlled components? ⭐⭐
A component whose form inputs are driven by React state, with a change handler for every mutation.

#### Q29: What is the difference between a Presentational component and a Container component? ⭐⭐
Presentational = how things look (props in, little state). Container = how things work (data + behaviour, often stateful).

#### Q30: What do you like about React? ⭐⭐
(blank in source)

#### Q31: How to create refs? ⭐⭐
`React.createRef()` assigned to an instance property, attached via the `ref` attribute; callback refs also work, including in functional components.

#### Q32: What are the differences between a class component and functional component? ⭐⭐
Class supports state/lifecycle; functional (stateless) is a pure function of props — also called dumb/presentational.

#### Q33: How is React different from AngularJS (1.x)? ⭐⭐
AngularJS extends HTML with directives/controllers/services and is opinionated; React focuses only on components and is architecture-agnostic.

#### Q34: What happens during the lifecycle of a React component? ⭐⭐
Three phases: initialization, state/property updates, destruction.

#### Q35: What is the difference between state and props? ⭐⭐
State is a mutable data structure owned by the component; props are immutable configuration received from a parent.

#### Q36: What is inline conditional expressions? ⭐⭐
Conditionally render with `if`, ternaries, or `&&` inside JSX curly braces.

#### Q37: How to pass a parameter to an event handler or callback? ⭐⭐
Wrap with an arrow function `onClick={() => this.handleClick(id)}` or use `.bind(this, id)`.

#### Q38: What is the purpose of callback function as an argument of setState? ⭐⭐
It runs after `setState` finishes and the component re-renders, since `setState` is asynchronous.

#### Q39: What happens when you call "setState"? ⭐⭐
React merges the object into state, kicks off reconciliation, builds a new element tree, diffs it, and applies minimal DOM updates.

#### Q40: What is the difference between state and props? ⭐⭐
Both are plain JS objects influencing render output; props are passed in like function args, state is managed internally like local variables.

#### Q41: What is state in ReactJS? ⭐⭐
An object holding information that may change over a component's lifetime; keep it minimal.

#### Q42: What are refs used for in React? ⭐⭐
An escape hatch for direct access to a DOM element or component instance; works with class and functional components.

#### Q43: When rendering a list what is a key and what is its purpose? ⭐⭐
Keys give list items a stable identity so React can tell which changed/added/removed; use stable IDs, not indexes when reordering.

#### Q44: How to create components in ReactJS? ⭐⭐
Functional components (pure functions returning elements) or class components extending `React.Component`.

#### Q45: What is the difference between Element and Component? ⭐⭐
An element is a cheap immutable object describing UI; a component is a class/function taking props and returning an element tree.

#### Q46: What is JSX? ⭐⭐
A syntax extension (JavaScript XML) giving HTML-like templating that transpiles to `createElement` calls.

#### Q47: Describe how events are handled in React. ⭐⭐
React wraps native events in `SyntheticEvent` for cross-browser consistency and uses a single top-level listener (event delegation).

#### Q48: Where in a React component should you make an AJAX request? ⭐⭐
In `componentDidMount` (class) — guarantees the component is mounted before `setState`.

#### Q49: What is the difference between component and container in react Redux? ⭐⭐
A component describes UI; a container is a component connected to a Redux store, receiving state and dispatching actions.

#### Q50: Where is the state kept in a React + Redux application? ⭐⭐
In the store.

#### Q51: What is the difference between React Native and React? ⭐⭐
React is a JS library for web UIs; React Native compiles to native mobile components.

#### Q52: How do we pass a property from a parent component props to a child component? ⭐⭐
`<ChildComponent someProp={props.someProperty} />`

#### Q53: What is the point of Redux? ⭐⭐
Predictable, maintainable application state management in asynchronous web apps.

#### Q54: What does it mean for a component to be mounted in React? ⭐⭐
It has a corresponding element created in the DOM and is connected to it.

#### Q55: What is Flow? ⭐⭐
A static type checker for JavaScript created by Facebook, catching errors like null misuse.

#### Q56: What happens when you call setState? ⭐⭐
State is merged and updated asynchronously; React marks the component + children for re-render, possibly batching updates.

#### Q57: What's the difference between a controlled component and an uncontrolled one in React? ⭐⭐
Controlled = state driven by React; uncontrolled = maintains its own internal state (e.g. a textarea value).

#### Q58: How would you prevent a component from rendering in React? ⭐⭐
Return `null` from the render method.

#### Q59: How do you prevent the default behavior in an event callback in React? ⭐⭐
Call `e.preventDefault()` on the event passed into the callback.

#### Q60: What is the difference between createElement and cloneElement? ⭐⭐⭐
(answer not in source)

#### Q61: What's an alternative way to avoid having to bind to this in event callback methods? ⭐⭐⭐
(answer not in source)

#### Q62: What are some limitations of things you shouldn't do in the component's render method? ⭐⭐⭐
(answer not in source)

#### Q63: What is the point of using keys in React? ⭐⭐⭐
(answer not in source)

#### Q64: What's the typical pattern for rendering a list of components from an array of data? ⭐⭐⭐
(answer not in source)

#### Q65: What is the render method for? ⭐⭐⭐
(answer not in source)

#### Q66: Why do class methods need to be bound to a class instance? ⭐⭐⭐
(answer not in source)

#### Q67: What is reconciliation in React? ⭐⭐⭐
(answer not in source)

#### Q68: What's the difference between an Element and a Component in React? ⭐⭐⭐
(answer not in source)

#### Q69: What is StrictMode in React? ⭐⭐⭐
(answer not in source)

#### Q70: What is useState() in React? ⭐⭐⭐
(answer not in source)

#### Q71: What is the point of shouldComponentUpdate() method? ⭐⭐⭐
(answer not in source)

#### Q72: What are PropTypes in React? ⭐⭐⭐
(answer not in source)

#### Q73: What's the difference between useRef and createRef? ⭐⭐⭐
(answer not in source)

#### Q74: What are React Hooks? ⭐⭐⭐
(answer not in source)

#### Q75: What is ReactDOM? ⭐⭐⭐
(answer not in source)

#### Q76: What are advantages of using React Hooks? ⭐⭐⭐
(answer not in source)

#### Q77: What do these three dots (...) in React do? ⭐⭐⭐
(answer not in source)

#### Q78: What are typical middleware choices for handling asynchronous calls in Redux? ⭐⭐⭐
(answer not in source)

#### Q79: What's the difference between a "smart" component and a "dumb" component? ⭐⭐⭐
(answer not in source)

#### Q80: Name the different lifecycle methods. ⭐⭐⭐
(answer not in source)

#### Q81: What's the typical flow of data like in a React + Redux app? ⭐⭐⭐
(answer not in source)

#### Q82: What are controlled components? ⭐⭐⭐
(answer not in source)

#### Q83: What is state in react? ⭐⭐⭐
(answer not in source)

#### Q84: How do you tell React to build in Production mode and what will that do? ⭐⭐⭐
(answer not in source)

#### Q85: What is a higher order component? ⭐⭐⭐
(answer not in source)

#### Q86: What is the difference between createElement and cloneElement? ⭐⭐⭐
(answer not in source)

#### Q87: What are the advantages of React over VueJS? ⭐⭐⭐
(answer not in source)

#### Q88: What advantages are using arrow functions? ⭐⭐⭐
(answer not in source)

#### Q89: What are error boundaries in ReactJS (16)? ⭐⭐⭐
(answer not in source)

#### Q90: What are Pure Components? ⭐⭐⭐
(answer not in source)

#### Q91: Given the code defined above, can you identify two problems? ⭐⭐⭐
(answer not in source)

#### Q92: What are stateless components? ⭐⭐⭐
(answer not in source)
