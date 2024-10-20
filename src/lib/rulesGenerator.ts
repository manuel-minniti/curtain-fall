import { BlockingRule } from "@/state/blockingList"

let ruleIdCounter = 1

export type DNRRule = chrome.declarativeNetRequest.Rule

export function generateDNRRules(rules: BlockingRule[]): DNRRule[] {
    const dnrRules: DNRRule[] = []

    rules.forEach((rule) => {
        let resourceTypes: chrome.declarativeNetRequest.ResourceType[] = []

        if (rule.type === "js") {
            resourceTypes = [chrome.declarativeNetRequest.ResourceType.SCRIPT]
        } else if (rule.type === "css") {
            resourceTypes = [
                chrome.declarativeNetRequest.ResourceType.STYLESHEET
            ]
        } else if (rule.type === "element") {
            // Element hiding rules are handled via DOM manipulation, not network requests
            return
        }

        const dnrRule: chrome.declarativeNetRequest.Rule = {
            id: ruleIdCounter++,
            action: {
                type: chrome.declarativeNetRequest.RuleActionType.BLOCK
            },
            condition: {
                urlFilter: rule.pattern,
                resourceTypes
            }
        }

        dnrRules.push(dnrRule)
    })

    return dnrRules
}
