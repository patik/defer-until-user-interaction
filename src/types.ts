import { ReactNode } from 'react'

export interface DeferUntilInteractionContextProps {
    afterInteraction: <T>(callback: () => T) => T | undefined
    hasInteracted: boolean
}
export interface DeferUntilInteractionProviderProps {
    children: ReactNode
}
