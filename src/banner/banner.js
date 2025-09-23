// Listen for messages from the background script
browser.runtime.onMessage.addListener(({ action, content, status, html }) => {
    if (action === "showBanner") {
        showBanner(content, status, html);
    }
});

async function showBanner(content, status, html) {
    const existingBanner = document.querySelector(".translation-banner");
    if (existingBanner) {
        // remove old banner
        existingBanner.remove();
    }

    const response = await fetch(browser.runtime.getURL("src/banner/banner.html"));
    const bannerHTML = await response.text();

    const container = document.createElement("div");
    container.innerHTML = bannerHTML;
    const banner = container.firstChild;
    banner.classList.add(status);

    const bannerText = banner.querySelector("#banner-text");
    if (html) {
        bannerText.innerHTML = content;
    } else {
        bannerText.innerText = content;
    }

    const settingsLink = banner.querySelector("#settings-link");
    settingsLink.onclick = (event) => {
        event.preventDefault();
        browser.runtime.sendMessage({ action: "openOptionsPage" });
    };

    document.body.insertBefore(banner, document.body.firstChild);
}