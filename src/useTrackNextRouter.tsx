import { NextRouter } from 'next/router'
import { Dispatch, SetStateAction, useCallback, useEffect } from 'react'

export function useTrackNextRouter(
    areEventListenersCurrentlyActive: boolean,
    removeEventListeners: () => void,
    setHasInteracted: Dispatch<SetStateAction<boolean>>,
    addEventListeners: () => void,
    router: NextRouter | undefined
) {
    const onRouteChangeStart = useCallback(() => {
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
}
