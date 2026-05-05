export function buildJiraString(_data) {
  return '';
}

export function normalizeObjectReference(value) {
  return String(value || '').replace(/%3A/gi, ':');
}
