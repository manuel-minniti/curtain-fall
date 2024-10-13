import React from "react"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"

import { TooltipArrow } from "@radix-ui/react-tooltip"

interface TooltipCustomProps {
    arrow?: boolean
    trigger: React.ReactNode
    triggerProps?: React.ComponentProps<typeof TooltipTrigger>
    content: React.ReactNode
    contentProps?: React.ComponentProps<typeof TooltipContent>
}

const TooltipCustom = ({
    arrow = false,
    trigger,
    triggerProps,
    content,
    contentProps
}: TooltipCustomProps) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild {...triggerProps}>
                {trigger}
            </TooltipTrigger>
            <TooltipContent {...contentProps}>
                {content}
                {arrow && <TooltipArrow />}
            </TooltipContent>
        </Tooltip>
    )
}

export default TooltipCustom
