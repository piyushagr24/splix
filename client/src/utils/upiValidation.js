export function normalizeUpiId(value) {
  return String(value || "").trim().toLowerCase();
}

export function isValidUpiId(value) {
  const upiId = normalizeUpiId(value);
  if (!upiId || upiId.includes(" ")) return false;

  const parts = upiId.split("@");
  if (parts.length !== 2) return false;

  const [handle, provider] = parts;
  if (!handle || !provider) return false;

  return /^[a-z0-9._-]+$/i.test(handle) && /^[a-z0-9.-]+$/i.test(provider);
}
