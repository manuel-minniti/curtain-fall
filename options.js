// options.js

// DOM Elements
const removalsContainer = document.getElementById("removals-container");
const addRemovalButton = document.getElementById("add-removal");

// Load removals from storage
function loadRemovals() {
    chrome.storage.sync.get(["modalRemovals"], (result) => {
        const removals = result.modalRemovals || [];
        removalsContainer.innerHTML = "";
        removals.forEach((removal, index) => {
            addRemovalToDOM(removal, index);
        });
    });
}

// Save removals to storage
function saveRemovals() {
    const removals = [];
    const removalElements = removalsContainer.querySelectorAll(".removal");
    removalElements.forEach((el) => {
        const name = el.querySelector(".removal-name").value.trim();
        const elementSelectors = el
            .querySelector(".removal-element-selectors")
            .value.trim()
            .split("\n")
            .filter(Boolean);
        const classRemoval = el
            .querySelector(".removal-class-removal")
            .value.trim()
            .split("\n")
            .filter(Boolean)
            .map((line) => {
                const [elementSelector, className] = line
                    .split(",")
                    .map((s) => s.trim());
                return { elementSelector, className };
            });
        const styleReset = el
            .querySelector(".removal-style-reset")
            .value.trim()
            .split("\n")
            .filter(Boolean)
            .map((line) => {
                const [elementSelector, styles] = line
                    .split(":")
                    .map((s) => s.trim());
                const styleObj = {};
                styles.split(";").forEach((stylePair) => {
                    const [prop, value] = stylePair
                        .split("=")
                        .map((s) => s.trim());
                    if (prop && value !== undefined) {
                        styleObj[prop] = value;
                    }
                });
                return { elementSelector, styles: styleObj };
            });

        removals.push({
            name,
            elementSelectors,
            classRemoval,
            styleReset,
        });
    });

    chrome.storage.sync.set({ modalRemovals: removals }, () => {
        alert("Removals saved successfully!");
    });
}

// Add removal to DOM
function addRemovalToDOM(removal = {}, index) {
    const removalDiv = document.createElement("div");
    removalDiv.className = "removal";

    removalDiv.innerHTML = `
    <label>
      Removal Name:
      <input type="text" class="removal-name" value="${
          removal.name || ""
      }" placeholder="Enter removal name">
    </label>
    <label>
      Element Selectors (one per line):
      <textarea class="removal-element-selectors" rows="3" placeholder=".modal\n#overlay">${(
          removal.elementSelectors || []
      ).join("\n")}</textarea>
    </label>
    <label>
      Class Removals (elementSelector, className per line):
      <textarea class="removal-class-removal" rows="3" placeholder="html, no-scroll\nbody, modal-open">${(
          removal.classRemoval || []
      )
          .map((cr) => `${cr.elementSelector}, ${cr.className}`)
          .join("\n")}</textarea>
    </label>
    <label>
      Style Resets (elementSelector: prop=value; per line):
      <textarea class="removal-style-reset" rows="3" placeholder="body: overflow=; height=auto;">${(
          removal.styleReset || []
      )
          .map((sr) => {
              const styles = Object.entries(sr.styles)
                  .map(([prop, value]) => `${prop}=${value}`)
                  .join("; ");
              return `${sr.elementSelector}: ${styles}`;
          })
          .join("\n")}</textarea>
    </label>
    <div class="removal-actions">
      <button class="save-removal">Save</button>
      <button class="delete-removal">Delete</button>
    </div>
  `;

    // Event Listeners for Save and Delete buttons
    const saveButton = removalDiv.querySelector(".save-removal");
    const deleteButton = removalDiv.querySelector(".delete-removal");

    saveButton.addEventListener("click", saveRemovals);
    deleteButton.addEventListener("click", () => {
        removalDiv.remove();
        saveRemovals();
    });

    removalsContainer.appendChild(removalDiv);
}

// Event Listener for Adding New Removal
addRemovalButton.addEventListener("click", () => {
    addRemovalToDOM();
});

// Load removals on page load
document.addEventListener("DOMContentLoaded", loadRemovals);
