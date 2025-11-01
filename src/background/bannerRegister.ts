(async () => {
  // Register the message display script for all newly opened message tabs.
  messenger.messageDisplayScripts.register({
    js: [{ file: "/src/banner/banner.js" }],
    css: [{ file: "/src/banner/banner.css" }],
  });

  // Inject script and CSS in all already open message tabs.
  const openTabs = await messenger.tabs.query();
  const messageTabs = openTabs.filter(
    (tab) => tab.type && ["mail", "messageDisplay"].includes(tab.type),
  );
  for (const messageTab of messageTabs) {
    if (!messageTab.id) {
      continue;
    }
    // Make sure the tab is displaying a single message. The mail tab could also
    // display a content page or multiple messages, which will cause an error.
    if (messageTab.type === "mail") {
      const messages = await browser.messageDisplay.getDisplayedMessages(
        messageTab.id,
      );
      if (messages.length != 1) {
        continue;
      }
    }
    await browser.tabs.executeScript(messageTab.id, {
      file: "/src/banner/banner.js",
    });
    browser.tabs.insertCSS(messageTab.id, {
      file: "/src/banner/banner.css",
    });
  }
})();
