import {
    ACTION_APPLY_BLOCKING_RULES,
    ACTION_FETCH_BLOCKING_LIST,
    ACTION_REMOVE_BLOCKING_RULES
} from "@/constants"
import { DNRRule } from "@/lib/rulesGenerator"
import { v4 as uuid } from "uuid"

export interface BlockingList {
    id: string
    name: string
    url: string
    enabled: boolean
    rules: BlockingRule[]
    ruleIds: number[]
}

export interface BlockingRule {
    type: "element" | "css" | "js"
    domains: string[]
    exclusions: string[]
    pattern: string
}

export type BlockingListDraft = Pick<
    BlockingList,
    "name" | "url" | "rules" | "ruleIds"
>

type BlockingListState = Record<string, BlockingList[]>

// const defaultBlockingList: BlockingList = {
//     id: "i-dont-care-about-cookies",
//     name: "I don't care about cookies",
//     url: "https://www.i-dont-care-about-cookies.eu/abp/",
//     enabled: true,
//     rules: [
//         {
//             type: "js",
//             domains: [],
//             exclusions: [],
//             pattern: "cookiewarning4.js^"
//         },
//         {
//             type: "js",
//             domains: [],
//             exclusions: [],
//             pattern: "/wp-content/mu-plugins/cookie_notifier"
//         },
//         {
//             type: "js",
//             domains: [],
//             exclusions: [],
//             pattern: "cookies.js$"
//         },
//         {
//             type: "css",
//             domains: [],
//             exclusions: [],
//             pattern: "/tarteaucitron.css"
//         }
//     ]
// }

export class BlockingListManager {
    static blockingListsKey = "blockingLists"
    static selectBlockingLists(state: BlockingListState) {
        return state[this.blockingListsKey] || []
    }

    static async setBlockingLists(blockingLists: BlockingList[]) {
        await chrome.storage.local.set({
            [this.blockingListsKey]: blockingLists
        })
    }

    static async getBlockingLists(): Promise<BlockingList[]> {
        const result = await chrome.storage.local.get(this.blockingListsKey)
        const blockingLists = this.selectBlockingLists(result)

        // Add the default blocking lists if not already added (based on the url)
        // if (blockingLists.length > 0) {
        //     const defaultBlockingListIndex = blockingLists.findIndex(
        //         (list) => list.url === defaultBlockingList.url
        //     )
        //     if (defaultBlockingListIndex === -1) {
        //         blockingLists.push(defaultBlockingList)
        //     }
        // } else {
        //     blockingLists.push(defaultBlockingList)
        // }

        console.log("Blocking lists", blockingLists)

        return blockingLists
    }

    static async getEnabledBlockingListsRules(): Promise<BlockingRule[]> {
        const lists = await this.getBlockingLists()
        const enabledLists = lists.filter((list) => list.enabled)
        const enabledRules: BlockingRule[] = []
        for (const list of enabledLists) {
            enabledRules.push(...list.rules)
        }
        return enabledRules
    }

    static async createBlockingList(props: BlockingListDraft) {
        const blockingList = {
            id: uuid(),
            enabled: true,
            ...props
        }
        console.log("Creating blocking list", blockingList)
        await this.addBlockingList(blockingList)
        return blockingList
    }

    static async addBlockingList(blockingList: BlockingList) {
        const blockingLists = await this.getBlockingLists()
        blockingLists.push(blockingList)
        await this.setBlockingLists(blockingLists)
    }

    static async updateBlockingList(
        index: number,
        updates: Partial<BlockingList>
    ) {
        const blockingLists = await this.getBlockingLists()
        if (!blockingLists[index]) return
        blockingLists[index] = { ...blockingLists[index], ...updates }
        await this.setBlockingLists(blockingLists)
    }

    static async deleteBlockingList(id: string) {
        const blockingLists = await this.getBlockingLists()
        const list = blockingLists.find((bl) => bl.id === id)
        if (!list) return
        await this.removeBlockingRules(list.ruleIds)
        const filteredLists = blockingLists.filter((list) => list.id !== id)
        await this.setBlockingLists(filteredLists)
    }

    // Chrome actions
    static async removeBlockingRules(ruleIds: number[]) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                { action: ACTION_REMOVE_BLOCKING_RULES, ruleIds },
                (response) => {
                    if (response && response.success) {
                        resolve(response)
                    } else {
                        reject(
                            response.error || "Error removing blocking rules."
                        )
                    }
                }
            )
        })
    }

    static async fetchBlockingList(url: string): Promise<BlockingRule[]> {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                { action: ACTION_FETCH_BLOCKING_LIST, url },
                (response) => {
                    if (response && response.success) {
                        resolve(response.rules)
                    } else {
                        reject(response.error || "Unknown error")
                    }
                }
            )
        })
    }

    static async applyBlockingRules(rules: DNRRule[]): Promise<{
        success: boolean
        ruleIds: number[]
    }> {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                { action: ACTION_APPLY_BLOCKING_RULES, rules },
                (response) => {
                    if (response && response.success) {
                        resolve({
                            success: true,
                            ruleIds: response.ruleIds
                        })
                    } else {
                        reject(
                            response.error || "Failed to apply blocking rules."
                        )
                    }
                }
            )
        })
    }
}
