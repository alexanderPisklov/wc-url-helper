export function parseUrl(urlString) {
  return new URL(urlString);
}

export function isJcaDebugEnabled(url) {
  return url.searchParams.get('jcaDebug') === '1';
}

export function enableJcaDebug(url) {
  if (isJcaDebugEnabled(url)) {
    return false;
  }

  url.searchParams.set('jcaDebug', '1');
  return true;
}

export function disableJcaDebug(url) {
  if (!url.searchParams.has('jcaDebug')) {
    return false;
  }

  url.searchParams.delete('jcaDebug');
  return true;
}

export function toggleJcaDebug(url) {
  if (isJcaDebugEnabled(url)) {
    return disableJcaDebug(url);
  }

  return enableJcaDebug(url);
}

export function addWindchillParams(url, options = {}) {
  let changed = false;

  if (options.infoFromPA && url.searchParams.get('infoFromPA') !== 'true') {
    url.searchParams.set('infoFromPA', 'true');
    changed = true;
  }

  return changed;
}
