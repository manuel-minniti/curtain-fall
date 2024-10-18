import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { CrossCircledIcon, Pencil1Icon } from "@radix-ui/react-icons"
import { Switch } from "@/components/ui/switch"

import Tooltip from "../components/Tooltip"
import SelectorList from "./SelectorList"

import { ModalRemoval } from "../config"
import { RemovalActions } from "@/types"

export const RemovalItem = ({
    removal,
    id,
    actions
}: {
    removal: ModalRemoval
    id: string
    actions: RemovalActions
}) => {
    return (
        <Card>
            <div className="flex items-center justify-between p-4 py-2 min-h-14">
                <div className="flex items-center space-x-2">
                    <Switch
                        id={`enable-removal-${id}`}
                        checked={removal.enabled !== false}
                        onCheckedChange={(checked) =>
                            actions.toggle(id, checked)
                        }
                    />
                </div>
                {removal.isDefault ? (
                    <Badge variant="secondary">Default</Badge>
                ) : (
                    <div className="flex space-x-2">
                        <Tooltip
                            content="Edit"
                            trigger={
                                <Button
                                    className="px-2"
                                    size="icon"
                                    variant="secondary"
                                    onClick={() =>
                                        actions.edit && actions.edit(id)
                                    }
                                >
                                    <Pencil1Icon />
                                </Button>
                            }
                        ></Tooltip>
                        <Tooltip
                            content="Delete"
                            trigger={
                                <Button
                                    className="px-2"
                                    size="icon"
                                    variant="secondary"
                                    onClick={() =>
                                        actions.delete && actions.delete(id)
                                    }
                                >
                                    <CrossCircledIcon />
                                </Button>
                            }
                        />
                    </div>
                )}
            </div>
            <CardHeader className="pt-0">
                <CardTitle className="flex justify-between items-start">
                    <span className="text-base leading-5">{removal.name}</span>
                </CardTitle>
                {removal.description && (
                    <CardDescription>{removal.description}</CardDescription>
                )}
            </CardHeader>
            <CardContent>
                {removal.screenshot && (
                    <div className="mb-4 border-2 border-slate-100 bg-slate-50 rounded max-h-36 overflow-hidden">
                        <img
                            src={removal.screenshot}
                            alt={`Screenshot of ${removal.name}`}
                            className="object-cover m-auto h-auto"
                        />
                    </div>
                )}
                <SelectorList
                    title="Element Selectors"
                    items={removal.elementSelectors}
                />
                {removal.classRemoval.length > 0 && (
                    <SelectorList
                        title="Class Removals"
                        items={removal.classRemoval}
                    />
                )}
                {removal.styleReset.length > 0 && (
                    <SelectorList
                        title="Style Resets"
                        items={removal.styleReset}
                    />
                )}
            </CardContent>
        </Card>
    )
}

export default RemovalItem
