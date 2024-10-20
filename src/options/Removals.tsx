import React, { useEffect, useState } from "react"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import EditRemovalForm from "@/components/EditRemovalForm"
import { RemovalsManager } from "@/state/removal"
import { ModalRemoval } from "@/state/removal"

import RemovalItem from "./RemovalItem"

import { useToast } from "@/hooks/use-toast"

import { RemovalActions } from "@/types"

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

const EmptyRemovalList = () => {
    return (
        <div className="p-4">
            <div className="text-center text-sm text-muted-foreground">
                No removals added yet.
            </div>
        </div>
    )
}

const Removals = () => {
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
        <>
            {!isDialogOpen && (
                <Tabs defaultValue="user-removals">
                    <TabsList>
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
        </>
    )
}

export default Removals
