import { NextRouter } from 'next/router'
import { ReactElement, useEffect, useMemo, useRef, useState } from 'react'
import { useTrackNextRouter } from '../effects/useTrackNextRouter'
import { useTrackTimer } from '../effects/useTrackTimer'
import { useTrackUserEvents } from '../effects/useTrackUserEvents'
import { ProviderProps } from '../types'
import { DeferUntilInteractionContext } from './Context'

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
    const { removeEventListeners, addEventListeners } = useTrackUserEvents({
        setHasUserTriggeredEvent,
        setAreEventListenersCurrentlyActive,
        areEventListenersCurrentlyActive,
        hasUserTriggeredEvent,
    })

    const { startTimer, endTimer } = useTrackTimer({
        isTimerDisabledByCaller,
        intervalTimer,
        setTimer,
        timer,
        setHasTimerExpired,
    })

    // Stop the timers when the user interacts
    useEffect(() => {
        if (hasUserTriggeredEvent) {
            endTimer()
            return
        }
    }, [endTimer, hasUserTriggeredEvent, timer])

    // Remove the event listeners when the timer runs out
    useEffect(() => {
        if (hasTimerExpired) {
            removeEventListeners()
            return
        }
    }, [hasTimerExpired, removeEventListeners])

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
