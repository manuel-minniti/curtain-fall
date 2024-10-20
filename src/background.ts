import { RemovalsManager, type ModalRemoval } from "./state/removal"
import { v4 as uuid } from "uuid"

import {
    ACTION_APPLY_BLOCKING_RULES,
    ACTION_REMOVE_BLOCKING_RULES,
    ACTION_ELEMENT_SELETED,
    ACTION_FETCH_BLOCKING_LIST,
    ACTION_OPEN_EDIT_POPUP,
    ACTION_OPEN_OPTIONS,
    ACTION_UPDATE_BLOCKING_LISTS,
    UPDATE_BLOCKING_LISTS_PERIOD_IN_MINS
} from "./constants"

import { parseBlockingList } from "./lib/blockingListParser"
import { generateDNRRules } from "./lib/rulesGenerator"
import { BlockingListManager } from "./state/blockingList"

function openEditPopup(id: string) {
    chrome.system.display.getInfo((displayInfo) => {
        const primaryDisplay = displayInfo.find((display) => display.isPrimary)

        const width = 400
        const height = 600
        let left = 0
        let top = 0
        if (primaryDisplay) {
            const screenWidth = primaryDisplay.workArea.width
            const screenHeight = primaryDisplay.workArea.height
            const screenLeft = primaryDisplay.workArea.left
            const screenTop = primaryDisplay.workArea.top

            left = Math.round(screenLeft + (screenWidth - width) / 2)
            top = Math.round(screenTop + (screenHeight - height) / 2)
        }

        chrome.windows.create({
            url: chrome.runtime.getURL("popupEdit/index.html") + "?id=" + id,
            type: "popup",
            width,
            height,
            left,
            top
        })
    })
}

async function getRemovalName(): Promise<string> {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0]
            if (!tab || !tab.url) {
                resolve("New Removal")
                return
            }
            const url = new URL(tab.url)
            const hostnameParts = url.hostname.split(".")
            const tld =
                hostnameParts[hostnameParts.length - 2] +
                "." +
                hostnameParts[hostnameParts.length - 1]
            resolve(tld)
        })
    })
}

async function updateAllBlockingLists() {
    const blockingLists = await BlockingListManager.getBlockingLists()
    for (let i = 0; i < blockingLists.length; i++) {
        const list = blockingLists[i]
        if (list.enabled) {
            try {
                const response = await fetch(list.url)
                const text = await response.text()
                const rules = parseBlockingList(text)
                list.rules = rules
            } catch (error) {
                console.error(
                    `Error updating blocking list ${list.name}:`,
                    error
                )
            }
        }
    }

    BlockingListManager.setBlockingLists(blockingLists)
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: ACTION_OPEN_OPTIONS,
        title: `Open ${__EXTENSION_NAME__} Options`,
        contexts: ["action"]
    })

    chrome.alarms.create(ACTION_UPDATE_BLOCKING_LISTS, {
        periodInMinutes: UPDATE_BLOCKING_LISTS_PERIOD_IN_MINS
    })

    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [],
        addRules: []
    })
})

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ACTION_UPDATE_BLOCKING_LISTS) {
        updateAllBlockingLists()
    }
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === ACTION_OPEN_OPTIONS) {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage()
        } else if (tab) {
            chrome.tabs.create({
                url: chrome.runtime.getURL("options/index.html")
            })
        }
    }
})

// Listeners
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === ACTION_ELEMENT_SELETED) {
        const { selector, screenshot } = request.data

        const currentDate = new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric"
        })

        const name = await getRemovalName()
        const newRemoval: ModalRemoval = {
            id: uuid(),
            name,
            description: `Added on ${currentDate}`,
            elementSelectors: [selector],
            isDefault: false,
            classRemoval: [],
            styleReset: [],
            enabled: true,
            screenshot
        }

        // Save the selector and screenshot to storage
        RemovalsManager.addRemoval(newRemoval).then(() => {
            openEditPopup(newRemoval.id)
        })

        sendResponse({ status: "Element selected" })
    }
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === ACTION_OPEN_EDIT_POPUP) {
        openEditPopup(request.id)
        sendResponse({ status: "Opened" })

        return true
    }

    if (request.action === ACTION_FETCH_BLOCKING_LIST) {
        fetch(request.url)
            .then((response) => response.text())
            .then((text) => {
                const rules = parseBlockingList(text)
                sendResponse({ success: true, rules })
            })
            .catch((error) => {
                console.error("Error fetching blocking list:", error)
                sendResponse({ success: false, error: error.message })
            })

        return true
    }

    if (request.action === ACTION_APPLY_BLOCKING_RULES) {
        const { rules } = request
        const dnrRules = generateDNRRules(rules)

        chrome.declarativeNetRequest.updateDynamicRules(
            {
                removeRuleIds: dnrRules.map((rule) => rule.id),
                addRules: dnrRules
            },
            () => {
                if (chrome.runtime.lastError) {
                    console.error(
                        "Error updating dynamic rules:",
                        chrome.runtime.lastError
                    )
                    sendResponse({
                        success: false,
                        error: chrome.runtime.lastError.message
                    })
                } else {
                    console.log("Blocking rules applied successfully.")
                    sendResponse({
                        success: true,
                        ruleIds: dnrRules.map((rule) => rule.id)
                    })
                }
            }
        )

        return true
    }

    if (request.action === ACTION_REMOVE_BLOCKING_RULES) {
        const { ruleIds } = request

        chrome.declarativeNetRequest.updateDynamicRules(
            {
                removeRuleIds: ruleIds,
                addRules: []
            },
            () => {
                if (chrome.runtime.lastError) {
                    console.error(
                        "Error removing dynamic rules:",
                        chrome.runtime.lastError
                    )
                    sendResponse({
                        success: false,
                        error: chrome.runtime.lastError.message
                    })
                } else {
                    console.log("Blocking rules removed successfully.")
                    sendResponse({ success: true })
                }
            }
        )

        return true
    }
})
