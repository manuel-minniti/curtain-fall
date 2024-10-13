import { RemovalsManager } from "../config"
import type { ModalRemoval } from "../config"

if (__DEV__) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).chrome = await import("../mocks/chrome").then(
        (module) => module.default
    )
}

let removals: ModalRemoval[] = []

async function init() {
    const extensionEnabled = await RemovalsManager.getExtensionEnabled()
    const isEnabled = extensionEnabled !== false

    if (!isEnabled) return

    removals = await RemovalsManager.getAllRemovals()
    if (removals.length === 0) return

    // Initial processing of the current DOM
    processRemovals(removals, document)

    // Set up MutationObserver to watch for changes in the DOM
    const observer = new MutationObserver(() => {
        processRemovals(removals, document)
    })

    // Start observing the document for changes
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    })

    // Listen for changes to the removals
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === "local") {
            if (
                RemovalsManager.userRemovalsKey in changes ||
                RemovalsManager.enabledDefaultRemovalsKey in changes
            ) {
                updateRemovals()
            }

            if (RemovalsManager.extensionEnabledKey in changes) {
                const isEnabled =
                    changes[RemovalsManager.extensionEnabledKey].newValue !==
                    false
                if (isEnabled) {
                    init()
                } else {
                    if (observer) {
                        observer.disconnect()
                    }
                }
            }
        }
    })
}

async function updateRemovals() {
    removals = await RemovalsManager.getAllRemovals()
    // Re-process the entire document to apply new removals
    processRemovals(removals, document)
}

function processRemovals(
    removals: ModalRemoval[],
    rootNode: HTMLElement | Document
) {
    removals.forEach((removal) => {
        if (removal.enabled === false) return

        // Remove elements
        removal.elementSelectors.forEach((selector) => {
            rootNode.querySelectorAll(selector).forEach((el) => el.remove())
        })

        // Remove classes
        removal.classRemoval.forEach(({ elementSelector, className }) => {
            rootNode.querySelectorAll(elementSelector).forEach((el) => {
                if (className) {
                    el.classList.remove(className)
                }
            })
        })

        // Reset styles
        removal.styleReset.forEach(({ elementSelector, styles }) => {
            rootNode.querySelectorAll(elementSelector).forEach((el) => {
                Object.keys(styles).forEach((styleProp) => {
                    ;(el as HTMLElement).style.setProperty(
                        styleProp,
                        styles[styleProp]
                    )
                })
            })
        })
    })
}

init()
