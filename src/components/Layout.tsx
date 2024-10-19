import React, { PropsWithChildren } from "react"
import { TooltipProvider } from "./ui/tooltip"
import { Toaster } from "./ui/toaster"
import { ThemeProvider } from "./ThemeProvider"

export default function Layout({ children }: PropsWithChildren) {
    return (
        <ThemeProvider>
            <TooltipProvider delayDuration={0}>
                <Toaster />
                <div className="bg-background text-foreground">{children}</div>
            </TooltipProvider>
        </ThemeProvider>
    )
}
