import { RemovalsManager } from "../state/removal"
import type { ModalRemoval } from "../state/removal"

import { BlockingListManager } from "@/state/blockingList"
import type { BlockingRule } from "@/state/blockingList"

if (__DEV__) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).chrome = await import("../mocks/chrome").then(
        (module) => module.default
    )
}

let removals: ModalRemoval[] = []
let blockingRules: BlockingRule[] = []

async function init() {
    const extensionEnabled = await RemovalsManager.getExtensionEnabled()
    const isEnabled = extensionEnabled !== false

    if (!isEnabled) return

    removals = await RemovalsManager.getAllRemovals()
    blockingRules = await BlockingListManager.getEnabledBlockingListsRules()

    processRemovals(removals, document)
    applyBlockingRules(blockingRules, document)

    const observer = new MutationObserver((/* mutationsList */) => {
        processRemovals(removals, document)

        // for (const mutation of mutationsList) {
        //     if (
        //         mutation.type === "childList" &&
        //         mutation.addedNodes.length > 0
        //     ) {
        //         mutation.addedNodes.forEach((node) => {
        //             if (node.nodeType === Node.ELEMENT_NODE) {
        applyBlockingRules(blockingRules, document)
        //             }
        //         })
        //     }
        // }
    })

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    })

    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === "local") {
            if (
                RemovalsManager.userRemovalsKey in changes ||
                RemovalsManager.enabledDefaultRemovalsKey in changes
            ) {
                updateRemovals()
            }

            if (BlockingListManager.blockingListsKey in changes) {
                updateBlockingRules()
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
    processRemovals(removals, document)
}

function processRemovals(
    removals: ModalRemoval[],
    rootNode: HTMLElement | Document
) {
    if (removals.length === 0) return

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
                        (styles as Record<string, string>)[styleProp]
                    )
                })
            })
        })
    })
}

async function updateBlockingRules() {
    const blockingRules =
        await BlockingListManager.getEnabledBlockingListsRules()

    applyBlockingRules(blockingRules, document)
}

function applyBlockingRules(
    rules: BlockingRule[],
    rootNode: HTMLElement | Document
) {
    if (rules.length === 0) return

    const currentDomain = window.location.hostname
    for (const rule of rules) {
        if (
            rule.exclusions.includes(currentDomain) ||
            rule.type !== "element"
        ) {
            continue
        }

        try {
            console.log("Apply rule:", rule.pattern)
            rootNode.querySelectorAll(rule.pattern).forEach((el) => {
                console.log("Remove element:", rule.pattern)
                el.remove()
            })
        } catch (error) {
            console.error("Invalid selector:", rule.pattern, error)
        }
    }
}

init()
