async function main() {
    // Register the message display script for all newly opened message tabs.
    messenger.messageDisplayScripts.register({
        js: [{ file: "/src/messageDisplay/message-content-script.js" }],
        css: [{ file: "/src/messageDisplay/message-content-styles.css" }],
    });

    // Inject script and CSS in all already open message tabs.
    const openTabs = await messenger.tabs.query();
    const messageTabs = openTabs.filter(
        (tab) => ["mail", "messageDisplay"].includes(tab.type)
    );
    for (const messageTab of messageTabs) {
        // Make sure the tab is displayin a single message. The mail tab could also
        // display a content page or multiple messages, which will cause an error.
        if (messageTab.type === "mail") {
            const messages = await browser.messageDisplay.getDisplayedMessages(messageTab.id);
            if (messages.length != 1) {
                continue;
            }
        }
        browser.tabs.executeScript(messageTab.id, {
            file: "/src/messageDisplay/message-content-script.js"
        });
        browser.tabs.insertCSS(messageTab.id, {
            file: "/src/messageDisplay/message-content-styles.css"
        });
    }
}

main();