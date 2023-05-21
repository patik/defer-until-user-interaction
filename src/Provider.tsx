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
export function Provider({ router, timeout = 10000, children }: ProviderProps & { router?: NextRouter }): ReactElement {
    const [hasUserTriggeredEvent, setHasUserTriggeredEvent] = useState(false)
    const [areEventListenersCurrentlyActive, setAreEventListenersCurrentlyActive] = useState(false)
    const isTimerDisabledByCaller = useRef(timeout === 0).current
    const intervalTimer = useRef<ReturnType<typeof setInterval>>()
    const [timer, setTimer] = useState(timeout)
    const [hasTimerExpired, setHasTimerExpired] = useState(false)
    const hasInteracted = hasUserTriggeredEvent || hasTimerExpired
    const handleInteraction = () => {
        setHasUserTriggeredEvent(true)
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
        if (areEventListenersCurrentlyActive && hasUserTriggeredEvent) {
            removeEventListeners()
        }
    }, [areEventListenersCurrentlyActive, hasUserTriggeredEvent, removeEventListeners])

    useEffect(() => {
        addEventListeners()

        return () => removeEventListeners()
    }, [removeEventListeners, addEventListeners])

    const startTimer = useCallback(() => {
        if (isTimerDisabledByCaller) {
            return
        }

        // Update the state once per second
        intervalTimer.current = setInterval(() => {
            setTimer((prevTimer) => prevTimer - 1000)
        }, 1000)
    }, [isTimerDisabledByCaller])
    const endTimer = useCallback(() => {
        if (isTimerDisabledByCaller) {
            return
        }

        clearInterval(intervalTimer.current)
    }, [isTimerDisabledByCaller])

    useEffect(() => {
        if (isTimerDisabledByCaller) {
            return
        }

        if (timer === 0) {
            setHasTimerExpired(true)
        } else {
            startTimer()

            return () => endTimer()
        }
    }, [endTimer, isTimerDisabledByCaller, startTimer, timer])

    // Optionally watch NextRouter for route changes
    useTrackNextRouter({
        areEventListenersCurrentlyActive,
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
