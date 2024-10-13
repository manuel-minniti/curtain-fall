import React from "react"
import { createShadowRoot } from "../lib/utils"
import styles from "../styles.css?inline"

import PopupEdit from "./popupEdit"

if (__DEV__) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).chrome = await import("../mocks/chrome").then(
        (module) => module.default
    )
}

const root = createShadowRoot(styles)
root.render(<PopupEdit />)

export default root
