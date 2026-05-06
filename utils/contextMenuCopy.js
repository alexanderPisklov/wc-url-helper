import { isWindchillUrl } from './windchillHelper.js';

const NOTIFICATION_TITLE = 'Windchill Helper';

export const COPY_MENU_IDS = {
  copyOr: 'windchill-copy-or',
  copyVr: 'windchill-copy-vr',
  copyInfo: 'windchill-copy-info',
};

export async function handleCopyContextMenuClick(info, tab) {
  if (!Object.values(COPY_MENU_IDS).includes(info.menuItemId)) {
    return false;
  }

  if (!tab || typeof tab.id !== 'number') {
    return true;
  }

  try {
    if (!tab.url) {
      await notify(NOTIFICATION_TITLE, 'This is not a Windchill page.');
      return true;
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(tab.url);
    } catch (_error) {
      parsedUrl = null;
    }

    if (!parsedUrl || !isWindchillUrl(parsedUrl)) {
      await notify(NOTIFICATION_TITLE, 'This is not a Windchill page.');
      return true;
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractCurrentObjectData,
    });

    const payload = results && results[0] ? results[0].result : null;
    if (!payload || !payload.data) {
      await notify(NOTIFICATION_TITLE, 'Failed to read page data.');
      return true;
    }

    const data = payload.data;
    let textToCopy = null;
    let errorMessage = null;

    if (info.menuItemId === COPY_MENU_IDS.copyOr) {
      if (data.orRef) {
        textToCopy = data.orRef;
      } else if (data.type === 'wt.part.WTPart') {
        errorMessage = 'OR not found on this tab. Try Details tab.';
      } else {
        errorMessage = 'OR not found.';
      }
    } else if (info.menuItemId === COPY_MENU_IDS.copyVr) {
      if (data.vrRef) {
        textToCopy = data.vrRef;
      } else {
        errorMessage = 'VR not found.';
      }
    } else if (info.menuItemId === COPY_MENU_IDS.copyInfo) {
      textToCopy = data.copyInfoText || '';
    }

    if (errorMessage) {
      await notify(NOTIFICATION_TITLE, errorMessage);
      return true;
    }

    if (!textToCopy) {
      await notify(NOTIFICATION_TITLE, 'Nothing to copy.');
      return true;
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: copyTextToClipboard,
      args: [textToCopy],
    });

    await notify(NOTIFICATION_TITLE, 'Copied to clipboard.');
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    await notify(NOTIFICATION_TITLE, 'Error: ' + message);
  }

  return true;
}

function extractCurrentObjectData() {
  function decodeSafe(value) {
    try {
      return decodeURIComponent(value);
    } catch (_error) {
      return value;
    }
  }

  function getORFromUrl() {
    const url = decodeSafe(location.href);
    const match = url.match(/[?&#]oid=(OR:[A-Za-z0-9_.$]+:\d+)/i);
    return match ? match[1] : null;
  }

  function getVRFromUrl() {
    const url = decodeSafe(location.href);
    const match = url.match(/[?&#]oid=(VR:[A-Za-z0-9_.$]+:\d+)/i);
    return match ? match[1] : null;
  }

  function getTypeFromRef(ref) {
    if (!ref) {
      return null;
    }

    const match = ref.match(/^(?:OR|VR):([A-Za-z0-9_.$]+):\d+$/i);
    return match ? match[1] : null;
  }

  function getWTPartORFromDOM() {
    const all = document.querySelectorAll('*');
    let fallback = null;

    for (let index = 0; index < all.length; index += 1) {
      const element = all[index];
      if (!element.getAttributeNames) {
        continue;
      }

      const attrs = element.getAttributeNames();
      for (let attrIndex = 0; attrIndex < attrs.length; attrIndex += 1) {
        const attr = attrs[attrIndex];
        const raw = element.getAttribute(attr);
        if (!raw) {
          continue;
        }

        const value = decodeSafe(raw);
        let match = value.match(/[?&#]oid=(OR:wt\.part\.WTPart:\d+)/i);
        if (match) {
          return match[1];
        }

        match = value.match(/\boid=(OR:wt\.part\.WTPart:\d+)/i);
        if (match) {
          return match[1];
        }

        match = value.match(/partid=(OR:wt\.part\.WTPart:\d+)/i);
        if (match) {
          return match[1];
        }

        if (!fallback) {
          match = value.match(/\b(OR:wt\.part\.WTPart:\d+)/i);
          if (match) {
            fallback = match[1];
          }
        }
      }
    }

    return fallback;
  }

  function getCurrentObjectData() {
    let orRef = getORFromUrl();
    const vrRef = getVRFromUrl();
    const type = getTypeFromRef(orRef || vrRef);
    const title = document.title || '';
    const cleanedTitle = title.replace(/^[^-]+-\s*/, '').trim();
    const data = {
      url: location.href,
      type,
      orRef,
      vrRef,
      title,
      cleanedTitle,
    };

    if (!orRef && type === 'wt.part.WTPart') {
      orRef = getWTPartORFromDOM();
      data.orRef = orRef;
    }

    data.copyInfoText = buildCopyInfoText(data);
    return data;
  }

  function buildCopyInfoText(data) {
    const parts = [];

    if (data.cleanedTitle) {
      parts.push(data.cleanedTitle.trim());
    }

    if (data.url) {
      parts.push(data.url.trim());
    }

    return parts.join('\n');
  }

  return {
    data: getCurrentObjectData(),
    infoTextBuilderExists: true,
  };
}

async function copyTextToClipboard(text) {
  await navigator.clipboard.writeText(text);
}

async function notify(title, message) {
  try {
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon128.png',
      title,
      message,
    });
  } catch (_error) {
    console.error(title + ': ' + message);
  }
}
