import React, { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/toaster"

import RemovalItem from "./RemovalItem"

import { RemovalsManager } from "../config"
import type { ModalRemoval } from "../config"
import EditRemovalForm from "../components/EditRemovalForm"

import type { RemovalActions } from "../types"
import { useToast } from "@/hooks/use-toast"
import { EXTENSION_ID } from "@/constants"

const EmptyRemovalList = () => {
    return (
        <div className="p-4">
            <div className="text-center text-sm text-muted-foreground">
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
                    <RemovalItem
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
    const { toast } = useToast()

    const [removals, setRemovals] = useState<ModalRemoval[]>([])
    const [defaultRemovals, setDefaultRemovals] = useState<ModalRemoval[]>([])

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
            toast({ description: "Default removals cannot be deleted." })
            return
        }

        await RemovalsManager.deleteRemoval(id)
        await loadRemovals()
        toast({ description: "Removal deleted successfully." })
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

    const saveRemoval = async (updatedRemoval: ModalRemoval) => {
        await RemovalsManager.updateRemoval(updatedRemoval.id, updatedRemoval)
        await loadRemovals()
        toast({ description: "Removal updated successfully." })
        setIsDialogOpen(false)
        loadRemovals()
    }

    return (
        <TooltipProvider delayDuration={0}>
            <div id={EXTENSION_ID} style={{ width: 600 }}>
                <Toaster />

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
                                    // @ts-expect-error: Only available in development mode.
                                    onClick={() => chrome.runtime.openPopup()}
                                >
                                    Open popup
                                </Button>
                                <Button
                                    onClick={() =>
                                        // @ts-expect-error: Only available in development mode.
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

                    {!isDialogOpen && (
                        <Tabs defaultValue="user-removals">
                            <TabsList className="w-full">
                                <TabsTrigger value="user-removals">
                                    Your Removals
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
