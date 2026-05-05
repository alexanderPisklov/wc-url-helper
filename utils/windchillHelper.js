export function isWindchillUrl(url) {
  return url.pathname.toLowerCase().includes('/windchill/');
}
