const settingsForm = document.getElementById("settingsForm");
const apiKeyInput = document.getElementById("apiKeyInput");
const statusPar = document.getElementById("status");

document.addEventListener("DOMContentLoaded", async () => {
    const storage = await browser.storage.local.get("apiKey");
    if (storage.apiKey) {
        apiKeyInput.value = storage.apiKey;
    }
})

settingsForm.onsubmit = async (event) => {
    event.preventDefault();
    console.log("submitted");

    const apiKey = apiKeyInput.value.trim();

    if (apiKey) {
        await browser.storage.local.set({ apiKey });
        statusPar.textContent = "API key saved successfully!";

        // clear statusPar after 3s
        setTimeout(() => {
            statusPar.textContent = "";
        }, 3000);
    }
    else {
        statusPar.textContent = "Please enter a valid API key.";
        statusPar.style.color = "red";

        // Clear the error message after 3 seconds
        setTimeout(() => {
            document.getElementById("status").textContent = "";
            document.getElementById("status").style.color = "green";
        }, 3000);
    }
};