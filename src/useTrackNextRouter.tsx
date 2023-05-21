import { NextRouter } from 'next/router'
import { Dispatch, SetStateAction, useCallback, useEffect } from 'react'

export function useTrackNextRouter({
    areEventListenersCurrentlyActive,
    removeEventListeners,
    setHasUserTriggeredEvent,
    addEventListeners,
    router,
    startTimer,
    endTimer,
}: {
    areEventListenersCurrentlyActive: boolean
    removeEventListeners: () => void
    setHasUserTriggeredEvent: Dispatch<SetStateAction<boolean>>
    addEventListeners: () => void
    router: NextRouter | undefined
    startTimer: () => void
    endTimer: () => void
}) {
    const onRouteChangeStart = useCallback(() => {
        // Clean up the existing event listeners and timer
        if (areEventListenersCurrentlyActive) {
            removeEventListeners()
            endTimer()
        }

        // Let the caller know that the page is soon going away so they can avoid loading anything more
        setHasUserTriggeredEvent(false)
    }, [areEventListenersCurrentlyActive, endTimer, removeEventListeners, setHasUserTriggeredEvent])

    const onRouteChangeComplete = useCallback(() => {
        // This tiny delay allows us to skip past the scroll event that will be fired when Next scrolls the page to the top
        requestAnimationFrame(() => addEventListeners())
        startTimer()
    }, [addEventListeners, startTimer])

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
    }, [onRouteChangeComplete, onRouteChangeStart, router])
}
