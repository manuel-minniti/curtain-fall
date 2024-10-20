import React from "react"
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem
} from "@radix-ui/react-navigation-menu"

import { Button } from "./ui/button"

interface NavigationHookProps {
    initialItem: string
    items: string[]
}
export const useNavigation = (props: NavigationHookProps) => {
    const [selectedItem, setSelectedItem] = React.useState(props?.initialItem)
    const items = props.items
    return {
        selectedItem,
        items,
        setSelectedItem
    }
}

interface NavigationProps {
    initialItem?: string
    selectedItem: string
    items: string[]
    onSelect: (item: string) => void
}
const Navigation = ({ items, selectedItem, onSelect }: NavigationProps) => {
    return (
        <NavigationMenu>
            <NavigationMenuList className="flex space-x-2">
                {items.map((item) => (
                    <NavigationMenuItem
                        key={item}
                        value={item}
                        onClick={() => onSelect(item)}
                    >
                        <Button
                            variant={
                                item === selectedItem ? "default" : "ghost"
                            }
                            className="text-sm"
                        >
                            {item}
                        </Button>
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    )
}

export default Navigation
