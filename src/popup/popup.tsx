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
import {
    ACTION_START_SELECTING,
    ACTION_STOP_SELECTING,
    EXTENSION_NAME
} from "@/constants"

import { ThemeSwitcher } from "@/components/ThemeSwitcher"

function Popup() {
    const [isSelecting, setIsSelecting] = useState<boolean>(false)
    const [isEnabled, setIsEnabled] = useState<boolean>(true)
    const [showReload, setShowReload] = useState<boolean>(false)

    useEffect(() => {
        RemovalsManager.getExtensionEnabled().then((enabled) => {
            setIsEnabled(enabled)
        })
    }, [])

    const handleToggle = (checked: boolean) => {
        setIsEnabled(checked)
        RemovalsManager.setExtensionEnabled(checked)

        setShowReload(true)
    }

    const handleReload = async () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id !== undefined) {
                chrome.tabs.reload(tabs[0].id)
            }
        })

        setShowReload(false)
    }

    const handleSelectClick = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id !== undefined) {
                if (!isSelecting) {
                    chrome.tabs.sendMessage(
                        tabs[0].id,
                        {
                            action: ACTION_START_SELECTING
                        },
                        () => {
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
                            action: ACTION_STOP_SELECTING
                        },
                        () => {
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
        <div className="w-[354px]">
            <div className="p-4">
                <span className="flex items-center justify-between gap-2 mb-2">
                    <img
                        src={ExtensionIcon}
                        alt={EXTENSION_NAME}
                        className="w-8 h-8"
                    />
                    <span className="text-lg font-bold block flex-1">
                        {EXTENSION_NAME}
                    </span>
                    <ThemeSwitcher />
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
                {showReload && (
                    <div className="mt-2 p-4 flex flex-col items-center justify-items-center bg-muted border-2 border-primary rounded">
                        <div className="text-sm text-foreground mb-2">
                            Reload required
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                            Reload the tab to apply changes.
                        </div>
                        <Button onClick={handleReload} variant="outline">
                            Reload
                        </Button>
                    </div>
                )}
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
                    {!isSelecting && (
                        <Button onClick={openOptions} variant="outline">
                            Options
                        </Button>
                    )}
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
