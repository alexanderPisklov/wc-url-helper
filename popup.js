import {
  addWindchillParams,
  disableJcaDebug,
  enableJcaDebug,
  isJcaDebugEnabled,
  parseUrl,
} from './utils/urlHelper.js';
import { isWindchillUrl } from './utils/windchillHelper.js';

const AUTO_USER_GROUP_INFO_KEY = 'autoUserGroupInfo';

document.addEventListener('DOMContentLoaded', () => {
  const infoFromPACheckbox = document.getElementById('infoFromPA');
  const autoUserGroupInfoCheckbox = document.getElementById('autoUserGroupInfo');
  const jcaDebugCheckbox = document.getElementById('jcaDebug');
  const applyBtn = document.getElementById('applyBtn');
  const statusEl = document.getElementById('status');

  function setStatus(text) {
    statusEl.textContent = text || '';
  }

  function withActiveTab(onTabReady) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        setStatus(
          'Failed to get the active tab: ' + chrome.runtime.lastError.message,
        );
        return;
      }

      if (!tabs || !tabs.length) {
        setStatus('Failed to get the active tab.');
        return;
      }

      onTabReady(tabs[0]);
    });
  }

  function syncPopupState() {
    chrome.storage.local.get([AUTO_USER_GROUP_INFO_KEY], (result) => {
      if (chrome.runtime.lastError) {
        setStatus(
          'Failed to load popup settings: ' + chrome.runtime.lastError.message,
        );
        return;
      }

      autoUserGroupInfoCheckbox.checked = Boolean(result[AUTO_USER_GROUP_INFO_KEY]);
    });

    withActiveTab((tab) => {
      if (!tab.url) {
        setStatus('The current tab has no URL.');
        return;
      }

      try {
        const url = parseUrl(tab.url);

        if (!isWindchillUrl(url)) {
          setStatus('The current tab does not look like a Windchill page.');
          return;
        }

        jcaDebugCheckbox.checked = isJcaDebugEnabled(url);
      } catch (error) {
        setStatus('Invalid URL: ' + error.message);
      }
    });
  }

  function getSelectedOptions() {
    return {
      infoFromPA: infoFromPACheckbox.checked,
    };
  }

  function handleApplyClick() {
    setStatus('');

    withActiveTab((tab) => {
      const urlString = tab.url;

      if (!urlString) {
        setStatus('The current tab has no URL.');
        return;
      }

      let url;
      try {
        url = parseUrl(urlString);
      } catch (error) {
        setStatus('Invalid URL: ' + error.message);
        return;
      }

      if (!isWindchillUrl(url)) {
        setStatus('The current tab does not look like a Windchill page.');
        return;
      }

      let changed = addWindchillParams(url, getSelectedOptions());

      if (jcaDebugCheckbox.checked) {
        changed = enableJcaDebug(url) || changed;
      } else {
        changed = disableJcaDebug(url) || changed;
      }

      if (!changed) {
        setStatus('Nothing to change: the parameters are already set.');
        return;
      }

      if (typeof tab.id !== 'number') {
        setStatus('Failed to determine the current tab ID.');
        return;
      }

      chrome.tabs.update(tab.id, { url: url.toString() }, () => {
        if (chrome.runtime.lastError) {
          setStatus('Failed to update the tab: ' + chrome.runtime.lastError.message);
          return;
        }

        setStatus('URL updated.');
      });
    });
  }

  function handleAutoUserGroupInfoChange() {
    const enabled = autoUserGroupInfoCheckbox.checked;

    chrome.storage.local.set({ [AUTO_USER_GROUP_INFO_KEY]: enabled }, () => {
      if (chrome.runtime.lastError) {
        setStatus(
          'Failed to save popup settings: ' + chrome.runtime.lastError.message,
        );
        autoUserGroupInfoCheckbox.checked = !enabled;
        return;
      }

      chrome.runtime.sendMessage(
        {
          type: 'auto-user-group-info-changed',
          enabled,
        },
        () => {
          if (chrome.runtime.lastError) {
            setStatus(
              'Auto mode saved, but background sync failed: ' +
                chrome.runtime.lastError.message,
            );
            return;
          }

          setStatus(
            enabled
              ? 'Auto User/Group info enabled.'
              : 'Auto User/Group info disabled.',
          );
        },
      );
    });
  }

  syncPopupState();
  applyBtn.addEventListener('click', handleApplyClick);
  autoUserGroupInfoCheckbox.addEventListener('change', handleAutoUserGroupInfoChange);
});
