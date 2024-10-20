import React, { useEffect, useState } from "react"

import { Progress } from "@/components/ui/progress"

import {
    ModalRemoval,
    RemovalsManager,
    defaultRemovals
} from "../state/removal"

import EditRemovalForm from "../components/EditRemovalForm"

const MAX_LOADING_TIME = 2000

function RemovalPopup() {
    const [removal, setRemoval] = useState<ModalRemoval | null>(null)
    const [progress, setProgress] = useState<number>(0)

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const removalId = params.get("id")

        if (removalId) {
            RemovalsManager.getRemovals().then((removals) => {
                const foundRemoval = removals.find((r) => r.id === removalId)
                if (foundRemoval) {
                    setRemoval(foundRemoval)
                } else {
                    setRemoval(null)
                }

                if (__DEV__) {
                    setRemoval(defaultRemovals[0])
                }
            })
        }
    }, [])

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => prev + 10)
        }, MAX_LOADING_TIME / 10)

        return () => {
            clearInterval(timer)
        }
    }, [])

    return (
        <div className="p-4 min-h-screen">
            {progress < 100 && !removal && <Progress value={progress} />}
            {progress >= 100 && !removal && (
                <div>
                    <h1 className="text-xl font-bold mb-4">
                        Removal Not Found
                    </h1>
                    <p>
                        The removal you are looking for does not exist. Please
                        try again.
                    </p>
                </div>
            )}

            {removal && (
                <>
                    <h1 className="text-xl font-bold mb-4">Edit Removal</h1>
                    <EditRemovalForm
                        initialRemoval={removal}
                        onSave={async (updatedRemoval) => {
                            await RemovalsManager.updateRemoval(
                                removal.id,
                                updatedRemoval
                            )
                            window.close()
                        }}
                        onCancel={() => {
                            window.close()

                            if (__DEV__) {
                                window.location.href = "/src/popup/index.html"
                            }
                        }}
                    />
                </>
            )}
        </div>
    )
}

export default RemovalPopup
