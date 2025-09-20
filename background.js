if (typeof messenger === "undefined") {
    console.log("Messenger API not available");
} else {
    console.log("Messenger API available!");
}

messenger.messageDisplayAction.onClicked.addListener(async (tab) => {
    const message = await messenger.messageDisplay.getDisplayedMessage(tab.id);
    await translateEmail(message);
});

async function translateEmail(message) {
    const fullMessage = await messenger.messages.getFull(message.id);
    const emailText = extractTextFromMessage(fullMessage);

    if (emailText === undefined) {
        console.log("Failed to get message content");
        return;
    } else {
        console.log("success!");
    }

    const translatedHTML = await callGemini(emailText);

    // end of code
    console.log("translatedHTML:");
    console.log(translatedHTML);

    // TODO: find a way to display
}

function extractTextFromMessage(fullMessage) {
    let htmlContent = null;
    let plainContent = null;

    function searchParts(parts) {
        for (const part of parts) {
            if (part.contentType === "text/html" && part.body) {
                console.log("found html");
                htmlContent = part.body;
            }
            if (part.contentType === "text/plain" && part.body) {
                console.log("found plain text");
                plainContent = part.body;
            }
            // multipart case, we work recursively
            if (part.contentType.startsWith("multipart/") && part.parts) {
                searchParts(part.parts);
            }
        }
    }

    if (fullMessage.parts) {
        searchParts(fullMessage.parts);
    }

    // Prefer one
    return plainContent || htmlContent;
}

const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const prompt = `
You are a professional translator. Translate the following email to English.

CRITICAL RULES:
- If the content contains HTML tags, preserve ALL HTML structure exactly
- Only translate the actual text content, not markup, URLs, or email addresses
- Do NOT add explanations, commentary, or markdown formatting
- Return ONLY the translated content
- Translate from French to English

Content to translate:
`;

async function callGemini(htmlText) {

    const storage = await browser.storage.local.get("apiKey");
    const API_KEY = storage.apiKey;

    if (!API_KEY) {
        console.log("API key is not set.Please configure it in the extension settings.");
        throw new Error("API key is missing.");
    }

    const fullPrompt = prompt + htmlText;
    console.log(fullPrompt);

    const request = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": API_KEY,
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            text: fullPrompt,
                        },
                    ],
                },
            ],
        }),
    };

    // console.log(JSON.stringify(request, null, 2));

    const response = await fetch(url, request);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}\nMessage: ${data.error.message}`);
    }

    // console.log(JSON.stringify(data, null, 2));

    // Access the actual text output:
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const translatedHTML = data.candidates[0].content.parts[0].text

        return translatedHTML
    }
}
