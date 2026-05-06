# Windchill Helper

Windchill Helper is a Manifest V3 Chrome extension for everyday PTC Windchill work. It adds focused URL and copy actions for engineers, developers, administrators, and power users who frequently inspect Windchill object pages.

## Features

- Copy OR references from Windchill object URLs.
- Copy VR references from Windchill object URLs.
- Copy cleaned object title and current object URL.
- Toggle `jcaDebug=true` on supported Windchill pages.
- Add or remove `infoFromPA=true` from supported Windchill URLs.
- Enable extended WTUser / WTGroup information when the current object is a user or group.
- Restrict context menu actions to Windchill pages.
- Provide a compact Windchill-inspired popup UI for common URL toggles.

## Usage

Open a Windchill page and use the extension popup to manage URL toggles for `infoFromPA=true` and `jcaDebug=true`. Toggle changes are applied to the active tab URL when the current page is recognized as a Windchill page.

Right-click on a Windchill page to open the Windchill Helper context menu. Available actions include copying OR references, copying VR references, copying object info with the current URL, enabling Full User/Group info, and toggling jcaDebug mode.

Context menu actions are only shown for URLs matching Windchill paths. WTUser / WTGroup-specific actions are intentionally restricted to user and group object pages.

Some object references depend on how Windchill renders the current page. Copy OR works best on object pages where the OR reference is present in the URL or page structure; for some parts, the Details tab may expose the needed reference more reliably.

## Screenshots

![Popup UI](docs/screenshots/popup.png)

![Context Menu](docs/screenshots/context-menu.png)

## Installation

Chrome Web Store link: _pending_.

For local installation:

1. Open `chrome://extensions/`.
2. Enable `Developer mode`.
3. Select `Load unpacked`.
4. Choose this repository folder.

## Development

This extension uses Chrome Extension Manifest V3.

- `manifest.json` defines permissions, icons, popup configuration, and the service worker.
- `background.js` owns context menu registration and URL-changing actions.
- `popup.js` manages popup state and toggle behavior.
- `utils/urlHelper.js` contains URL parsing and query/hash parameter helpers.
- `utils/windchillHelper.js` contains Windchill URL and WTUser / WTGroup detection.
- `utils/contextMenuCopy.js` contains context menu copy extraction and notification logic.

## Notes

- Designed for common Windchill workflows and object page URLs.
- Tested primarily against typical Windchill URL shapes, including hash-based object pages.
- Some features depend on object type, page structure, and whether Windchill exposes OR or VR references on the current page.
- The extension does not modify Windchill server data; it only updates browser URLs and copies text to the clipboard.

## License

MIT License. Permission is granted to use, copy, modify, merge, publish, distribute, sublicense, and sell copies of this software, subject to inclusion of the copyright and permission notice.
