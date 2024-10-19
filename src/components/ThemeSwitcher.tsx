import React, { useEffect } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Theme, useTheme } from "@/components/ThemeProvider"
import { getExtensionRoot } from "@/lib/utils"

export function ThemeSwitcher() {
    const [extensionRoot, setExtensionRoot] =
        React.useState<HTMLElement | null>(null)
    const { setTheme, theme } = useTheme()

    const handleValueChange = (value: Theme) => {
        setTheme(value)
    }

    useEffect(() => {
        const timer = setInterval(() => {
            const root = getExtensionRoot()
            if (root) {
                setExtensionRoot(root)
            }
        }, 50)

        return () => {
            clearInterval(timer)
        }
    }, [])

    if (!extensionRoot) {
        return null
    }

    return (
        <Select value={theme} onValueChange={handleValueChange}>
            <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Theme" />
            </SelectTrigger>

            <SelectContent align="end">
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
            </SelectContent>
        </Select>
    )
}
