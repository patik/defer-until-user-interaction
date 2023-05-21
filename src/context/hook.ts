import { useContext } from 'react'
import { DeferUntilInteractionContext } from './Context'
import { ContextProps } from '../types'

/**
 * Hook that provides access to the values of the DeferUntilInteraction context
 */
export function useDeferUntilInteraction(): ContextProps {
    return useContext(DeferUntilInteractionContext)
}
