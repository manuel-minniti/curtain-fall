import { BlockingRule } from "@/state/blockingList"

const parseDomains = (
    domainPart: string
): { inclusions: string[]; exclusions: string[] } => {
    const domains = domainPart.split(",")
    const inclusions: string[] = []
    const exclusions: string[] = []

    for (let domain of domains) {
        domain = domain.trim()
        if (domain.startsWith("~")) {
            exclusions.push(domain.substring(1))
        } else if (domain) {
            inclusions.push(domain)
        }
    }

    return { inclusions, exclusions }
}

export function parseBlockingList(text: string): BlockingRule[] {
    const lines = text.split("\n")
    const rules: BlockingRule[] = []
    const exceptionRules: BlockingRule[] = []

    for (let line of lines) {
        line = line.trim()

        // Skip empty lines and comments
        if (!line || line.startsWith("!") || line.startsWith("#")) continue

        // Element hiding rule (e.g., example.com##.ad-banner)
        if (line.includes("#@#")) {
            const [domainPart, selector] = line.split("#@#")
            const { inclusions, exclusions } = parseDomains(domainPart)
            exceptionRules.push({
                type: "element",
                domains: inclusions,
                exclusions,
                pattern: selector
            })
            continue
        }

        // Handle network request blocking rules
        if (
            line.startsWith("||") ||
            line.endsWith("^") ||
            line.endsWith(".js") ||
            line.endsWith(".css")
        ) {
            const regex = /^\|\|([^/^]+)\/\*(\.(js|css))$/
            const match = line.match(regex)
            if (match) {
                const domain = match[1]
                const extension = match[3] as "js" | "css"
                rules.push({
                    type: extension === "js" ? "js" : "css",
                    domains: [domain],
                    exclusions: [],
                    pattern: `||${domain}/*.${extension}`
                })
                continue
            }

            // General domain blocking without specific extension
            const generalRegex = /^\|\|([^/^]+)\^$/
            const generalMatch = line.match(generalRegex)
            if (generalMatch) {
                const domain = generalMatch[1]
                rules.push({
                    type: "element",
                    domains: [domain],
                    exclusions: [],
                    pattern: `||${domain}^`
                })
                continue
            }
        }

        // For rules with '###' (ID selectors)
        if (line.includes("###")) {
            const [domainPart, selectorPart] = line.split("###")
            const { inclusions, exclusions } = parseDomains(domainPart)
            const selector = `#${selectorPart}`
            rules.push({
                type: "element",
                domains: inclusions,
                exclusions,
                pattern: selector
            })
            continue
        }

        // For rules with '##'
        if (line.includes("##")) {
            const [domainPart, selector] = line.split("##")
            const { inclusions, exclusions } = parseDomains(domainPart)
            rules.push({
                type: "element",
                domains: inclusions,
                exclusions,
                pattern: selector
            })
            continue
        }
    }

    const filteredRules = rules.filter((rule) => {
        return !exceptionRules.some((exRule) => {
            const selectorMatch = exRule.pattern === rule.pattern

            if (!selectorMatch) return false

            const domainOverlap =
                exRule.domains.length === 0 ||
                exRule.domains.some((exDomain) =>
                    rule.domains.includes(exDomain)
                )

            const exclusionConflict = exRule.exclusions.some(
                (exExcludedDomain) => rule.domains.includes(exExcludedDomain)
            )

            return domainOverlap && !exclusionConflict
        })
    })

    return filteredRules
}
