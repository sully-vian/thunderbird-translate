async function showBanner() {
    console.log("show banner");
    const banner = document.createElement("div");
    banner.style.backgroundColor = "var(--color-primary-soft)";
    banner.style.color = "var(--color-text-highlight)";
    banner.style.padding = "10px";
    banner.style.margin = "10px";
    banner.style.borderBottom = "1px solid var(--color-neutral-border)";
    banner.style.fontFamily = "var(--font-body)";
    banner.style.fontSize = "var(--font-size-body)";
    banner.style.display = "flex";
    banner.style.alignItems = "center";

    const bannerText = document.createElement("div");
    bannerText.className = "thunderbirdMessageDisplayActionExample_Text";
    bannerText.innerText = "Here is a Banner";

    banner.appendChild(bannerText);

    document.body.insertBefore(banner, document.body.firstChild);
}

showBanner();