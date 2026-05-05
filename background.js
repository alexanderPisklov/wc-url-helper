import { parseUrl, toggleJcaDebug } from './utils/urlHelper.js';
import { isWindchillUrl } from './utils/windchillHelper.js';

const MENU_IDS = {
  toggleJcaDebug: 'toggle-jca-debug',
};

function logRuntimeError(context) {
  if (!chrome.runtime.lastError) {
    return;
  }

  console.warn(`${context}: ${chrome.runtime.lastError.message}`);
}

function createContextMenus() {
  chrome.contextMenus.removeAll(() => {
    logRuntimeError('Failed to clear existing context menus');

    chrome.contextMenus.create({
      id: MENU_IDS.toggleJcaDebug,
      title: 'Toggle jcaDebug mode',
      contexts: ['page'],
    });

    logRuntimeError('Failed to create Toggle jcaDebug mode menu item');
  });
}

function handleToggleJcaDebug(tab) {
  if (!tab || typeof tab.id !== 'number') {
    console.warn('Failed to toggle jcaDebug: current tab is unavailable.');
    return;
  }

  if (!tab.url) {
    console.warn('Failed to toggle jcaDebug: current tab has no URL.');
    return;
  }

  let url;
  try {
    url = parseUrl(tab.url);
  } catch (error) {
    console.warn(`Failed to toggle jcaDebug: invalid URL. ${error.message}`);
    return;
  }

  if (!isWindchillUrl(url)) {
    console.warn('Failed to toggle jcaDebug: current tab is not a Windchill page.');
    return;
  }

  const changed = toggleJcaDebug(url);

  if (!changed) {
    console.info('Nothing to change: jcaDebug is already in the requested state.');
    return;
  }

  chrome.tabs.update(tab.id, { url: url.toString() }, () => {
    logRuntimeError('Failed to update tab after toggling jcaDebug');
  });
}

chrome.runtime.onInstalled.addListener(() => {
  createContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
  createContextMenus();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === MENU_IDS.toggleJcaDebug) {
    handleToggleJcaDebug(tab);
  }
});
