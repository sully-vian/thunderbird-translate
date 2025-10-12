# Thunderbird Add-on Review Fixes: "Thunderbird Translate"

This document summarizes the reviewer feedback and provides a step-by-step action plan and exact code snippets to fix the issues flagged by the Thunderbird Add-on Review team. Use this as a checklist while implementing the changes and preparing a new build for re-submission.

---

## Summary of review issues

Reviewer: John Bieling

Key requests:

1. Add a prominent privacy/data notice on the options page explaining which data is sent to the external AI service.
2. Improve the add-on listing and README with more information and screenshots showing usage.
3. Remove unsafe uses of `innerHTML` in `banner.js` and avoid `innerText` — build DOM safely instead.
4. Sanitize translated HTML; vendorize DOMPurify and use it (include VENDORS file with source URL).
5. Prefer sanitization in the background script; content script should only insert already-sanitized HTML using `insertAdjacentHTML` (or set textContent for plain text).
6. Remove hardcoded source language in prompts (use auto-detection or UI language).

---

## Files to update (primary)

- `VENDORS` (new) — list of third-party libraries and sources used (DOMPurify link).
- `src/vendor/purify.min.js` (new) — bundled DOMPurify minified file.
- `manifest.json` — register vendor script in background and ensure `applications.gecko.id` and proper permissions.
- `src/background/bannerRegister.js` — inject/register vendor before banner script and for existing tabs.
- `src/background/background.js` — sanitize translated HTML using `DOMPurify.sanitize()` and remove hardcoded source language in prompt.
- `src/banner/banner.js` — remove `innerHTML`/`innerText` usage; build DOM using `createElement()` and `appendChild()`. Use `insertAdjacentHTML()` only for sanitized HTML payloads.
- `src/options/options.html` — add a prominent privacy/data notice.
- `README.md` — expand usage, screenshots and privacy data description.

---

## Checklist

- [ ] Add `VENDORS` file listing DOMPurify source
- [ ] Add `src/vendor/purify.min.js` (DOMPurify bundle)
- [ ] Update `manifest.json` to include vendor script in background `scripts` before your extension scripts
- [ ] Modify `src/background/bannerRegister.js` to register/inject vendor first
- [ ] Sanitize translated HTML in `src/background/background.js` (use DOMPurify)
- [ ] Replace `innerHTML` usage in `src/banner/banner.js` with safe DOM creation and `insertAdjacentHTML` only for sanitized HTML
- [ ] Replace `innerText` with `textContent` where applicable
- [ ] Add privacy/data notice to `src/options/options.html`
- [ ] Update README and AMO listing assets (screenshots)
- [ ] Run `npx web-ext lint`, fix warnings, run build, test, and re-submit

---

## Detailed changes and code snippets

### 1) VENDORS file (new)
Create a file at repository root named `VENDORS` with the following content (this informs reviewers where the library was obtained):

```
DomPurify 3.2.7: https://cdn.jsdelivr.net/npm/dompurify@3.2.7/dist/purify.min.js
```

Download the file above and place the minified bundle in `src/vendor/purify.min.js`.

---

### 2) bundle DOMPurify into the extension
Download the minified build from the VENDORS URL and save it to `src/vendor/purify.min.js`.

(Do not load DOMPurify from a CDN at runtime — vendorize it.)

---

### 3) Register vendor in `manifest.json` (background scripts)

Add `src/vendor/purify.min.js` before your background scripts so DOMPurify is available to background code.

```json
"background": {
  "scripts": [
    "src/vendor/purify.min.js",
    "src/background/bannerRegister.js",
    "src/background/background.js"
  ],
  "persistent": false
},
```

Also ensure you have an `applications.gecko.id` entry and required permissions (e.g., `messages`, `storage`, `tabs`).

---

### 4) Inject vendor before banner script for already-open message tabs

Edit `src/background/bannerRegister.js` so when injecting into already-open message tabs you first run the vendor script then your banner script. Also register `messageDisplayScripts` with the vendor script before banner script so new tabs get both.

