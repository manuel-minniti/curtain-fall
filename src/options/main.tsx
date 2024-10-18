import React from "react"
import App from "./options"
import createAppRoot from "@/lib/createRootApp"
import { ThemeProvider } from "@/components/ThemeProvider"

const root = createAppRoot()
root.render(
    <ThemeProvider>
        <App />
    </ThemeProvider>
)

export default root
