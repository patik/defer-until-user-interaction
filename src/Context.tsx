import { createContext } from 'react'
import { ContextProps } from './types'

export const DeferUntilInteractionContext = createContext<ContextProps>({
    afterInteraction: () => undefined,
    hasInteracted: false,
})