```js
// ...existing code...
await browser.tabs.executeScript(messageTab.id, { file: "src/vendor/purify.min.js" });
await browser.tabs.executeScript(messageTab.id, { file: "src/banner/banner.js" });
browser.tabs.insertCSS(messageTab.id, { file: "src/banner/banner.css" });
// ...existing code...
```

Note: use `messageDisplayScripts.register({ js: [{ file: 'src/vendor/purify.min.js' }, { file: 'src/banner/banner.js' }], css: [...] })` so new message tabs receive both.

---

### 5) Sanitize translated HTML in background before sending to content script

In `src/background/background.js` (the translation flow), after receiving the translated text from the API, sanitize if it represents HTML. Example:

```js
// After receiving translatedContent from the API
let payloadContent = translatedContent;
let payloadIsHtml = isHtml;
if (isHtml && typeof DOMPurify !== 'undefined') {
  payloadContent = DOMPurify.sanitize(translatedContent);
  payloadIsHtml = true;
}

messenger.tabs.sendMessage(tabId, {
  action: 'showBanner',
  content: payloadContent,
  html: payloadIsHtml
});
```

This ensures content scripts only receive sanitized HTML.

Also remove the hardcoded "French to English" in the prompt — detect language or use UI language.

---

### 6) Remove `innerHTML` and `innerText` usage in banner

Replace DOM construction in `src/banner/banner.js` to build elements with `createElement()` and `appendChild()`. Use `insertAdjacentHTML()` only for sanitized HTML payloads (payload is sanitized in background).

```js
// receive message
browser.runtime.onMessage.addListener(({ action, content, html }) => {
  if (action === 'showBanner') showBanner(content, html);
});

function showBanner(content, html) {
  const existing = document.querySelector('.translation-banner');
  if (existing) existing.remove();

  const banner = document.createElement('div');
  banner.className = 'translation-banner';

  const text = document.createElement('div');
  text.className = 'banner-text';

  if (html) {
    // content already sanitized in background
    text.insertAdjacentHTML('beforeend', content);
  } else {
    text.textContent = content;
  }

  const settingsLink = document.createElement('a');
  settingsLink.href = '#';
  settingsLink.textContent = 'Open Settings';
  settingsLink.addEventListener('click', (e) => {
    e.preventDefault();
    browser.runtime.sendMessage({ action: 'openOptionsPage' });
  });

  banner.appendChild(text);
  banner.appendChild(settingsLink);
  document.body.insertBefore(banner, document.body.firstChild);
}
```

Replace any remaining `.innerText` usages by `.textContent`.

---

### 7) Add prominent data/privacy notice to options page

Edit `src/options/options.html` to include a clear notice at the top of the page describing what data is sent to the AI service and how the API key is stored.

```html
<div id="data-notice" style="border:1px solid #ccc; padding:12px; background:#fffbe6; margin-bottom:12px;">
  <strong>Privacy notice:</strong>
  When you request a translation we send the message body (text or HTML) to the external AI translation service you configure.
  The API key is stored locally in Thunderbird storage and is not transmitted except to the API provider when making requests.
</div>
```

Be explicit and prominent.

---

### 8) Update README and AMO listing

- Add a Usage section with steps and screenshots showing the banner and the translate button.
- Add a Privacy section that explains what is sent to the translation API and that the API key is stored locally.

---

### 9) Lint, pack, and re-submit

- Run `npx web-ext lint` and fix warnings.
- Build `.xpi` using `npm run build` (or `web-ext build`), sign if needed, and upload a new version to AMO.

---

## Notes and reasoning

- Do not pull DOMPurify from a CDN at runtime — vendorize it and list it in `VENDORS` for reviewers.
- Sanitize in the background where possible, so the content script only receives safe HTML to insert.
- Avoid `innerHTML` for building DOM nodes for performance and security; the use of `insertAdjacentHTML()` is acceptable if the HTML has been sanitized.
- Remove hardcoded source-language instructions in prompts to avoid misclassification; prefer auto-detection or UI language.

---

If you'd like, I can apply these changes directly to the repository. Tell me which items you'd like me to implement first and I'll start editing files and running the lint/build steps.
