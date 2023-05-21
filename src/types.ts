import { ReactNode } from 'react'

export interface ContextProps {
    afterInteraction: <T>(callback: () => T) => T | undefined
    hasInteracted: boolean
}

export interface ProviderProps {
    timeout?: number
    children: ReactNode
}
