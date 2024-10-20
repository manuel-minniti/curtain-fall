// Thanks to Kent C. Dodds
// https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
type ErrorWithMessage = {
    message: string
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
    return (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as Record<string, unknown>).message === "string"
    )
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
    if (isErrorWithMessage(maybeError)) return maybeError

    try {
        return new Error(JSON.stringify(maybeError))
    } catch {
        return new Error(String(maybeError))
    }
}

function getErrorMessage(error: unknown) {
    return toErrorWithMessage(error).message
}

const reportError = ({ message }: { message: string }) => {
    console.error(`[${__EXTENSION_NAME__} extension]: ${message}`)
}

export {
    ErrorWithMessage,
    isErrorWithMessage,
    toErrorWithMessage,
    getErrorMessage,
    reportError
}
