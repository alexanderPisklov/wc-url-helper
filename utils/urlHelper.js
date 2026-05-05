export function parseUrl(urlString) {
  return new URL(urlString);
}

export function addWindchillParams(url, options = {}) {
  let changed = false;

  if (options.infoFromPA && url.searchParams.get('infoFromPA') !== 'true') {
    url.searchParams.set('infoFromPA', 'true');
    changed = true;
  }

  if (options.jcaDebug && url.searchParams.get('jcaDebug') !== '1') {
    url.searchParams.set('jcaDebug', '1');
    changed = true;
  }

  return changed;
}
