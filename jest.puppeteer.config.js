import path from "path"

const pathToExtension = path.resolve(__dirname, "dist")

export default {
    launch: {
        headless: false, // Set to true if you want to run tests in headless mode
        args: [
            `--disable-extensions-except=${pathToExtension}`,
            `--load-extension=${pathToExtension}`
        ]
    }
}
