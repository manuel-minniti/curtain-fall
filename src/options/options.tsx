import React from "react"

import { Button } from "@/components/ui/button"

import BlockingLists from "./BlockingLists"
import Removals from "./Removals"

import { defaultRemovals } from "@/state/removal"
import Navigation, { useNavigation } from "@/components/Navigation"

const NavigationItems = ["Removals", "Blocking Lists"]

function Options() {
    const { setSelectedItem, ...navigationProps } = useNavigation({
        initialItem: NavigationItems[0],
        items: NavigationItems
    })

    const menuItem = navigationProps.selectedItem

    return (
        <div className="p-4 min-h-[440px] min-w-[600px]">
            {__DEV__ && (
                <div className="p-4 mb-2 bg-amber-100 text-amber-800 rounded space-y-2">
                    <div className="font-bold">Development Mode</div>
                    <div className="text-sm">
                        You are currently in development mode. This mode allows
                        you to test the extension without affecting the browser.
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

            <div className="mb-2">
                <Navigation {...navigationProps} onSelect={setSelectedItem} />
            </div>

            {menuItem === NavigationItems[0] && <Removals />}
            {menuItem === NavigationItems[1] && <BlockingLists />}
        </div>
    )
}

export default Options
