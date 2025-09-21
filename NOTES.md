# Notes

The goal is to get the mail content (text/html or fallback to test/plain) with the [`background.js`](background.js) script and show a banner at the top of the mail containing that translation ([`messageDisplay`](messageDisplay) directory).

The translation is made using the Gemini Flash 2.0 API. The user should [create a free API key](https://aistudio.google.com/apikey) and register it through the extension's [options](options/).

The storage of the API key is non-persistant and isn't kept between app restarts.

## Styling

The desktop app has some predefined css root variables whose names can be found in [colors.txt](colors.txt).

## TODO

- [x] Get the app language and define it as language target for the Gemini translation.
- [ ] Store persistantly the API key.
- [ ] Show the banner with loading message while translation is occuring.
- [ ] Add close banner button (just hide, and just show if translation asked again, no requery API).
