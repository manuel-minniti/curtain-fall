export type RemovalActions = {
    edit?: (id: string) => void
    delete?: (id: string) => void
    toggle: (id: string, enabled: boolean) => void
}

// Selectors
export type RemovalSelector = {
    elementSelector: string
    className: string
}

export type ResetSelector = {
    elementSelector: string
    styles: { [key: string]: string }
}

export type SelectorItem = RemovalSelector | ResetSelector | string
