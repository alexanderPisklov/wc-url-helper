import { addWindchillParams, parseUrl } from './utils/urlHelper.js';
import { isWindchillUrl } from './utils/windchillHelper.js';

document.addEventListener('DOMContentLoaded', () => {
  const infoFromPACheckbox = document.getElementById('infoFromPA');
  const jcaDebugCheckbox = document.getElementById('jcaDebug');
  const applyBtn = document.getElementById('applyBtn');
  const statusEl = document.getElementById('status');

  function setStatus(text) {
    statusEl.textContent = text || '';
  }

  function getSelectedOptions() {
    return {
      infoFromPA: infoFromPACheckbox.checked,
      jcaDebug: jcaDebugCheckbox.checked,
    };
  }

  function handleApplyClick() {
    setStatus('');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        setStatus(
          '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c ' +
            '\u043f\u043e\u043b\u0443\u0447\u0438\u0442\u044c ' +
            '\u0430\u043a\u0442\u0438\u0432\u043d\u0443\u044e ' +
            '\u0432\u043a\u043b\u0430\u0434\u043a\u0443: ' +
            chrome.runtime.lastError.message,
        );
        return;
      }

      if (!tabs || !tabs.length) {
        setStatus(
          '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c ' +
            '\u043f\u043e\u043b\u0443\u0447\u0438\u0442\u044c ' +
            '\u0430\u043a\u0442\u0438\u0432\u043d\u0443\u044e ' +
            '\u0432\u043a\u043b\u0430\u0434\u043a\u0443.',
        );
        return;
      }

      const tab = tabs[0];
      const urlString = tab.url;

      if (!urlString) {
        setStatus('\u0423 \u0432\u043a\u043b\u0430\u0434\u043a\u0438 \u043d\u0435\u0442 URL.');
        return;
      }

      let url;
      try {
        url = parseUrl(urlString);
      } catch (error) {
        setStatus(
          '\u041d\u0435\u043a\u043e\u0440\u0440\u0435\u043a\u0442\u043d\u044b\u0439 URL: ' +
            error.message,
        );
        return;
      }

      if (!isWindchillUrl(url)) {
        setStatus(
          '\u0422\u0435\u043a\u0443\u0449\u0430\u044f ' +
            '\u0432\u043a\u043b\u0430\u0434\u043a\u0430 ' +
            '\u043d\u0435 \u043f\u043e\u0445\u043e\u0436\u0430 ' +
            '\u043d\u0430 Windchill.',
        );
        return;
      }

      const changed = addWindchillParams(url, getSelectedOptions());

      if (!changed) {
        setStatus(
          '\u041d\u0435\u0447\u0435\u0433\u043e \u043c\u0435\u043d\u044f\u0442\u044c: ' +
            '\u043f\u0430\u0440\u0430\u043c\u0435\u0442\u0440\u044b ' +
            '\u0443\u0436\u0435 \u0441\u0442\u043e\u044f\u0442.',
        );
        return;
      }

      if (typeof tab.id !== 'number') {
        setStatus(
          '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c ' +
            '\u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0438\u0442\u044c ID ' +
            '\u0432\u043a\u043b\u0430\u0434\u043a\u0438.',
        );
        return;
      }

      chrome.tabs.update(tab.id, { url: url.toString() }, () => {
        if (chrome.runtime.lastError) {
          setStatus(
            '\u041e\u0448\u0438\u0431\u043a\u0430 ' +
              '\u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u044f ' +
              '\u0432\u043a\u043b\u0430\u0434\u043a\u0438: ' +
              chrome.runtime.lastError.message,
          );
          return;
        }

        setStatus('URL \u043e\u0431\u043d\u043e\u0432\u043b\u0451\u043d.');
      });
    });
  }

  applyBtn.addEventListener('click', handleApplyClick);
});
