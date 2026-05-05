export function parseUrl(urlString) {
  return new URL(urlString);
}

function getHashQueryParts(url) {
  const rawHash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
  const queryIndex = rawHash.indexOf('?');

  if (queryIndex === -1) {
    return {
      hashPath: rawHash,
      searchParams: new URLSearchParams(),
    };
  }

  return {
    hashPath: rawHash.slice(0, queryIndex),
    searchParams: new URLSearchParams(rawHash.slice(queryIndex + 1)),
  };
}

function setHashQueryParts(url, hashPath, searchParams) {
  const hashQuery = searchParams.toString();

  if (hashPath || hashQuery) {
    url.hash = hashQuery ? `${hashPath}?${hashQuery}` : hashPath;
    return;
  }

  url.hash = '';
}

function getParamValue(url, key) {
  return url.searchParams.get(key);
}

export function hasParamValue(url, key, value) {
  return getParamValue(url, key) === value;
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

export function hasHashParamValue(url, key, value) {
  const { searchParams } = getHashQueryParts(url);
  return searchParams.get(key) === value;
}

function getHashParamValue(url, key) {
  const { searchParams } = getHashQueryParts(url);
  return searchParams.get(key);
}

export function setHashParamValue(url, key, value) {
  if (hasHashParamValue(url, key, value)) {
    return false;
  }

  const { hashPath, searchParams } = getHashQueryParts(url);
  searchParams.set(key, value);
  setHashQueryParts(url, hashPath, searchParams);
  return true;
}

export function removeHashParam(url, key) {
  const { hashPath, searchParams } = getHashQueryParts(url);

  if (!searchParams.has(key)) {
    return false;
  }

  searchParams.delete(key);
  setHashQueryParts(url, hashPath, searchParams);
  return true;
}

export function enableInfoFromPA(url) {
  const removedFromOuterQuery = removeParam(url, 'infoFromPA');
  const addedToHashQuery = setHashParamValue(url, 'infoFromPA', 'true');

  return removedFromOuterQuery || addedToHashQuery;
}

export function isInfoFromPAEnabled(url) {
  return getParamValue(url, 'infoFromPA') === 'true' || getHashParamValue(url, 'infoFromPA') === 'true';
}

export function disableInfoFromPA(url) {
  const removedFromOuterQuery = removeParam(url, 'infoFromPA');
  const removedFromHashQuery = removeHashParam(url, 'infoFromPA');

  return removedFromOuterQuery || removedFromHashQuery;
}

export function isJcaDebugEnabled(url) {
  const outerValue = getParamValue(url, 'jcaDebug');
  const hashValue = getHashParamValue(url, 'jcaDebug');

  return (
    outerValue === 'true' ||
    outerValue === '1' ||
    hashValue === 'true' ||
    hashValue === '1'
  );
}

export function enableJcaDebug(url) {
  const removedFromOuterQuery = removeParam(url, 'jcaDebug');
  const addedToHashQuery = setHashParamValue(url, 'jcaDebug', 'true');

  return removedFromOuterQuery || addedToHashQuery;
}

export function disableJcaDebug(url) {
  const removedFromOuterQuery = removeParam(url, 'jcaDebug');
  const removedFromHashQuery = removeHashParam(url, 'jcaDebug');

  return removedFromOuterQuery || removedFromHashQuery;
}

export function toggleJcaDebug(url) {
  if (isJcaDebugEnabled(url)) {
    return disableJcaDebug(url);
  }

  return enableJcaDebug(url);
}

export function addWindchillParams(url, options = {}) {
  let changed = false;

  if (options.infoFromPA) {
    changed = enableInfoFromPA(url) || changed;
  }

  return changed;
}
