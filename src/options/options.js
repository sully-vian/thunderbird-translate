if (!browser) {
    console.log("missing \"browser\"");
} else if (!browser.storage) {
    console.log("missing \"browser.storage\"");
} else if (!browser.storage.local) {
    console.log("missing \"browser.storage.local\"");
}

const apiKeyInput = document.getElementById("apiKeyInput");
const statusPar = document.getElementById("status");
const testButton = document.getElementById("testButton");

testButton.onclick = async () => {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
        statusPar.textContent = "Please enter a valid API key.";
        statusPar.style.color = "red";
        setTimeout(() => {
            statusPar.textContent = "";
            statusPar.style.color = "green";
        }, 3000);
        return;
    }

    const url = "https://generativelanguage.googleapis.com/v1/models";

    const request = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": apiKey
        }
    };

    try {
        const response = await fetch(url, request);

        if (response.ok) {
            // Save the API key if the fetch is successful
            await messenger.storage.local.set({ apiKey });
            statusPar.textContent = "API key saved successfully!";
            statusPar.style.color = "green";

            // Clear the status message after 3 seconds
            setTimeout(() => {
                statusPar.textContent = "";
            }, 3000);

            console.log(JSON.stringify(messenger.storage.local));
        } else {
            // Notify the user if the API key is invalid
            statusPar.textContent = "Invalid API key. Please try again.";
            statusPar.style.color = "red";

            // Clear the error message after 3 seconds
            setTimeout(() => {
                statusPar.textContent = "";
                statusPar.style.color = "green";
            }, 3000);
        }
    } catch (error) {
        console.error("Error testing API key:", error);
        statusPar.textContent = "An error occurred. Please try again.";
        statusPar.style.color = "red";

        // Clear the error message after 3 seconds
        setTimeout(() => {
            statusPar.textContent = "";
            statusPar.style.color = "green";
        }, 3000);
    }
};


async function main() {
    const storage = await messenger.storage.local.get("apiKey");
    if (storage.apiKey) {
        apiKeyInput.value = storage.apiKey;
        console.log("API found in storage");
    } else {
        console.log("no API key in storage");
    }
}

main();