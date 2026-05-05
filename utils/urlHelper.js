export function parseUrl(urlString) {
  return new URL(urlString);
}

export function hasParamValue(url, key, value) {
  return url.searchParams.get(key) === value;
}

export function setParamValue(url, key, value) {
  if (hasParamValue(url, key, value)) {
    return false;
  }

  url.searchParams.set(key, value);
  return true;
}

export function removeParam(url, key) {
  if (!url.searchParams.has(key)) {
    return false;
  }

  url.searchParams.delete(key);
  return true;
}

export function toggleParamValue(url, key, enabledValue) {
  if (hasParamValue(url, key, enabledValue)) {
    return removeParam(url, key);
  }

  return setParamValue(url, key, enabledValue);
}

export function enableInfoFromPA(url) {
  return setParamValue(url, 'infoFromPA', 'true');
}

export function isJcaDebugEnabled(url) {
  return hasParamValue(url, 'jcaDebug', '1');
}

export function enableJcaDebug(url) {
  return setParamValue(url, 'jcaDebug', '1');
}

export function disableJcaDebug(url) {
  return removeParam(url, 'jcaDebug');
}

export function toggleJcaDebug(url) {
  return toggleParamValue(url, 'jcaDebug', '1');
}

export function addWindchillParams(url, options = {}) {
  let changed = false;

  if (options.infoFromPA) {
    changed = enableInfoFromPA(url) || changed;
  }

  return changed;
}
