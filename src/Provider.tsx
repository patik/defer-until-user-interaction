import { NextRouter } from 'next/router'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { DeferUntilInteractionContext } from './Context'
import { ProviderProps } from './types'

// These are the events that we assume will occur when the user interacts with the page
const eventNames = ['click', 'touchstart', 'scroll']

/**
 * Tracks whether or not the user has interacted with the current page
 *
 * Returns a boolean as well as a function which takes a callback that will only be invoked when the user has interacted with the page
 *
 * Pass useRouter if you want it to reset the value when the route changes (recommended for Next.js apps)
 */
export function Provider({ useRouter, children }: ProviderProps & { useRouter?: () => NextRouter }): ReactElement {
    const [hasInteracted, setHasInteracted] = useState(false)
    const [areEventListenersCurrentlyActive, setAreEventListenersCurrentlyActive] = useState(false)
    const handleInteraction = () => {
        console.log('xyz the user has interacted!')
        setHasInteracted(true)
    }
    const addEventListeners = useCallback(() => {
        eventNames.forEach((eventName) => window.addEventListener(eventName, handleInteraction))
        setAreEventListenersCurrentlyActive(true)
    }, [])
    const removeEventListeners = useCallback(() => {
        eventNames.forEach((eventName) => window.removeEventListener(eventName, handleInteraction))
        setAreEventListenersCurrentlyActive(false)
    }, [])

    useEffect(() => {
        if (areEventListenersCurrentlyActive && hasInteracted) {
            removeEventListeners()
        }
    }, [areEventListenersCurrentlyActive, hasInteracted, removeEventListeners])

    useEffect(() => {
        console.log('xyz Adding event listeners ', typeof window)
        addEventListeners()

        return () => removeEventListeners()
    }, [removeEventListeners, addEventListeners])

    const onRouteChangeStart = useCallback(() => {
        console.log('xyz resetting value because of route change')

        // If the user hasn't interacted since the last route change, then it means we haven't cleaned up the existing event listeners yet, so do that first before we re-add them below
        if (areEventListenersCurrentlyActive) {
            removeEventListeners()
        }

        setHasInteracted(false)
    }, [areEventListenersCurrentlyActive, removeEventListeners])

    const onRouteChangeComplete = useCallback(() => {
        // This tiny delay allows us to skip past the scroll event that will be fired when Next scrolls the page to the top
        requestAnimationFrame(() => addEventListeners())
    }, [addEventListeners])

    const router = useRouter ? useRouter() : null

    useEffect(() => {
        if (!router) {
            return
        }

        router.events.on('routeChangeStart', onRouteChangeStart)
        router.events.on('routeChangeComplete', onRouteChangeComplete)

        return () => {
            router.events.off('routeChangeStart', onRouteChangeStart)
            router.events.off('routeChangeComplete', onRouteChangeComplete)
        }
    }, [onRouteChangeComplete, onRouteChangeStart, router?.events])

    // This function will only invoke its callback when the page has been interacted with
    const afterInteraction = useMemo(
        () =>
            hasInteracted
                ? function <T>(callback: () => T) {
                      return callback()
                  }
                : () => undefined,
        [hasInteracted]
    )

    return (
        <DeferUntilInteractionContext.Provider value={{ afterInteraction, hasInteracted }}>
            {children}
        </DeferUntilInteractionContext.Provider>
    )
}
