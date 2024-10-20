import React from "react"
import { Badge } from "@/components/ui/badge"

import { RemovalItem } from "@/types"

const SelectorList = ({
    title,
    items
}: {
    title: string
    items: RemovalItem[]
}) => {
    return (
        <div className="mb-4">
            {title && <div className="text-xs font-normal mb-1 ">{title}</div>}
            <ul className="flex gap-1">
                {items.length === 0 && (
                    <div className="font-normal text-xs text-muted-foreground">
                        None
                    </div>
                )}
                {items.map((item, idx) => {
                    let label: string
                    if (typeof item === "object") {
                        if ("className" in item) {
                            label = `${item.elementSelector}: ${item.className}`
                        } else {
                            label = `${item.elementSelector}: ${JSON.stringify(item.styles)}`
                        }
                    } else {
                        label = item.toString()
                    }

                    return (
                        <Badge
                            className="font-normal text-muted-foreground"
                            key={idx}
                            variant="secondary"
                        >
                            {label}
                        </Badge>
                    )
                })}
            </ul>
        </div>
    )
}

export default SelectorList
