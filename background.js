import { enableInfoFromPA, parseUrl, toggleJcaDebug } from './utils/urlHelper.js';
import { COPY_MENU_IDS, handleCopyContextMenuClick } from './utils/contextMenuCopy.js';
import {
  isWindchillUrl,
  isWindchillUserOrGroupUrl,
} from './utils/windchillHelper.js';

const MENU_IDS = {
  root: 'windchill-helper',
  copyOr: COPY_MENU_IDS.copyOr,
  copyVr: COPY_MENU_IDS.copyVr,
  copyInfo: COPY_MENU_IDS.copyInfo,
  fullUserGroupInfo: 'full-user-group-info',
  toggleJcaDebug: 'toggle-jca-debug',
};
const AUTO_USER_GROUP_INFO_KEY = 'autoUserGroupInfo';
const FULL_USER_GROUP_INFO_SKIPPED_MESSAGE =
  'Windchill Helper: Full User/Group info skipped \u2014 current page is not WTUser or WTGroup.';

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
      contexts: ['page', 'selection', 'link'],
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
      id: MENU_IDS.copyOr,
      parentId: MENU_IDS.root,
      title: 'Copy OR',
      contexts: ['page', 'selection', 'link'],
    });

    logRuntimeError('Failed to create Copy OR menu item');

    chrome.contextMenus.create({
      id: MENU_IDS.copyVr,
      parentId: MENU_IDS.root,
      title: 'Copy VR',
      contexts: ['page', 'selection', 'link'],
    });

    logRuntimeError('Failed to create Copy VR menu item');

    chrome.contextMenus.create({
      id: MENU_IDS.copyInfo,
      parentId: MENU_IDS.root,
      title: 'Copy Info',
      contexts: ['page', 'selection', 'link'],
    });

    logRuntimeError('Failed to create Copy Info menu item');

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

function isAutoUserGroupInfoEnabled(callback) {
  chrome.storage.local.get([AUTO_USER_GROUP_INFO_KEY], (result) => {
    if (chrome.runtime.lastError) {
      console.warn(
        'Failed to load Auto User/Group info setting: ' +
          chrome.runtime.lastError.message,
      );
      callback(false);
      return;
    }

    callback(Boolean(result[AUTO_USER_GROUP_INFO_KEY]));
  });
}

function tryEnableAutoUserGroupInfoForTab(tab) {
  isAutoUserGroupInfoEnabled((enabled) => {
    if (!enabled) {
      return;
    }

    withWindchillTab(tab, 'enable Auto User/Group info', (url, tabId) => {
      if (!isWindchillUserOrGroupUrl(url)) {
        console.log(FULL_USER_GROUP_INFO_SKIPPED_MESSAGE);
        return;
      }

      const changed = enableInfoFromPA(url);

      if (!changed) {
        return;
      }

      updateTabUrl(tabId, url, 'Failed to update tab after enabling Auto User/Group info');
    });
  });
}

function handleFullUserGroupInfo(tab) {
  withWindchillTab(tab, 'enable Full User/Group info', (url, tabId) => {
    if (!isWindchillUserOrGroupUrl(url)) {
      console.log(FULL_USER_GROUP_INFO_SKIPPED_MESSAGE);
      return;
    }

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
  });
}

chrome.runtime.onInstalled.addListener(() => {
  createContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
  createContextMenus();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (
    info.menuItemId === MENU_IDS.copyOr ||
    info.menuItemId === MENU_IDS.copyVr ||
    info.menuItemId === MENU_IDS.copyInfo
  ) {
    handleCopyContextMenuClick(info, tab);
    return;
  }

  if (info.menuItemId === MENU_IDS.fullUserGroupInfo) {
    handleFullUserGroupInfo(tab);
  }

  if (info.menuItemId === MENU_IDS.toggleJcaDebug) {
    handleToggleJcaDebug(tab);
  }
});

chrome.contextMenus.onShown.addListener((_info, tab) => {
  const visible = Boolean(tab?.url && isWindchillUrl(tab.url));

  for (const menuId of Object.values(MENU_IDS)) {
    chrome.contextMenus.update(menuId, { visible }, () => {
      logRuntimeError(`Failed to update visibility for menu item "${menuId}"`);
    });
  }

  chrome.contextMenus.refresh();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!changeInfo.url) {
    return;
  }

  tryEnableAutoUserGroupInfoForTab({
    ...tab,
    id: tabId,
    url: changeInfo.url,
  });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'auto-user-group-info-changed') {
    return;
  }

  if (!message.enabled) {
    sendResponse({ ok: true });
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (chrome.runtime.lastError) {
      console.warn(
        'Failed to get the active tab for Auto User/Group info: ' +
          chrome.runtime.lastError.message,
      );
      sendResponse({ ok: false });
      return;
    }

    if (!tabs || !tabs.length) {
      sendResponse({ ok: true });
      return;
    }

    tryEnableAutoUserGroupInfoForTab(tabs[0]);
    sendResponse({ ok: true });
  });

  return true;
});
