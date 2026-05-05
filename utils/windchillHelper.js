export function isWindchillUrl(url) {
  return url.pathname.toLowerCase().includes('/windchill/');
}

export function isWindchillUserOrGroupUrl(url) {
  const href = url.href.toLowerCase();
  return href.includes('wtuser') || href.includes('wtgroup');
}
