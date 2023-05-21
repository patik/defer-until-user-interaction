import { Dispatch, MutableRefObject, SetStateAction, useCallback, useEffect } from 'react'

export function useTrackTimer({
    isTimerDisabledByCaller,
    intervalTimer,
    setTimer,
    timer,
    setHasTimerExpired,
}: {
    isTimerDisabledByCaller: boolean
    intervalTimer: MutableRefObject<NodeJS.Timer | undefined>
    setTimer: Dispatch<SetStateAction<number>>
    timer: number
    setHasTimerExpired: Dispatch<SetStateAction<boolean>>
}) {
    const startTimer = useCallback(() => {
        if (isTimerDisabledByCaller) {
            return
        }

        // Update the state once per second
        intervalTimer.current = setInterval(() => {
            setTimer((prevTimer) => prevTimer - 1000)
        }, 1000)
    }, [intervalTimer, isTimerDisabledByCaller, setTimer])
    const endTimer = useCallback(() => {
        if (isTimerDisabledByCaller) {
            return
        }

        clearInterval(intervalTimer.current)
    }, [intervalTimer, isTimerDisabledByCaller])

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
    }, [endTimer, isTimerDisabledByCaller, setHasTimerExpired, startTimer, timer])
    return { startTimer, endTimer }
}
