import { Root } from "react-dom/client"
import { createShadowRoot } from "./utils"

// @ts-expect-error: CSS types missing
import styles from "../styles.css?inline"

if (__DEV__) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).chrome = await import("../mocks/chrome").then(
        (module) => module.default
    )
}

export default function createAppRoot(): Root {
    return createShadowRoot(styles)
}
