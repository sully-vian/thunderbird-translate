if (typeof messenger === "undefined") {
    console.error("Messenger API not available!");
}

messenger.messageDisplayAction.onClicked.addListener(async (tab) => {
    const message = await messenger.messageDisplay.getDisplayedMessage(tab.id);
    await translateEmail(message, tab.id);
});

async function translateEmail(message, tabID) {
    const fullMessage = await messenger.messages.getFull(message.id);
    const { content, html } = extractTextFromMessage(fullMessage);

    if (content === undefined) {
        console.log("Failed to get message content");
        messenger.tabs.sendMessage(tabID, {
            action: "showBanner",
            content: "Failed to get email content.",
            status: "error",
            html: false
        });
        return;
    }

    try {

        const translatedContent = await callGemini(content);

        // Send a message to the content script to display the banner
        messenger.tabs.sendMessage(tabID, {
            action: "showBanner",
            content: translatedContent,
            status: "success",
            html: html
        });
    } catch (error) {
        console.log("Translation failed:", error);

        // send an error message to the content script
        messenger.tabs.sendMessage(tabID, {
            action: "showBanner",
            content: error.message || "An unexpected error occured during translation",
            status: "error",
            html: false
        });
    }
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

    // prefer html
    if (htmlContent) {
        return {
            content: htmlContent,
            html: true
        };
    } else if (plainContent) {
        return {
            content: plainContent,
            html: false
        };
    } else {
        return {
            content: undefined,
            html: false
        }
    }
}

// add listener for opening option page
browser.runtime.onMessage.addListener((message) => {
    console.log("recieved msg");
    if (message.action === "openOptionsPage") {
        // Open the options page
        browser.tabs.create({
            url: browser.runtime.getURL("/src/options/options.html")
        });
    }
});

const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const prompt = `
You are a professional translator. Translate the following email to ${browser.i18n.getUILanguage()}.

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

    if (!storage.apiKey) {
        throw new Error("API key is not set. Please configure it in the extension settings.");
    }

    const fullPrompt = prompt + htmlText;
    console.log(fullPrompt);

    const request = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": storage.apiKey,
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

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || "Translation failed due to an API error.");
    }

    const data = await response.json();


    // console.log(JSON.stringify(data, null, 2));

    // Access the actual text output:
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const translatedHTML = data.candidates[0].content.parts[0].text
        return translatedHTML;
    }

    throw new Error("The API response didn't have the expected form.");
}
