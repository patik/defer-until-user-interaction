import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeferUntilInteractionProvider } from '../../src/index'
import { useDeferUntilInteraction } from '../../src/context/hook'

function TestComponent() {
    const { afterInteraction, hasInteracted } = useDeferUntilInteraction()

    return (
        <>
            <p>You should see me all the time</p>
            {afterInteraction(() => (
                <p>I only appear using the callback</p>
            ))}
            {hasInteracted ? (
                <p>I only appear using the boolean</p>
            ) : (
                <p>The boolean says you have not interacted yet</p>
            )}
        </>
    )
}

describe('Detecting user interaction', () => {
    test('Clicking on the page causes the boolean and callback to change their value', async () => {
        render(
            <DeferUntilInteractionProvider>
                <TestComponent />
            </DeferUntilInteractionProvider>
        )

        await waitFor(async () => {
            expect(screen.getByText('You should see me all the time')).toBeVisible()
        })

        expect(screen.getByText('The boolean says you have not interacted yet')).toBeVisible()
        expect(() => screen.getByText(/I only appear using the boolean/)).toThrow()
        expect(() => screen.getByText('I only appear using the callback')).toThrow()

        await userEvent.click(document.body)

        await waitFor(async () => {
            expect(screen.getByText(/I only appear using the callback/)).toBeVisible()
        })

        await waitFor(async () => {
            expect(screen.getByText(/I only appear using the boolean/)).toBeVisible()
        })
        expect(() => screen.getByText(/The boolean says you have not interacted yet/)).toThrow()
    })
})

describe('Timeout', () => {
    test('ignores timer when it’s disabled', async () => {
        render(
            <DeferUntilInteractionProvider timeout={0}>
                <TestComponent />
            </DeferUntilInteractionProvider>
        )

        await waitFor(async () => {
            expect(screen.getByText('You should see me all the time')).toBeVisible()
        })

        await waitFor(
            async () => {
                expect(() => screen.getByText(/I only appear using the boolean/)).toThrow()
            },
            { timeout: 5000 }
        )
    })

    test('times out after 3 seconds', async () => {
        render(
            <DeferUntilInteractionProvider timeout={3000}>
                <TestComponent />
            </DeferUntilInteractionProvider>
        )

        await waitFor(async () => {
            expect(screen.getByText('You should see me all the time')).toBeVisible()
        })

        expect(screen.getByText('The boolean says you have not interacted yet')).toBeVisible()
        expect(() => screen.getByText(/I only appear using the boolean/)).toThrow()
        expect(() => screen.getByText('I only appear using the callback')).toThrow()

        await waitFor(
            async () => {
                expect(screen.getByText(/I only appear using the callback/)).toBeVisible()
            },
            { timeout: 4000 }
        )

        await waitFor(async () => {
            expect(screen.getByText(/I only appear using the boolean/)).toBeVisible()
        })
        expect(() => screen.getByText(/The boolean says you have not interacted yet/)).toThrow()
    })

    test('timer stops after the user clicks', async () => {
        const callbackMock = jest.fn()

        function TimerTest() {
            const { afterInteraction } = useDeferUntilInteraction()
            afterInteraction(() => callbackMock())
            return <p>{afterInteraction(() => 'alpha bravo')}</p>
        }

        render(
            <DeferUntilInteractionProvider timeout={3000}>
                <TimerTest />
            </DeferUntilInteractionProvider>
        )

        await userEvent.click(document.body)

        await waitFor(async () => {
            expect(screen.getByText(/alpha bravo/)).toBeVisible()
        })

        expect(callbackMock).toHaveBeenCalledTimes(2)

        // Store the number of calls at this point in time
        const callCount = callbackMock.mock.calls.length

        // Wait a while to ensure the timer doesn't cause our callback to run again
        await Promise.resolve(new Promise((resolve) => setTimeout(resolve, 3000)))

        await waitFor(async () => {
            expect(callbackMock).toHaveBeenCalledTimes(callCount)
        })
    })
})
