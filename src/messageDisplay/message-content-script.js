// Listen for messages from the background script
browser.runtime.onMessage.addListener(({ action, content, success, html }) => {
    if (action === "showBanner") {
        showBanner(content, success, html);
    }
});

async function showBanner(content, success, html) {
    const existingBanner = document.getElementById("translation-banner")
    if (existingBanner) {
        // remove old banner
        existingBanner.remove();
    }

    console.log("show banner");
    const banner = document.createElement("div");
    banner.id = "translation-banner";

    // Set colors depending on success or not
    if (success) {
        banner.style.backgroundColor = "var(--color-primary-soft)";
        banner.style.color = "var(--color-text-highlight)";
    } else {
        banner.style.backgroundColor = "var(--color-danger-soft)";
        banner.style.color = "var(--color-text-critical)";
    }
    banner.style.overflowX = "auto";
    banner.style.padding = "10px";
    banner.style.margin = "10px";
    banner.style.fontFamily = "var(--font-body)";
    banner.style.fontSize = "var(--font-size-body)";
    banner.style.display = "flex";
    banner.style.alignItems = "center";

    const bannerText = document.createElement("div");
    bannerText.className = "thunderbirdMessageDisplayActionExample_Text";

    // Preserve formatting without monospace font
    bannerText.style.whiteSpace = "pre-wrap"; // Preserve line breaks and spaces
    bannerText.style.wordWrap = "break-word"; // Break long words if necessary

    if (html) {
        bannerText.innerHTML = content;
    } else {
        bannerText.innerText = content;
    }

    banner.appendChild(bannerText);

    document.body.insertBefore(banner, document.body.firstChild);
}