import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeferUntilInteractionProvider } from '../../src/index'
import { useDeferUntilInteraction } from '../../src/context/hook'
import { useRouter } from 'next/router'

jest.mock('next/router', () => require('next-router-mock'))

function InnerTestComponent() {
    const router = useRouter()
    const { afterInteraction, hasInteracted } = useDeferUntilInteraction()

    return (
        <>
            <button onClick={() => router.replace('/')}>Change route</button>
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

function TestComponent() {
    const router = useRouter()

    return (
        <DeferUntilInteractionProvider router={router}>
            <InnerTestComponent />
        </DeferUntilInteractionProvider>
    )
}

describe('NextRouter', () => {
    test('Changing the route causes the value to be reset', async () => {
        render(<TestComponent />)

        expect(screen.getByText('The boolean says you have not interacted yet')).toBeVisible()
        expect(() => screen.getByText(/I only appear using the boolean/)).toThrow()
        expect(() => screen.getByText('I only appear using the callback')).toThrow()

        await userEvent.click(document.body)

        await waitFor(
            async () => {
                expect(screen.getByText(/I only appear using the callback/)).toBeVisible()
            },
            { timeout: 2000 }
        )

        await waitFor(async () => {
            expect(screen.getByText(/I only appear using the boolean/)).toBeVisible()
        })
        expect(() => screen.getByText(/The boolean says you have not interacted yet/)).toThrow()

        // Route change
        await userEvent.click(screen.getByText('Change route'))

        // Now all of the changes from above have been reversed—the elements that were hidden are now displayed, and vice versa
        await waitFor(async () => {
            expect(screen.getByText('The boolean says you have not interacted yet')).toBeVisible()
        })

        expect(() => screen.getByText(/I only appear using the boolean/)).toThrow()
        expect(() => screen.getByText('I only appear using the callback')).toThrow()
    })
})
