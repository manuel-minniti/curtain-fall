import { RemovalsManager, type ModalRemoval } from "./config"
import { v4 as uuid } from "uuid"

import iconDataUrl from "./assets/icons/icon-48.png"

const notificationId = "curtainFallNotification"

function notifyUser(message: string) {
    chrome.notifications.create(notificationId, {
        type: "basic",
        iconUrl: iconDataUrl,
        title: "Curtain Fall",
        message
    })
}

function handleNotificationAction() {
    // Open the options page
    chrome.runtime.openOptionsPage()
    // Clear the notification
    chrome.notifications.clear(notificationId)
}

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

chrome.notifications.onButtonClicked.addListener(
    (notificationId, buttonIndex) => {
        if (notificationId === notificationId && buttonIndex === 0) {
            handleNotificationAction()
        }
    }
)

chrome.notifications.onClicked.addListener((notificationId) => {
    if (notificationId === notificationId) {
        handleNotificationAction()
    }
})

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "open-options",
        title: "Open Curtain Fall Options",
        contexts: ["action"]
    })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "open-options") {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage()
        } else if (tab) {
            chrome.tabs.create({
                url: chrome.runtime.getURL("options/index.html")
            })
        }
    }
})

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === "elementSelected") {
        const { selector, screenshot } = request.data

        // Current date in short format
        const currentDate = new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric"
        })

        // Get the current TLD as the name.
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
            notifyUser("New removal created successfully.")
            openEditPopup(newRemoval.id)
        })
    }
})
