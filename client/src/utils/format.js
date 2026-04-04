export function money(amountMinor, currency) {
  return `${currency} ${(Number(amountMinor || 0) / 100).toFixed(2)}`;
}

export function formatDateTime(value) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

