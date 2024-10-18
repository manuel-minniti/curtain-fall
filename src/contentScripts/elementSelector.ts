import {
    ACTION_ELEMENT_SELETED,
    ACTION_START_SELECTING,
    ACTION_STOP_SELECTING
} from "@/constants"
import html2canvas from "html2canvas-pro"

if (__DEV__) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).chrome = await import("../mocks/chrome").then(
        (module) => module.default
    )
}

let isSelecting = false
let highlightDiv: HTMLElement | null = null

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === ACTION_START_SELECTING) {
        isSelecting = true
        bindListeners()
        sendResponse({ status: "selection started" })
    } else if (request.action === ACTION_STOP_SELECTING) {
        isSelecting = false
        cleanUp()
        sendResponse({ status: "selection stopped" })
    }
})

function bindListeners() {
    document.addEventListener("mouseover", highlightElement)
    document.addEventListener("click", selectElement)
    document.addEventListener("keydown", cancelOnEscape)
}

function unbindListeners() {
    document.removeEventListener("mouseover", highlightElement)
    document.removeEventListener("click", selectElement)
    document.removeEventListener("keydown", cancelOnEscape)
}

function removeHighlight() {
    if (highlightDiv) {
        highlightDiv.remove()
        highlightDiv = null
    }
}

function cleanUp() {
    unbindListeners()
    removeHighlight()
}

function cancelOnEscape(event: KeyboardEvent) {
    if (event.key === "Escape") {
        isSelecting = false
        cleanUp()
    }
}

function highlightElement(event: MouseEvent) {
    if (!isSelecting) return

    event.preventDefault()
    event.stopPropagation()

    const element = event.target as HTMLElement
    if (highlightDiv) {
        highlightDiv.remove()
    }

    highlightDiv = document.createElement("div")
    const rect = element.getBoundingClientRect()

    Object.assign(highlightDiv.style, {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        textAlign: "center",
        position: "fixed",
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        backgroundColor: "rgba(173, 216, 230, 0.6)",
        pointerEvents: "none",
        zIndex: 2147483646
    })

    document.body.appendChild(highlightDiv)
}

function addLoaderTextToHighlight(highlightDiv: HTMLElement) {
    const loader = document.createElement("div")
    loader.id = "curtain-fall-loader"
    loader.innerText = "Removing, please wait ..."
    Object.assign(loader.style, {
        alignItems: "center",
        display: "flex",
        font: "Roboto, Helvetica, Arial, sans-serif",
        flex: 1,
        justifyContent: "center",
        color: "white",
        height: "100%"
    })

    highlightDiv.appendChild(loader)
    highlightDiv.style.backgroundColor = "rgba(173, 216, 230, 1)"
}

function selectElement(event: MouseEvent) {
    event.preventDefault()
    event.stopPropagation()

    if (!isSelecting) return

    unbindListeners()

    if (highlightDiv) {
        addLoaderTextToHighlight(highlightDiv)
    }

    const documentElement = document.querySelector("body") as HTMLElement
    const element = event.target as HTMLElement
    const rect = element.getBoundingClientRect()

    const selector = generateSelector(element)

    // Capture screenshot
    html2canvas(documentElement, {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        ignoreElements: (element) => {
            return element === highlightDiv
        }
    }).then((canvas) => {
        const imageData = canvas.toDataURL()
        chrome.runtime.sendMessage({
            action: ACTION_ELEMENT_SELETED,
            data: {
                selector,
                screenshot: imageData
            }
        })

        isSelecting = false
        cleanUp()
    })
}

function generateSelector(element: HTMLElement): string {
    // Generate a unique CSS selector for the element
    const parts: string[] = []

    while (element && element.nodeType === Node.ELEMENT_NODE) {
        let selector = element.nodeName.toLowerCase()
        if (element.id) {
            selector += `#${element.id}`
            parts.unshift(selector)
            break
        } else {
            let sibling = element
            let nth = 1
            while ((sibling = sibling.previousElementSibling as HTMLElement)) {
                if (sibling.nodeName.toLowerCase() === selector) nth++
            }
            selector += `:nth-of-type(${nth})`
        }
        parts.unshift(selector)
        element = element.parentElement as HTMLElement
    }

    return parts.join(" > ")
}
