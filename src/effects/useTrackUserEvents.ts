import { Dispatch, SetStateAction, useCallback, useEffect } from 'react'
import { eventNames } from '../context/Provider'

export function useTrackUserEvents({
    setHasUserTriggeredEvent,
    setAreEventListenersCurrentlyActive,
    areEventListenersCurrentlyActive,
    hasUserTriggeredEvent,
}: {
    setHasUserTriggeredEvent: Dispatch<SetStateAction<boolean>>
    setAreEventListenersCurrentlyActive: Dispatch<SetStateAction<boolean>>
    areEventListenersCurrentlyActive: boolean
    hasUserTriggeredEvent: boolean
}) {
    const handleInteraction = useCallback(() => {
        setHasUserTriggeredEvent(true)
    }, [setHasUserTriggeredEvent])

    const addEventListeners = useCallback(() => {
        eventNames.forEach((eventName) => window.addEventListener(eventName, handleInteraction))
        setAreEventListenersCurrentlyActive(true)
    }, [handleInteraction, setAreEventListenersCurrentlyActive])
    const removeEventListeners = useCallback(() => {
        eventNames.forEach((eventName) => window.removeEventListener(eventName, handleInteraction))
        setAreEventListenersCurrentlyActive(false)
    }, [handleInteraction, setAreEventListenersCurrentlyActive])

    useEffect(() => {
        if (areEventListenersCurrentlyActive && hasUserTriggeredEvent) {
            removeEventListeners()
        }
    }, [areEventListenersCurrentlyActive, hasUserTriggeredEvent, removeEventListeners])

    useEffect(() => {
        addEventListeners()

        return () => removeEventListeners()
    }, [removeEventListeners, addEventListeners])
    return { removeEventListeners, addEventListeners }
}
