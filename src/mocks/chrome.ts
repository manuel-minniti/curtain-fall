const storage = {
    local: {
        data: {},
        get: async (
            keys: string | string[] | null
        ): Promise<{ [key: string]: any }> => {
            let result = {}
            if (keys === null) {
                result = storage.local.data
            } else if (typeof keys === "string") {
                result = { [keys]: storage.local.data[keys] }
            } else if (Array.isArray(keys)) {
                keys.forEach((key) => {
                    result[key] = storage.local.data[key]
                })
            }
            return result
        },
        set: (items: { [key: string]: any }, callback?: () => void) => {
            storage.local.data = { ...storage.local.data, ...items }
            if (callback) callback()
        },
        remove: (keys: string | string[], callback?: () => void) => {
            if (typeof keys === "string") {
                delete storage.local.data[keys]
            } else if (Array.isArray(keys)) {
                keys.forEach((key) => {
                    delete storage.local.data[key]
                })
            }
            if (callback) callback()
        },
        clear: (callback?: () => void) => {
            storage.local.data = {}
            if (callback) callback()
        }
    }
}

// Mock runtime API
const runtime = {
    sendMessage: (message: any, callback?: (response: any) => void) => {
        console.log("Mock runtime.sendMessage called with:", message)
        if (callback) callback({ response: "This is a mock response" })
    },
    onMessage: {
        addListener: (
            callback: (
                message: any,
                sender: any,
                sendResponse: (response: any) => void
            ) => void
        ) => {
            console.log("Mock runtime.onMessage.addListener called")
        }
    },
    openPopup: () => {
        window.location.href = "/src/popup/index.html"
    },
    openEditPopup: (id: string) => {
        console.log(`Mock runtime.openEditPopup called with id: ${id}`)
        window.location.href = `/src/popupEdit/index.html?id=${id}`
    },
    openOptionsPage: () => {
        console.log("Mock runtime.openOptionsPage called")
        // Open options page in development mode
        window.location.href = "/src/options/index.html"
    },
    lastError: null
}

// Mock tabs API
const tabs = {
    query: (queryInfo: any, callback: (tabs: any[]) => void) => {
        console.log("Mock tabs.query called with:", queryInfo)
        callback([{ id: 1, active: true, currentWindow: true }])
    },
    sendMessage: (
        tabId: number,
        message: any,
        callback?: (response: any) => void
    ) => {
        console.log(
            `Mock tabs.sendMessage called to tab ${tabId} with:`,
            message
        )
        if (callback) callback({ response: "This is a mock response from tab" })
    }
}

// Mock action API
const action = {
    openPopup: () => {
        console.log("Mock action.openPopup called")
    }
}

interface ChromeMock {
    storage: typeof storage
    runtime: typeof runtime
    tabs: typeof tabs
    action: typeof action
}

const chromeMock: ChromeMock = {
    storage,
    runtime,
    tabs,
    action
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(window as any).chrome = chromeMock

export default chromeMock
