import { NextRouter } from 'next/router'
import { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
    const [hasUserTriggeredEvent, setHasUserTriggeredEvent] = useState(false)
    const [areEventListenersCurrentlyActive, setAreEventListenersCurrentlyActive] = useState(false)
    const [timer, setTimer] = useState(10)
    const [hasTimerExpired, setHasTimerExpired] = useState(false)
    const intervalTimer = useRef<ReturnType<typeof setInterval>>()
    const hasInteracted = hasUserTriggeredEvent || hasTimerExpired
    const handleInteraction = () => {
        setHasUserTriggeredEvent(true)
    }

    const addEventListeners = useCallback(() => {
        eventNames.forEach((eventName) => window.addEventListener(eventName, handleInteraction))
        setAreEventListenersCurrentlyActive(true)
    }, [])
    const removeEventListeners = useCallback(() => {
        if (!areEventListenersCurrentlyActive) {
            return
        }

        eventNames.forEach((eventName) => window.removeEventListener(eventName, handleInteraction))
        setAreEventListenersCurrentlyActive(false)
    }, [areEventListenersCurrentlyActive])

    const startTimer = () => {
        intervalTimer.current = setInterval(() => {
            setTimer((prevTimer) => prevTimer - 1)
        }, 1000)
    }
    const endTimer = () => {
        clearInterval(intervalTimer.current)
    }

    useEffect(() => {
        addEventListeners()

        return () => removeEventListeners()
    }, [removeEventListeners, addEventListeners])

    useEffect(() => {
        if (timer === 0) {
            setHasTimerExpired(true)
        } else {
            startTimer()

            return () => endTimer()
        }
    }, [timer])

    // Clean up event listeners and the timer once the user has interacted
    useEffect(() => {
        if (!hasUserTriggeredEvent) {
            return
        }

        removeEventListeners()
        endTimer()
    }, [hasUserTriggeredEvent, removeEventListeners])

    // Optionally watch a NextRouter for route changes
    useTrackNextRouter({
        removeEventListeners,
        setHasUserTriggeredEvent,
        addEventListeners,
        router,
        startTimer,
        endTimer,
    })

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
