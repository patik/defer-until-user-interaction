import { useContext } from 'react'
import { DeferUntilInteractionContext } from './Context'
import { DeferUntilInteractionContextProps } from './types'

/**
 * Hook that provides access to the values of the DeferUntilInteraction context
 */
export function useDeferUntilInteraction(): DeferUntilInteractionContextProps {
    return useContext(DeferUntilInteractionContext)
}
