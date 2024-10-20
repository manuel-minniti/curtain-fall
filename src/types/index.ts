export type RemovalActions = {
    edit?: (id: string) => void
    delete?: (id: string) => void
    toggle: (id: string, enabled: boolean) => void
}

// Selectors
export type ClassRemoval = {
    elementSelector: string
    className: string
}

export type StyleReset = {
    elementSelector: string
    styles: React.CSSProperties
}

export type RemovalSelector = ClassRemoval | StyleReset
export type RemovalItem = ClassRemoval | StyleReset | string
