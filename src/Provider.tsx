import { NextRouter } from 'next/router'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { DeferUntilInteractionContext } from './Context'
import { ProviderProps } from './types'
import { useTrackNextRouter } from './useTrackNextRouter'

// These are the events that we assume will occur when the user interacts with the page
const eventNames = ['click', 'touchstart', 'scroll']

/**
 * Tracks whether or not the user has interacted with the current page
 *
 * Returns a boolean as well as a function which takes a callback that will only be invoked when the user has interacted with the page
 *
 * Pass a NextRouter if you want it to reset the value when the route changes (recommended for Next.js apps)
 */
export function Provider({ router, children }: ProviderProps & { router?: NextRouter }): ReactElement {
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
        addEventListeners()

        return () => removeEventListeners()
    }, [removeEventListeners, addEventListeners])

    // Optionally watch a NextRouter for route changes
    useTrackNextRouter(
        areEventListenersCurrentlyActive,
        removeEventListeners,
        setHasInteracted,
        addEventListeners,
        router
    )

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
