const standardRemovals = [
    {
        name: "Example 1",
        elementSelectors: [".cmpbox", ".cmpboxBG"],
        classRemoval: [],
        styleReset: [{ elementSelector: "body", styles: { overflow: "" } }],
    },
    {
        name: "Example 2",
        elementSelectors: ['[id^="sp_message_container_"]'],
        classRemoval: [
            { elementSelector: "html", className: "sp-message-open" },
        ],
        styleReset: [{ elementSelector: "html", styles: { overflow: "" } }],
    },
    // Additional removals...
];

// Helper functions (same as before)
function removeElements(selectors) {
    selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el) => el.remove());
    });
}

function removeClasses(classRemovalList) {
    classRemovalList.forEach(({ elementSelector, className }) => {
        document.querySelectorAll(elementSelector).forEach((element) => {
            if (className) {
                element.classList.remove(className);
            }
        });
    });
}

function resetStyles(styleResetList) {
    styleResetList.forEach(({ elementSelector, styles }) => {
        document.querySelectorAll(elementSelector).forEach((element) => {
            Object.keys(styles).forEach((styleProp) => {
                element.style[styleProp] = styles[styleProp];
            });
        });
    });
}

function processRemovals(removals) {
    removals.forEach((removal) => {
        removeElements(removal.elementSelectors || []);
        removeClasses(removal.classRemoval || []);
        resetStyles(removal.styleReset || []);
    });
}

// Load user removals from storage and merge with standard removals
async function init() {
    try {
        // Load user-defined removals from storage
        chrome.storage.sync.get(["modalRemovals"], (result) => {
            const userRemovals = result.modalRemovals || [];

            // Merge removals
            const allRemovals = [...standardRemovals, ...userRemovals];

            if (allRemovals.length === 0) {
                // No removals configured; exit early
                return;
            }

            // Initial processing
            processRemovals(allRemovals);

            // Observe for dynamically added modals
            const observer = new MutationObserver(() => {
                processRemovals(allRemovals);
            });

            observer.observe(document.documentElement, {
                childList: true,
                subtree: true,
            });
        });
    } catch (error) {
        console.error("Error initializing Curtain Fall:", error);
    }
}

// Initialize the script
init();
