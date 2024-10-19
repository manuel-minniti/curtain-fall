import React, { createContext, useContext, useEffect, useState } from "react"

export type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}

type ThemeProviderState = {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function prefersDarkMode(): boolean {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
}

export function ThemeProvider({
    children,
    defaultTheme = __DEV__ ? "dark" : "system",
    storageKey = "vite-ui-theme",
    ...props
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(defaultTheme)

    useEffect(() => {
        chrome.storage.local.get(storageKey, (result) => {
            if (result[storageKey]) {
                setTheme(result[storageKey])
            } else {
                setTheme("system")
            }
        })
    }, [])

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            chrome.storage.local.set({ [storageKey]: theme })
            setTheme(theme)
        }
    }

    const isSystemDark = prefersDarkMode()
    const themeClass =
        theme === "system" ? (isSystemDark ? "dark" : "light") : theme

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            <div id={__EXTENSION_ID__} className={themeClass}>
                {children}
            </div>
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")

    return context
}
