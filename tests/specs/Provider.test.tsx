import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeferUntilInteractionProvider } from '../../src/index'
import { useDeferUntilInteraction } from '../../src/hook'

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

describe('General functionality', () => {
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

    test('times out after 5 seconds', async () => {
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

        await waitFor(
            async () => {
                expect(screen.getByText(/I only appear using the callback/)).toBeVisible()
            },
            { timeout: 12000 }
        )

        await waitFor(async () => {
            expect(screen.getByText(/I only appear using the boolean/)).toBeVisible()
        })
        expect(() => screen.getByText(/The boolean says you have not interacted yet/)).toThrow()
    })
})
