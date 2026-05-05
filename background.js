import { enableInfoFromPA, parseUrl, toggleJcaDebug } from './utils/urlHelper.js';
import { isWindchillUrl } from './utils/windchillHelper.js';

const MENU_IDS = {
  root: 'windchill-helper',
  fullUserGroupInfo: 'full-user-group-info',
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
      id: MENU_IDS.root,
      title: 'Windchill Helper',
      contexts: ['page'],
    });

    logRuntimeError('Failed to create Windchill Helper menu');

    chrome.contextMenus.create({
      id: MENU_IDS.fullUserGroupInfo,
      parentId: MENU_IDS.root,
      title: 'Full User/Group info',
      contexts: ['page'],
    });

    logRuntimeError('Failed to create Full User/Group info menu item');

    chrome.contextMenus.create({
      id: MENU_IDS.toggleJcaDebug,
      parentId: MENU_IDS.root,
      title: 'Toggle jcaDebug mode',
      contexts: ['page'],
    });

    logRuntimeError('Failed to create Toggle jcaDebug mode menu item');
  });
}

function withWindchillTab(tab, actionName, onUrlReady) {
  if (!tab || typeof tab.id !== 'number') {
    console.warn(`Failed to ${actionName}: current tab is unavailable.`);
    return;
  }

  if (!tab.url) {
    console.warn(`Failed to ${actionName}: current tab has no URL.`);
    return;
  }

  let url;
  try {
    url = parseUrl(tab.url);
  } catch (error) {
    console.warn(`Failed to ${actionName}: invalid URL. ${error.message}`);
    return;
  }

  if (!isWindchillUrl(url)) {
    console.warn(`Failed to ${actionName}: current tab is not a Windchill page.`);
    return;
  }

  onUrlReady(url, tab.id);
}

function updateTabUrl(tabId, url, errorContext) {
  chrome.tabs.update(tabId, { url: url.toString() }, () => {
    logRuntimeError(errorContext);
  });
}

function handleFullUserGroupInfo(tab) {
  withWindchillTab(tab, 'enable Full User/Group info', (url, tabId) => {
    const changed = enableInfoFromPA(url);

    if (!changed) {
      console.info('Nothing to change: infoFromPA is already enabled.');
      return;
    }

    updateTabUrl(tabId, url, 'Failed to update tab after enabling Full User/Group info');
  });
}

function handleToggleJcaDebug(tab) {
  withWindchillTab(tab, 'toggle jcaDebug', (url, tabId) => {
    const changed = toggleJcaDebug(url);

    if (!changed) {
      console.info('Nothing to change: jcaDebug is already in the requested state.');
      return;
    }

    updateTabUrl(tabId, url, 'Failed to update tab after toggling jcaDebug');
    return;
  });
}

chrome.runtime.onInstalled.addListener(() => {
  createContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
  createContextMenus();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === MENU_IDS.fullUserGroupInfo) {
    handleFullUserGroupInfo(tab);
  }

  if (info.menuItemId === MENU_IDS.toggleJcaDebug) {
    handleToggleJcaDebug(tab);
  }
});
