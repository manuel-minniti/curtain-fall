import React, { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

import { BlockingListManager } from "@/state/blockingList"
import { BlockingList, BlockingListDraft } from "@/state/blockingList"

import { useToast } from "@/hooks/use-toast"

import { reportError, getErrorMessage } from "@/lib/error"
import { generateDNRRules } from "@/lib/rulesGenerator"

const BlockingLists = () => {
    const { toast } = useToast()

    const [blockingLists, setBlockingLists] = useState<BlockingList[]>([])
    const [newListUrl, setNewListUrl] = useState("")

    useEffect(() => {
        loadBlockingLists()
    }, [])

    const loadBlockingLists = async () => {
        const lists = await BlockingListManager.getBlockingLists()
        setBlockingLists(lists)
    }

    const addBlockingList = async () => {
        if (!newListUrl) return

        try {
            const rules =
                await BlockingListManager.fetchBlockingList(newListUrl)

            const dnrRules = generateDNRRules(rules)

            console.log(
                "Applying blocking rules during creation:",
                rules,
                dnrRules
            )
            const applied =
                await BlockingListManager.applyBlockingRules(dnrRules)

            console.log("Applied blocking rules:", applied)
            const newList: BlockingListDraft = {
                name: `Blocking List ${blockingLists.length + 1}`,
                url: newListUrl,
                rules,
                ruleIds: applied.ruleIds
            }

            const newBlockingList =
                await BlockingListManager.createBlockingList(newList)

            setBlockingLists([...blockingLists, newBlockingList])
            setNewListUrl("")
            toast({ title: "Blocking list added successfully." })
        } catch (error) {
            const errorMessage = getErrorMessage(error)
            reportError({ message: errorMessage })
            toast({
                title: "Failed to add blocking list.",
                description: errorMessage,
                variant: "destructive"
            })
        }
    }

    const toggleBlockingList = async (index: number, enabled: boolean) => {
        const updatedLists = [...blockingLists]
        updatedLists[index].enabled = enabled
        await BlockingListManager.updateBlockingList(index, updatedLists[index])
        setBlockingLists(updatedLists)
    }

    const removeBlockingList = async (id: string) => {
        await BlockingListManager.deleteBlockingList(id)
        const updatedLists = blockingLists.filter((list) => list.id !== id)
        setBlockingLists(updatedLists)
        toast({ title: "Blocking list removed." })
    }

    return (
        <>
            <div className="mb-4">
                <Input
                    placeholder="Enter blocking list URL"
                    value={newListUrl}
                    onChange={(e) => setNewListUrl(e.target.value)}
                />
                <Button
                    disabled={newListUrl === ""}
                    onClick={addBlockingList}
                    className="mt-2"
                >
                    Add Blocking List
                </Button>
            </div>

            {blockingLists.length > 0 ? (
                <div className="space-y-4">
                    {blockingLists.map((list, index) => (
                        <div key={list.id} className="p-4 border rounded">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">
                                        {list.name}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {list.url}
                                    </p>
                                </div>
                                <Switch
                                    checked={list.enabled}
                                    onCheckedChange={(checked) =>
                                        toggleBlockingList(index, checked)
                                    }
                                />
                            </div>
                            <Button
                                variant="destructive"
                                onClick={() => removeBlockingList(list.id)}
                                className="mt-2"
                            >
                                Remove
                            </Button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-sm text-muted-foreground">
                    No blocking lists added.
                </p>
            )}
        </>
    )
}

export default BlockingLists
