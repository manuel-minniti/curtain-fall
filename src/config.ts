import { v4 as uuid } from "uuid"

export interface ModalRemoval {
    id: string
    name: string
    elementSelectors: string[]
    classRemoval: { elementSelector: string; className: string }[]
    styleReset: { elementSelector: string; styles: { [key: string]: string } }[]
    description?: string
    screenshot?: string
    isDefault?: boolean
    enabled?: boolean
}

type EnabledDefaultRemoval = Record<string, { enabled: boolean }>

export const defaultRemovals: ModalRemoval[] = [
    {
        id: "remove-paywalls",
        isDefault: true,
        enabled: true,
        name: "Remove payment wall",
        description: "gutefrage.net, etc.",
        elementSelectors: [".cmpbox", ".cmpboxBG"],
        classRemoval: [],
        styleReset: [{ elementSelector: "body", styles: { overflow: "" } }]
    },
    {
        id: "remove-cookie-consent",
        isDefault: true,
        enabled: true,
        name: "Remove Cookie Consent from News websites",
        description: "Spiegel Online, Focus, Welt, etc.",
        elementSelectors: ['[id^="sp_message_container_"]'],
        classRemoval: [
            { elementSelector: "html", className: "sp-message-open" }
        ],
        styleReset: [{ elementSelector: "html", styles: { overflow: "" } }]
    }
    // Add more default removals as needed
]

export class RemovalsManager {
    static enabledDefaultRemovalsKey = "enabledDefaultRemovals"
    static userRemovalsKey = "userRemovals"
    static extensionEnabledKey = "extensionEnabled"

    static defaultRemovals: ModalRemoval[] = defaultRemovals

    static findIndexById(removals: ModalRemoval[], id: string): number {
        return removals.findIndex((r) => r.id === id)
    }

    static findById(removals: ModalRemoval[], id: string): ModalRemoval | null {
        return removals.find((r) => r.id === id) || null
    }

    static async getExtensionEnabled(): Promise<boolean> {
        const result = await chrome.storage.local.get(this.extensionEnabledKey)
        return result[this.extensionEnabledKey] !== false
    }

    static async setExtensionEnabled(enabled: boolean): Promise<void> {
        await chrome.storage.local.set({ [this.extensionEnabledKey]: enabled })
    }

    // Default Removals
    static async getDefaultRemovals(): Promise<ModalRemoval[]> {
        const enabledDefaultRemovals = await this.getEnabledDefaultRemovals()

        console.log("enabledDefaultRemovals", enabledDefaultRemovals)

        this.setDefaultRemovals(
            this.defaultRemovals.map((removal) => {
                const enabled = enabledDefaultRemovals[removal.id]?.enabled
                return {
                    ...removal,
                    enabled: enabled !== undefined ? enabled : removal.enabled
                }
            })
        )

        console.log("this.defaultRemovals", this.defaultRemovals)

        return this.defaultRemovals
    }

    static setDefaultRemovals(removals: ModalRemoval[]): void {
        this.defaultRemovals = removals
    }

    // Enabled Default Removals
    static async getEnabledDefaultRemovals(): Promise<EnabledDefaultRemoval> {
        const result = await chrome.storage.local.get(
            this.enabledDefaultRemovalsKey
        )
        const enabledDefaultRemovals =
            result[this.enabledDefaultRemovalsKey] || {}

        console.log("getEnabledDefaultRemovals", enabledDefaultRemovals)

        return enabledDefaultRemovals
    }

    static async toggleDefaultRemoval(
        id: string,
        enabled: boolean
    ): Promise<void> {
        const enabledDefaultRemovals = await this.getEnabledDefaultRemovals()
        enabledDefaultRemovals[id] = { enabled }
        await this.updateEnabledDefaultRemovals(enabledDefaultRemovals)
    }

    static async updateEnabledDefaultRemovals(
        enabledDefaultRemovals: EnabledDefaultRemoval
    ): Promise<EnabledDefaultRemoval> {
        await chrome.storage.local.set({
            [this.enabledDefaultRemovalsKey]: enabledDefaultRemovals
        })
        return enabledDefaultRemovals
    }

    // User Removals
    static async getRemovals(): Promise<ModalRemoval[]> {
        const result = await chrome.storage.local.get(this.userRemovalsKey)
        const userRemovals: ModalRemoval[] = result[this.userRemovalsKey] || []
        return [...userRemovals]
    }

    static async addRemoval(removal: ModalRemoval): Promise<void> {
        const userRemovals = await this.getUserRemovals()
        userRemovals.push(removal)
        await this.setRemovals(userRemovals)
    }

    static async deleteRemoval(id: string): Promise<void> {
        const userRemovals = await this.getUserRemovals()
        const index = RemovalsManager.findIndexById(userRemovals, id)
        userRemovals.splice(index, 1)
        await this.setRemovals(userRemovals)
    }

    static async updateRemoval(
        id: string,
        updatedRemoval: ModalRemoval
    ): Promise<void> {
        const userRemovals = await this.getUserRemovals()
        const index = RemovalsManager.findIndexById(userRemovals, id)
        if (index === -1) return

        userRemovals[index] = updatedRemoval
        await this.setRemovals(userRemovals)
    }

    static async setRemovals(removals: ModalRemoval[]): Promise<void> {
        await chrome.storage.local.set({ [this.userRemovalsKey]: removals })
    }

    static async getUserRemovals(): Promise<ModalRemoval[]> {
        const result = await chrome.storage.local.get(this.userRemovalsKey)
        return result[this.userRemovalsKey] || []
    }

    // All Removals
    static async getAllRemovals(): Promise<ModalRemoval[]> {
        const defaultRemovals = await this.getDefaultRemovals()
        const userRemovals = await this.getUserRemovals()
        return [...defaultRemovals, ...userRemovals]
    }
}
