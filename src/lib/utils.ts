import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createRoot } from "react-dom/client"

import { EXTENSION_ID, EXTENSION_SHADOW_ROOT_ID } from "@/constants"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Creates a shadow root with the specified styles and returns a React root in it.
 * @param {string} styles - CSS styles to be applied to the shadow root.
 * @returns {ReactRoot} - React root rendered inside the shadow root.
 */
export function createShadowRoot(styles: string) {
    // Create a container element to hold the shadow root
    const container = document.createElement("div")
    container.id = EXTENSION_SHADOW_ROOT_ID

    // Attach a shadow root to the container element
    const shadow = container.attachShadow({ mode: "open" })

    // Create a new CSS style sheet and apply the specified styles
    const globalStyleSheet = new CSSStyleSheet()
    globalStyleSheet.replaceSync(styles)

    // Apply the style sheet to the shadow root
    shadow.adoptedStyleSheets = [globalStyleSheet]

    // Append the container element to the document body
    document.body.appendChild(container)

    // Remove the default margin from the document body
    document.body.style.margin = "0"

    // Return a React root created inside the shadow root
    return createRoot(shadow)
}

export function getExtensionRoot() {
    return document
        .getElementById(EXTENSION_SHADOW_ROOT_ID)
        ?.shadowRoot?.getElementById(EXTENSION_ID)
}
