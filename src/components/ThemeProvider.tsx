import { EXTENSION_ID } from "@/constants"
import React, { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

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

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "vite-ui-theme",
    ...props
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(defaultTheme)

    useEffect(() => {
        function applySystemTheme() {
            const prefersDark = window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches
            setTheme(prefersDark ? "dark" : "light")
        }

        chrome.storage.local.get(storageKey, (result) => {
            if (result[storageKey]) {
                if (result[storageKey] === "system") {
                    applySystemTheme()
                } else {
                    setTheme(result[storageKey])
                }
            } else {
                applySystemTheme()
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

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            <div id={EXTENSION_ID} className={theme}>
                <div className="bg-background text-foreground">{children}</div>
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
