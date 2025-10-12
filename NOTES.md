# Notes

The goal is to get the mail content (text/html or fallback to test/plain) with the [`background.js`](background.js) script and show a banner at the top of the mail containing that translation ([`banner`](`banner`) directory).

The translation is made using the Gemini Flash 2.0 API. The user should [create a free API key](https://aistudio.google.com/apikey) and register it through the add-on's [options](options/).


## TODO

- [x] Get the app language and define it as language target for the Gemini translation.
- [x] Store persistantly the API key.
- [x] Add button to link to the settings.
- [x] Show the banner with loading message while translation is occuring.
- [ ] Add close banner button (just hide, and just show if translation asked again, no requery API).
