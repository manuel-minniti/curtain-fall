import puppeteer from "puppeteer"
import type { Browser, Page } from "puppeteer"

describe("Curtain Fall Element Selection", () => {
    let browser: Browser
    let page: Page

    beforeAll(async () => {
        browser = await puppeteer.launch({
            headless: false,
            args: [
                // Add the path to your extension
                `--disable-extensions-except=dist`,
                `--load-extension=dist`
            ]
        })
        page = await browser.newPage()
        await page.goto("https://example.com")
    })

    afterAll(async () => {
        await browser.close()
    })

    test("Should highlight elements on hover", async () => {
        // Simulate starting selection
        await page.evaluate(() => {
            chrome.runtime.sendMessage({ action: "startSelecting" })
        })

        // Hover over an element
        await page.hover("h1")

        // Check if highlightDiv exists
        const highlightExists = await page.evaluate(() => {
            return !!document.querySelector(
                'div[style*="pointer-events: none"]'
            )
        })

        expect(highlightExists).toBe(true)
    })
})
