interface Window {
    chrome: typeof chrome
}

declare module "*.png" {
    const value: string
    export default value
}

declare const __DEV__: boolean
declare const __EXTENSION_ID__: string
