const storageKey = 'smart-sender.fingerprint';

export function getFingerprint(): string {
  const saved = localStorage.getItem(storageKey);

  if (saved && /^[a-f0-9]{32}$/.test(saved)) {
    return saved;
  }

  const fingerprint = crypto.randomUUID().replaceAll('-', '');
  localStorage.setItem(storageKey, fingerprint);
  return fingerprint;
}
