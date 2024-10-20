import React, { useState } from "react"

import { ModalRemoval } from "../state/removal"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button, ButtonProps } from "@/components/ui/button"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from "@/components/ui/collapsible"

import { ChevronDownIcon } from "@radix-ui/react-icons"

import { getErrorMessage, reportError } from "@/lib/error"
import { ClassRemoval, RemovalItem } from "@/types"

interface EditRemovalFormProps {
    initialRemoval: ModalRemoval
    onSave: (removal: ModalRemoval) => void
    onCancel?: () => void
}

type RemovalUpdate = Partial<ModalRemoval>

const SmallButton = (props: ButtonProps) => (
    <Button size="sm" {...props}>
        {props.children}
    </Button>
)

function EditRemovalForm({
    initialRemoval,
    onSave,
    onCancel
}: EditRemovalFormProps) {
    const [removal, setRemoval] = useState<ModalRemoval>({ ...initialRemoval })

    // Handle changes to the removal properties
    const handleChange = (field: keyof ModalRemoval, value: string) => {
        setRemoval((prev) => ({ ...prev, [field]: value }))
    }

    // Handle changes to selectors, class removals, and style resets
    const handleArrayChange = (
        arrayName: keyof ModalRemoval,
        index: number,
        value: RemovalItem | string
    ) => {
        setRemoval((prev) => {
            const updatedArray = [...(prev[arrayName] as RemovalUpdate[])]
            updatedArray[index] = value as RemovalUpdate
            return { ...prev, [arrayName]: updatedArray }
        })
    }

    const addArrayItem = (
        arrayName: keyof ModalRemoval,
        newItem: RemovalItem
    ) => {
        setRemoval((prev) => {
            const updatedArray = [
                ...(prev[arrayName] as RemovalUpdate[]),
                newItem
            ]
            return { ...prev, [arrayName]: updatedArray }
        })
    }

    const removeArrayItem = (arrayName: keyof ModalRemoval, index: number) => {
        setRemoval((prev) => {
            const updatedArray = [...(prev[arrayName] as RemovalUpdate[])]
            updatedArray.splice(index, 1)
            return { ...prev, [arrayName]: updatedArray }
        })
    }

    const handleSave = () => {
        onSave(removal)
    }

    return (
        <div className="py-4">
            {/* Title */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                    value={removal.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                />
            </div>

            {/* Description */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                    Description
                </label>
                <Textarea
                    value={removal.description}
                    onChange={(e) =>
                        handleChange("description", e.target.value)
                    }
                />
            </div>

            {/* Screenshot */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                    Screenshot
                </label>
                <img src={removal.screenshot} alt={removal.name} />
            </div>

            <Collapsible className="mb-4">
                <CollapsibleTrigger asChild>
                    <Button variant="outline">
                        Advanced
                        <ChevronDownIcon className="w-4 h-4" />
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="py-2">
                    {/* Element Selectors */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                            Element Selectors
                        </label>
                        {removal.elementSelectors.map((selector, index) => (
                            <div
                                key={index}
                                className="flex items-center space-x-2 mb-2"
                            >
                                <Input
                                    value={selector as string}
                                    onChange={(e) =>
                                        handleArrayChange(
                                            "elementSelectors",
                                            index,
                                            e.target.value
                                        )
                                    }
                                />
                                <SmallButton
                                    variant="destructive"
                                    onClick={() =>
                                        removeArrayItem(
                                            "elementSelectors",
                                            index
                                        )
                                    }
                                >
                                    Remove
                                </SmallButton>
                            </div>
                        ))}
                        <SmallButton
                            variant="secondary"
                            onClick={() => addArrayItem("elementSelectors", "")}
                        >
                            Add Selector
                        </SmallButton>
                    </div>

                    {/* Class Removals */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                            Class Removals
                        </label>
                        {removal.classRemoval.map(
                            (item: ClassRemoval, index) => (
                                <div key={index} className="mb-2">
                                    <label className="block text-sm">
                                        Element Selector
                                    </label>
                                    <Input
                                        value={item.elementSelector}
                                        onChange={(e) =>
                                            handleArrayChange(
                                                "classRemoval",
                                                index,
                                                {
                                                    ...item,
                                                    elementSelector:
                                                        e.target.value
                                                }
                                            )
                                        }
                                    />
                                    <label className="block text-sm mt-1">
                                        Class Name
                                    </label>
                                    <Input
                                        value={item.className || ""}
                                        onChange={(e) =>
                                            handleArrayChange(
                                                "classRemoval",
                                                index,
                                                {
                                                    ...item,
                                                    className: e.target.value
                                                }
                                            )
                                        }
                                    />
                                    <SmallButton
                                        variant="destructive"
                                        onClick={() =>
                                            removeArrayItem(
                                                "classRemoval",
                                                index
                                            )
                                        }
                                    >
                                        Remove
                                    </SmallButton>
                                </div>
                            )
                        )}
                        <SmallButton
                            variant="secondary"
                            onClick={() =>
                                addArrayItem("classRemoval", {
                                    elementSelector: "",
                                    className: ""
                                })
                            }
                        >
                            Add Class Removal
                        </SmallButton>
                    </div>

                    {/* Style Resets */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                            Style Resets
                        </label>
                        {removal.styleReset.map((item, index) => (
                            <div key={index} className="mb-2">
                                <label className="block text-sm">
                                    Element Selector
                                </label>
                                <Input
                                    value={item.elementSelector}
                                    onChange={(e) =>
                                        handleArrayChange("styleReset", index, {
                                            ...item,
                                            elementSelector: e.target.value
                                        })
                                    }
                                />
                                <label className="block text-sm mt-1">
                                    Styles (JSON)
                                </label>
                                <Textarea
                                    value={JSON.stringify(item.styles, null, 2)}
                                    onChange={(e) => {
                                        try {
                                            const styles = JSON.parse(
                                                e.target.value
                                            )
                                            handleArrayChange(
                                                "styleReset",
                                                index,
                                                {
                                                    ...item,
                                                    styles
                                                }
                                            )
                                        } catch (error) {
                                            reportError({
                                                message: getErrorMessage(error)
                                            })
                                        }
                                    }}
                                />
                                <SmallButton
                                    variant="destructive"
                                    onClick={() =>
                                        removeArrayItem("styleReset", index)
                                    }
                                >
                                    Remove
                                </SmallButton>
                            </div>
                        ))}
                        <SmallButton
                            variant="secondary"
                            onClick={() =>
                                addArrayItem("styleReset", {
                                    elementSelector: "",
                                    styles: {}
                                })
                            }
                        >
                            Add Style Reset
                        </SmallButton>
                    </div>
                </CollapsibleContent>
            </Collapsible>

            {/* Save and Cancel Buttons */}
            <div className="flex space-x-2">
                <Button onClick={handleSave}>Save</Button>
                {onCancel && (
                    <Button variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
            </div>
        </div>
    )
}

export default EditRemovalForm
