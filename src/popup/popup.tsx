import React, { useState, useEffect } from "react"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
    CrossCircledIcon,
    CursorArrowIcon,
    HeartFilledIcon
} from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import ExtensionIcon from "@/assets/icons/icon-48.png"
import { RemovalsManager } from "../config"

function Popup() {
    const [isSelecting, setIsSelecting] = useState<boolean>(false)
    const [isEnabled, setIsEnabled] = useState<boolean>(true)

    useEffect(() => {
        RemovalsManager.getExtensionEnabled().then((enabled) => {
            setIsEnabled(enabled)
        })
    }, [])

    const handleToggle = (checked: boolean) => {
        setIsEnabled(checked)
        RemovalsManager.setExtensionEnabled(checked)
    }

    const handleSelectClick = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id !== undefined) {
                if (!isSelecting) {
                    chrome.tabs.sendMessage(
                        tabs[0].id,
                        {
                            action: "startSelecting"
                        },
                        (response) => {
                            if (chrome.runtime.lastError) {
                                console.error(chrome.runtime.lastError)
                                setIsSelecting(false)
                            } else {
                                setIsSelecting(true)
                            }
                        }
                    )
                } else {
                    chrome.tabs.sendMessage(
                        tabs[0].id,
                        {
                            action: "stopSelecting"
                        },
                        (response) => {
                            if (chrome.runtime.lastError) {
                                console.error(chrome.runtime.lastError)
                                setIsSelecting(true)
                            } else {
                                setIsSelecting(false)
                            }
                        }
                    )
                }
            }
        })
    }

    const openOptions = () => {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage()
        } else {
            window.open(chrome.runtime.getURL("options/options.html"))
        }
    }

    const selectButtonLabel = isSelecting
        ? "Click an element on the page to remove"
        : "Select Element to Remove"

    const selectButtonIconClass = "w-4 h-4 mr-2"

    return (
        <div id="curtain-fall">
            <div className="p-4">
                <span className="flex items-center gap-2 mb-2">
                    <img
                        src={ExtensionIcon}
                        alt="Curtain Fall"
                        className="w-8 h-8"
                    />
                    <span className="text-lg font-bold block">
                        Curtain Fall
                    </span>
                </span>
                <p className="text-sm text-muted-foreground mb-4">
                    ... is a Chrome extension that removes annoying pop-ups and
                    cookie banners.
                </p>
                <div className="flex items-center space-x-2">
                    <Switch
                        id="enable-extension"
                        checked={isEnabled}
                        onCheckedChange={handleToggle}
                    />
                    <Label htmlFor="enable-extension">
                        {isEnabled ? "Enabled" : "Disabled"}
                    </Label>
                </div>
            </div>
            <Separator />
            <div className="p-4">
                <div className="flex items-center space-x-2">
                    <Button
                        onClick={handleSelectClick}
                        variant={isSelecting ? "outline" : "default"}
                    >
                        {isSelecting ? (
                            <CrossCircledIcon
                                className={selectButtonIconClass}
                            />
                        ) : (
                            <CursorArrowIcon
                                className={selectButtonIconClass}
                            />
                        )}
                        {selectButtonLabel}
                    </Button>
                    <Button onClick={openOptions} variant="outline">
                        Options
                    </Button>
                </div>
            </div>
            <Separator />
            <div className="flex items-center px-4 py-2 gap-4">
                <span className="text-xs text-muted-foreground">
                    Donate to support the development of this extension.
                </span>
                <Button asChild size="sm" variant="outline">
                    <a
                        href="https://www.paypal.com/donate/?hosted_button_id=57YS5BQ6Y98MG"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <HeartFilledIcon className="mr-2" />
                        PayPal
                    </a>
                </Button>
            </div>
        </div>
    )
}

export default Popup
