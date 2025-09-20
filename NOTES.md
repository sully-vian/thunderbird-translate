# Notes

The goal is to get the mail content (text/html or fallback to test/plain) with the [`background.js`](background.js) script and show a banner at the top of the mail containing that translation ([`messageDisplay`](messageDisplay) directory).

The translation is made using the Gemini Flash 2.0 API. The user should [create a free API key](https://aistudio.google.com/apikey) and register it through the extension's [options](options/).

For now, the translation works well by clicking the "Translate" button and the result is logged in the console.

I don't know how to save toor get from the settings (options).

## Styling

The desktop app has some predefined css root variables whose names can be found in [colors.txt](colors.txt).
