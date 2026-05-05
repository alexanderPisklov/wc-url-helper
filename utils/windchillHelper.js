export function isWindchillUrl(url) {
  return url.pathname.toLowerCase().includes('/windchill/');
}

export function isWindchillUserOrGroupUrl(url) {
  if (!url) {
    return false;
  }

  const oidPattern = /^OR:wt\.org\.(WTUser|WTGroup):\d+$/;

  try {
    const parsedUrl = typeof url === 'string' ? new URL(url) : url;
    const directOid = parsedUrl.searchParams.get('oid');

    if (directOid && oidPattern.test(decodeURIComponent(directOid))) {
      return true;
    }

    const hash = parsedUrl.hash.startsWith('#') ? parsedUrl.hash.slice(1) : parsedUrl.hash;
    const queryIndex = hash.indexOf('?');

    if (queryIndex !== -1) {
      const hashParams = new URLSearchParams(hash.slice(queryIndex + 1));
      const hashOid = hashParams.get('oid');

      if (hashOid && oidPattern.test(decodeURIComponent(hashOid))) {
        return true;
      }
    }
  } catch (_error) {
    // Fall back to regex checks below.
  }

  const rawUrl = typeof url === 'string' ? url : url.href;

  try {
    const decodedUrl = decodeURIComponent(rawUrl);
    if (/[?&]oid=OR:wt\.org\.(WTUser|WTGroup):\d+/i.test(decodedUrl)) {
      return true;
    }
  } catch (_decodeError) {
    // Fall back to raw URL regex below.
  }

  return /[?&]oid=OR(?:%3A|:)wt\.org\.(WTUser|WTGroup)(?:%3A|:)\d+/i.test(rawUrl);
}
