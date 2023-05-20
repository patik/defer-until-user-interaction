import { createContext } from 'react'
import { DeferUntilInteractionContextProps } from './types'

export const DeferUntilInteractionContext = createContext<DeferUntilInteractionContextProps>({
    afterInteraction: () => undefined,
    hasInteracted: false,
})
