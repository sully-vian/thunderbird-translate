if (!browser) {
  console.warn('missing "browser"');
} else if (!browser.storage) {
  console.warn('missing "browser.storage"');
} else if (!browser.storage.local) {
  console.warn('missing "browser.storage.local"');
}

const apiKeyInput = document.getElementById("apiKeyInput") as HTMLInputElement;
const statusPar = document.getElementById("status") as HTMLParagraphElement;
const testButton = document.getElementById("testButton") as HTMLButtonElement;

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
      "X-goog-api-key": apiKey,
    },
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
    console.warn("Error testing API key:", error);
    statusPar.textContent = "An error occurred. Please try again.";
    statusPar.style.color = "red";

    // Clear the error message after 3 seconds
    setTimeout(() => {
      statusPar.textContent = "";
      statusPar.style.color = "green";
    }, 3000);
  }
};

// main function
(async () => {
  const storage = await messenger.storage.local.get("apiKey");
  if (storage.apiKey) {
    apiKeyInput.value = storage.apiKey;
    console.warn("API found in storage");
  } else {
    console.warn("no API key in storage");
  }
})();
