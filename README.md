# react-defer-until-interaction

Delay loading and rendering until the user interacts with the page

## Features

* Reduces page weight by helping you render only the most important content up front
* With Next.js, it can give you fresh information after each route change, treating each page individually
* Can help to improve your Lighthouse score by deferring less important and/or heavy content until its necessary

## Installation & setup

```sh
yarn add react-defer-until-interaction

# or

npm install react-defer-until-interaction
```

Wrap your component (or the whole app) in the provider:

```tsx
import { DeferUntilInteractionProvider } from 'react-defer-until-interaction'

function App() {
    return (
        <DeferUntilInteractionProvider>
            <MyContents />
        </DeferUntilInteractionProvider>
    )
}
```

### Options

#### Next.js

In a Next.js app, add the provider to your `_app.tsx`, and pass the NextRouter:

```tsx
// _app.tsx
import { useRouter } from 'next/router'
import { DeferUntilInteractionProvider } from 'react-defer-until-interaction'

function App() {
    const router = useRouter()

    return (
        <DeferUntilInteractionProvider router={router}>
            <MyContents />
        </DeferUntilInteractionProvider>
    )
}
```

This will enable the module to re-run on each route change, as if the page was freshly loaded in the browser.

#### Timeout

The hook will indicate that the user has interacted with the page, even if the user has not actually clicked/scrolled/etc, once 10 seconds have elapsed. This is meant as a safety fallback in case the events are somehow not heard, and for pages that are opened in the background (i.e. in a separate browser tab).

You may override the default timeout of 10 seconds by passing your own value (in milliseconds):

```tsx
import { DeferUntilInteractionProvider } from 'react-defer-until-interaction'

function App() {
    return (

        <DeferUntilInteractionProvider timeout={5000} /* Assume that interaction has happened after 5 seconds */>
            <MyContents />
        </DeferUntilInteractionProvider>
    )
}
```

You can also set `timeout={0}` to disable the timer.

## Usage

The `useDeferUntilInteraction` hook exposes two properties, a boolean and a function.

* `hasInteracted` will be true after the user interacts with the page, or when 10 seconds have elapsed
* `afterInteraction()` takes a callback and only invokes it after the user has interacted with the page, or when 10 seconds have elapsed

```tsx
import { useDeferUntilInteraction } from 'react-defer-until-interaction'

function MyComponent() {
    const { hasInteracted, afterInteraction } = useDeferUntilInteraction()

    return (
        <p>You {hasInteracted ? 'have' : 'have not'} interacted with the page.</p>
        {afterInteraction(() => <BelowTheFold />)}
    )
}
```
