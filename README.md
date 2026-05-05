# wc-url-helper

Chrome extension MV3 for working with Windchill URLs.

## What It Does

The extension adds the following query parameters to the current Windchill tab:

- `infoFromPA=true`
- `jcaDebug=1`

If a parameter is already present with the expected value, it is not changed.

## Current Behavior

- Works from the popup UI
- Checks that the current tab looks like a Windchill URL
- Updates the active tab URL in place
- Shows status messages for success, no-op, invalid URL, non-Windchill pages, and Chrome API errors

## Project Structure

- `popup.js` - thin coordinator for popup events, status updates, and `chrome.tabs.*`
- `utils/urlHelper.js` - URL parsing and query param updates
- `utils/windchillHelper.js` - Windchill-specific URL checks
- `features/copyHelper.js` - stubs for future OR/VR/Jira helpers

## Install Locally

1. Open `chrome://extensions/`
2. Enable `Developer mode`
3. Click `Load unpacked`
4. Select this project folder

## Usage

1. Open a Windchill page
2. Open the extension popup
3. Choose which parameters to apply
4. Click the apply button

## Planned Next Steps

- Copy OR
- Copy VR
- Build Jira-friendly object details
