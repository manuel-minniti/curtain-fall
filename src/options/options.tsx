import React, { useState, useEffect } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import RemovalPopup from "../popupEdit/popupEdit"

import {
    Cross1Icon,
    CrossCircledIcon,
    Pencil1Icon
} from "@radix-ui/react-icons"

import Tooltip from "../components/Tooltip"

import { RemovalsManager } from "../config"
import type { ModalRemoval } from "../config"
import EditRemovalForm from "../components/EditRemovalForm"

type RemovalActions = {
    edit?: (id: string) => void
    delete?: (id: string) => void
    toggle: (id: string, enabled: boolean) => void
}

type RemovalSelector = {
    elementSelector: string
    className: string
}

type ResetSelector = {
    elementSelector: string
    styles: { [key: string]: string }
}

type SelectorItem = RemovalSelector | ResetSelector | string

export const SelectorList = ({
    title,
    items
}: {
    title: string
    items: SelectorItem[]
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
                    let label = item
                    if (typeof item === "object") {
                        if ("className" in item) {
                            label = `${item.elementSelector}: ${item.className}`
                        } else {
                            label = `${item.elementSelector}: ${JSON.stringify(item.styles)}`
                        }
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

export const RemovalListItem = ({
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
                    <div className="mb-2 border-2 border-slate-100 bg-slate-50 rounded">
                        <img
                            src={removal.screenshot}
                            alt={`Screenshot of ${removal.name}`}
                            className="w-full h-auto"
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

const EmptyRemovalList = () => {
    return (
        <div className="p-4">
            <div className="text-center text-muted-foreground">
                No removals added yet.
            </div>
        </div>
    )
}

export const RemovalList = ({
    className = "",
    actions,
    removals
}: {
    className?: string
    actions: RemovalActions
    removals: ModalRemoval[]
}) => {
    if (removals.length === 0) {
        return <EmptyRemovalList />
    }

    return (
        <div className={`grid grid-cols-2 gap-2 ${className}`}>
            {removals.length > 0 &&
                removals.map((removal, idx) => (
                    <RemovalListItem
                        key={idx}
                        removal={removal}
                        id={removal.id}
                        actions={actions}
                    />
                ))}
        </div>
    )
}

function Options() {
    const [removals, setRemovals] = useState<ModalRemoval[]>([])
    const [defaultRemovals, setDefaultRemovals] = useState<ModalRemoval[]>([])

    const [message, setMessage] = useState<string | null>(null)
    const [editingRemoval, setEditingRemoval] = useState<ModalRemoval | null>(
        null
    )
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)

    useEffect(() => {
        loadRemovals()
        loadDefaultRemovals()
    }, [])

    const loadRemovals = async () => {
        const userRemovals = await RemovalsManager.getRemovals()
        setRemovals(userRemovals)
    }

    const loadDefaultRemovals = async () => {
        const defaultRemovals = await RemovalsManager.getDefaultRemovals()
        setDefaultRemovals(defaultRemovals)
    }

    const deleteRemoval = async (id: string) => {
        const index = RemovalsManager.findIndexById(removals, id)
        const removal = removals[index]
        if (removal.isDefault) {
            setMessage("Default removals cannot be deleted.")
            return
        }

        await RemovalsManager.deleteRemoval(id)
        await loadRemovals()
        setMessage("Removal deleted successfully.")
        setIsDialogOpen(false)
    }

    const toggleRemoval = async (id: string, enabled: boolean) => {
        const index = RemovalsManager.findIndexById(removals, id)
        const removal = removals[index]
        removal.enabled = enabled
        await RemovalsManager.updateRemoval(id, removal)
        await loadRemovals()
    }

    const toggleDefaultRemoval = async (id: string, enabled: boolean) => {
        await RemovalsManager.toggleDefaultRemoval(id, enabled)
        loadDefaultRemovals()
    }

    const editRemoval = (id: string) => {
        const index = RemovalsManager.findIndexById(removals, id)
        const removal = removals[index]
        setEditingRemoval(removal)
        setIsDialogOpen(true)
    }

    const saveRemoval = async (updatedRemoval) => {
        await RemovalsManager.updateRemoval(updatedRemoval.id, updatedRemoval)
        await loadRemovals()
        setMessage("Removal updated successfully.")
        setIsDialogOpen(false)
        loadRemovals()
    }

    // Set a timer after setting a message to clear it after X seconds.
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [message])

    return (
        <TooltipProvider delayDuration={0}>
            <div id="curtain-fall" style={{ width: 600 }}>
                <div className="p-4 pt-0 min-h-[440px]">
                    {__DEV__ && (
                        <div className="p-4 mb-2 bg-amber-100 text-amber-800 rounded space-y-2">
                            <div className="font-bold">Development Mode</div>
                            <div className="text-sm">
                                You are currently in development mode. This mode
                                allows you to test the extension without
                                affecting the browser.
                            </div>
                            <div className="space-x-2">
                                <Button
                                    onClick={() => chrome.runtime.openPopup()}
                                >
                                    Open popup
                                </Button>
                                <Button
                                    onClick={() =>
                                        chrome.runtime.openEditPopup(
                                            defaultRemovals[0].id
                                        )
                                    }
                                >
                                    Open edit pop
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Message Display */}
                    {message && (
                        <div className="mb-4 p-2 pl-4 bg-green-100 text-green-800 rounded flex items-center justify-between">
                            <div>{message}</div>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setMessage(null)}
                            >
                                <Cross1Icon />
                            </Button>
                        </div>
                    )}

                    {!isDialogOpen && (
                        <Tabs defaultValue="user-removals">
                            <TabsList className="w-full">
                                <TabsTrigger value="user-removals">
                                    User Removals
                                </TabsTrigger>
                                <TabsTrigger value="default-removals">
                                    Default Removals
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="user-removals">
                                <RemovalList
                                    removals={removals}
                                    actions={{
                                        toggle: toggleRemoval,
                                        edit: editRemoval,
                                        delete: deleteRemoval
                                    }}
                                />
                            </TabsContent>
                            <TabsContent value="default-removals">
                                <RemovalList
                                    removals={defaultRemovals}
                                    actions={{
                                        toggle: toggleDefaultRemoval
                                    }}
                                />
                            </TabsContent>
                        </Tabs>
                    )}

                    {/* Edit Removal Dialog */}
                    {isDialogOpen && editingRemoval && (
                        <EditRemovalForm
                            initialRemoval={editingRemoval}
                            onSave={saveRemoval}
                            onCancel={() => setIsDialogOpen(false)}
                        />
                    )}
                </div>
            </div>
        </TooltipProvider>
    )
}

export default Options
