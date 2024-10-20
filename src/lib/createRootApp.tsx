import { Root } from "react-dom/client"
import { createShadowRoot } from "./utils"

// @ts-expect-error: CSS types missing
import styles from "../styles.css?inline"

import { EXTENSION_SHADOW_ROOT_ID } from "@/constants"

if (__DEV__) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).chrome = await import("../mocks/chrome").then(
        (module) => module.default
    )
}

export default function createAppRoot(): Root {
    return createShadowRoot(styles)
}

export function getExtensionRoot() {
    return document
        .getElementById(EXTENSION_SHADOW_ROOT_ID)
        ?.shadowRoot?.getElementById(__EXTENSION_ID__)
}
